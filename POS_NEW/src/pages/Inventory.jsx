import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import InventoryCard from '../components/Inventory/InventoryCard';
import GroupedInventoryCard from '../components/Inventory/GroupedInventoryCard';
import ItemDetailModal from '../components/Inventory/ItemDetailModal';
import InventoryFilters from '../components/Inventory/InventoryFilters';
import FileUpload from '../components/Inventory/FileUpload';
import ImportPreview from '../components/Inventory/ImportPreview';
import AddItemModal from '../components/Inventory/AddItemModal';
import EditItemModal from '../components/Inventory/EditItemModal'; // Kept for consistency, though likely used inside ItemDetailModal or similar
import DeleteConfirmDialog from '../components/Inventory/DeleteConfirmDialog'; // Potentially used
import Toast from '../components/common/Toast';
import ScannerModal from '../components/Shared/ScannerModal';
import { groupInventoryItems, searchGroupedItems } from '../utils/groupingUtils';
import { getLowStockItems } from '../utils/stockAlerts';
import {
    parseExcelFile,
    autoDetectColumns,
    validateDataset,
    transformRowToItem,
    downloadSampleTemplate,
} from '../utils/excelParser';
import { generateQRCodesForItems } from '../utils/qrCode';

export default function Inventory() {
    const { inventory, loading, addItem, updateItem, deleteItem, bulkAddItems, bulkDeleteItems } = useInventory();
    const { settings } = useSettings();

    // Filter and search state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');
    const [filterBy, setFilterBy] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);

    // Bulk delete state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // Import state
    const [showImport, setShowImport] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [columnMapping, setColumnMapping] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    // Add Item state
    const [showAddItem, setShowAddItem] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Scanner Logic
    const handleScan = (decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            const itemId = data.id;
            const item = inventory.find(i => i.id === itemId);

            if (item) {
                // Determine if item is part of a group or standalone
                // For simplicity, we just open the detail modal directly for that item.
                // Our ItemDetailModal currently takes a specific item (variant).
                setSelectedItem(item);
                setIsScannerOpen(false); // Close scanner on success
            } else {
                alert('⚠️ Item not found in inventory');
            }
        } catch (e) {
            alert('⚠️ Invalid QR Code format');
        }
    };

    // Group inventory items and apply filters
    // ... (no change to useMemo hooks)
    const groupedInventory = useMemo(() => {
        // First, group all items
        let groups = groupInventoryItems(inventory);

        // Apply search if query exists
        if (searchQuery.trim()) {
            groups = searchGroupedItems(groups, searchQuery);
        }

        // Apply stock level filter to individual items within groups
        if (filterBy !== 'all') {
            const filteredGroups = {};

            Object.entries(groups).forEach(([groupKey, group]) => {
                let filteredVariants = group.variants;

                if (filterBy === 'in-stock') {
                    filteredVariants = filteredVariants.filter(item => item.quantity > 0);
                } else if (filterBy === 'low-stock') {
                    filteredVariants = filteredVariants.filter(
                        item => item.quantity < settings.lowStockThreshold && item.quantity > 0
                    );
                } else if (filterBy === 'critical') {
                    filteredVariants = filteredVariants.filter(
                        item => item.quantity < settings.criticalStockLevel && item.quantity > 0
                    );
                } else if (filterBy === 'out-of-stock') {
                    filteredVariants = filteredVariants.filter(item => item.quantity === 0);
                }

                if (filteredVariants.length > 0) {
                    filteredGroups[groupKey] = {
                        ...group,
                        variants: filteredVariants,
                    };
                }
            });

            groups = filteredGroups;
        }

        // Sort groups by base name
        const sortedGroups = Object.entries(groups).sort(([keyA, groupA], [keyB, groupB]) => {
            if (sortBy.startsWith('name')) {
                const comparison = groupA.baseName.localeCompare(groupB.baseName);
                return sortBy === 'name-desc' ? -comparison : comparison;
            }
            // For other sort options, we can enhance later
            return 0;
        });

        // Convert back to object
        return Object.fromEntries(sortedGroups);
    }, [inventory, searchQuery, sortBy, filterBy, settings]);

    // Calculate summary stats from grouped inventory
    const stats = useMemo(() => {
        // Flatten groups to get all items
        const allItems = Object.values(groupedInventory).flatMap(group => group.variants);

        return {
            totalItems: allItems.length,
            totalStock: allItems.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: allItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
            lowStock: allItems.filter((item) => item.quantity < settings.lowStockThreshold && item.quantity > 0).length,
        };
    }, [groupedInventory, settings]);

    // Calculate global low stock count for banner
    const globalLowStockCount = useMemo(() => {
        return getLowStockItems(inventory, settings.lowStockThreshold).length;
    }, [inventory, settings]);

    // Clear filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setSortBy('name-asc');
        setFilterBy('all');
    };

    const showClearButton = searchQuery || sortBy !== 'name-asc' || filterBy !== 'all';

    // Handler for adding new item
    const handleAddItem = async (newItem) => {
        await addItem(newItem);
        setShowAddItem(false);
    };

    // Handler for editing item
    const handleEditClick = (item) => {
        setSelectedItem(null); // Close detail modal
        setEditingItem(item); // Open edit modal
    };

    const handleEditSubmit = async (id, updatedItem) => {
        await updateItem(id, updatedItem);
        setEditingItem(null);
    };

    // Handler for deleting item
    const handleDeleteClick = (item) => {
        setSelectedItem(null); // Close detail modal
        setDeletingItem(item); // Open delete dialog
    };

    const handleDeleteConfirm = async () => {
        if (deletingItem) {
            await deleteItem(deletingItem.id);
            setDeletingItem(null);
        }
    };

    // Import handlers
    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    const handleProcessFile = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            const result = await parseExcelFile(selectedFile);

            if (result.success) {
                const detectedMapping = autoDetectColumns(result.headers);

                setParsedData(result);
                setColumnMapping(detectedMapping);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert('Failed to process file. Please try again.');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleColumnMappingChange = (field, value) => {
        setColumnMapping((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleConfirmImport = async () => {
        if (!parsedData) return;

        setIsProcessing(true);
        setProgress({ current: 0, total: parsedData.data.length });

        try {
            const validation = validateDataset(parsedData.data, columnMapping);

            if (validation.validCount === 0) {
                alert('No valid rows to import. Please check your data.');
                setIsProcessing(false);
                return;
            }

            // Transform rows to items (no IDs yet)
            const validItems = validation.validRows.map((row) =>
                transformRowToItem(row.row, columnMapping)
            );


            // Add items first to get FINAL IDs assigned by createInventoryItem
            const importedItems = await bulkAddItems(validItems);

            // Generate QR codes with the FINAL IDs
            await generateQRCodesForItems(importedItems, (progress) => {
                setProgress(progress);
            });

            // Update inventory with QR codes - do this synchronously
            // Get current inventory, update items with QR codes, then save
            const currentInventory = JSON.parse(localStorage.getItem('lelca_pos_inventory') || '[]');
            const updatedInventory = currentInventory.map(item => {
                const importedItem = importedItems.find(imp => imp.id === item.id);
                if (importedItem && importedItem.qrCode) {
                    return { ...item, qrCode: importedItem.qrCode };
                }
                return item;
            });
            localStorage.setItem('lelca_pos_inventory', JSON.stringify(updatedInventory));

            // Force re-render by updating context (this will trigger a re-fetch from localStorage)
            window.location.reload();

            alert(
                `Successfully imported ${validation.validCount} item(s)!${validation.invalidCount > 0
                    ? `\n${validation.invalidCount} row(s) were skipped due to errors.`
                    : ''
                }`
            );

            setShowImport(false);
            setSelectedFile(null);
            setParsedData(null);
            setColumnMapping({});
        } catch (error) {
            alert('Failed to import items. Please try again.');
            console.error(error);
        } finally {
            setIsProcessing(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    const handleCancelImport = () => {
        setShowImport(false);
        setSelectedFile(null);
        setParsedData(null);
        setColumnMapping({});
    };

    // Bulk delete handlers
    const handleToggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedItems([]);
    };

    const handleToggleSelect = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = () => {
        const deletedCount = bulkDeleteItems(selectedItems);
        setSelectedItems([]);
        setSelectionMode(false);
        setShowBulkDeleteConfirm(false);
        alert(`Successfully deleted ${deletedCount} item(s)!`);
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Inventory Management</h1>
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Low Stock Banner */}
            {globalLowStockCount > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg shadow-sm animate-fade-in flex items-center justify-between">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-bold">Warning:</span> You have {globalLowStockCount} items running low on stock.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Restock these items to avoid running out.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setFilterBy('low-stock')}
                        className="btn btn-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                    >
                        View Low Stock
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {Object.values(groupedInventory).flatMap(g => g.variants).length} of {inventory.length} items
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!selectionMode ? (
                        <>
                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 flex items-center gap-2"
                            >
                                📷 Scan Item
                            </button>
                            <button
                                onClick={() => setShowAddItem(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <span className="text-xl font-bold">+</span> Add Item
                            </button>
                            <button
                                onClick={handleToggleSelectionMode}
                                className="btn bg-red-100 text-red-700 hover:bg-red-200"
                            >
                                🗑️ Delete Multiple
                            </button>
                            <button
                                onClick={downloadSampleTemplate}
                                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                📥 Download Template
                            </button>
                            <button
                                onClick={() => setShowImport(!showImport)}
                                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            >
                                {showImport ? 'Hide Import' : '📤 Import from Excel'}
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-sm py-2 px-3 bg-primary-100 text-primary-700 rounded font-medium">
                                {selectedItems.length} selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedItems.length === 0}
                                className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🗑️ Delete Selected
                            </button>
                            <button
                                onClick={handleToggleSelectionMode}
                                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-sm text-gray-500 uppercase font-medium">Total Items</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalItems}</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-sm text-gray-500 uppercase font-medium">Total Stock</div>
                    <div className="text-3xl font-bold text-blue-600 mt-1">{stats.totalStock}</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-sm text-gray-500 uppercase font-medium">Total Value</div>
                    <div className="text-3xl font-bold text-green-600 mt-1">
                        GH₵{stats.totalValue.toFixed(2)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-sm text-gray-500 uppercase font-medium">Low Stock</div>
                    <div className={`text-3xl font-bold mt-1 ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.lowStock}
                    </div>
                </div>
            </div>

            {/* Import Section */}
            {showImport && !parsedData && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Import Items from Excel/CSV
                    </h2>

                    <FileUpload onFileSelect={handleFileSelect} />

                    {selectedFile && (
                        <div className="mt-4">
                            <button
                                onClick={handleProcessFile}
                                disabled={isProcessing}
                                className="btn btn-primary w-full md:w-auto"
                            >
                                {isProcessing ? 'Processing...' : 'Process File'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Import Preview */}
            {showImport && parsedData && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    {isProcessing && progress.total > 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">⏳</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Generating QR Codes...
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {progress.current} of {progress.total} ({progress.percentage}%)
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                                <div
                                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <ImportPreview
                            data={parsedData.data}
                            headers={parsedData.headers}
                            columnMapping={columnMapping}
                            onColumnMappingChange={handleColumnMappingChange}
                            onConfirmImport={handleConfirmImport}
                            onCancel={handleCancelImport}
                        />
                    )}
                </div>
            )}

            {/* Filters */}
            {inventory.length > 0 && (
                <InventoryFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    filterBy={filterBy}
                    onFilterChange={setFilterBy}
                    onClearFilters={handleClearFilters}
                    showClearButton={showClearButton}
                />
            )}

            {/* Inventory Grid or Empty State */}
            {inventory.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        No Items in Inventory Yet
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Get started by importing items from Excel or adding items manually
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setShowImport(true)}
                            className="btn btn-primary"
                        >
                            📤 Import from Excel
                        </button>
                    </div>
                </div>
            ) : Object.keys(groupedInventory).length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        No Items Match Your Search
                    </h2>
                    <p className="text-gray-500 mb-4">
                        No results for "{searchQuery}"
                    </p>
                    <button
                        onClick={handleClearFilters}
                        className="btn bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.values(groupedInventory).map((group) => (
                        <GroupedInventoryCard
                            key={group.normalizedName}
                            group={group}
                            onItemClick={setSelectedItem}
                            selectionMode={selectionMode}
                            selectedItems={selectedItems}
                            onToggleSelect={handleToggleSelect}
                        />
                    ))}
                </div>
            )}

            {/* Bulk Delete Confirmation Dialog */}
            {showBulkDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Bulk Delete</h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <strong>{selectedItems.length} item(s)</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowBulkDeleteConfirm(false)}
                                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="btn bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete {selectedItems.length} Item(s)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddItem && (
                <AddItemModal
                    onClose={() => setShowAddItem(false)}
                    onAdd={handleAddItem}
                />
            )}

            {/* Edit Item Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onUpdate={handleEditSubmit}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deletingItem && (
                <DeleteConfirmDialog
                    item={deletingItem}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            {/* Item Detail Modal */}
            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            )}

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                title="Scan Inventory Item"
            />
        </div>
    );
}
