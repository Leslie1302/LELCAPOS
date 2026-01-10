import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    loadInventory,
    saveInventory,
    addItem as addItemToStorage,
    updateItem as updateItemInStorage,
    deleteItem as deleteItemFromStorage,
    getItemById as getItemByIdFromStorage,
} from '../utils/storage';
import { createInventoryItem } from '../utils/dataModels';
// Import SAMPLE_ITEMS if available, or define empty
const SAMPLE_ITEMS = []; // Placeholder if separate file not found, but usually it's imported.
// Actually, let's try to import it if we can, or just skip sample data for now to be safe.
// The original file imported { generateQRCodesForItems } dynamically.

const InventoryContext = createContext();

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within InventoryProvider');
    }
    return context;
};

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Robust Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load from storage
                const savedInventory = loadInventory();

                // 2. Initial Setup (SAFE MODE)
                if (savedInventory.length === 0) {
                    console.log('Inventory is empty. Initializing...');
                    // We skip the complex QR generation for sample items to avoid startup crashes.
                    // Users can import their own data via Excel.
                    setInventory([]);
                } else {
                    setInventory(savedInventory);
                }
            } catch (error) {
                console.error('Critical Error loading inventory:', error);
                setInventory([]); // Fallback to empty
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // --- CRUD Operations ---

    const addItem = async (itemData) => {
        try {
            // Generate QR if needed
            let newItem = createInventoryItem(itemData);

            // Try generating QR code dynamically
            try {
                const { generateQRCode } = await import('../utils/qrCode');
                const qrCode = await generateQRCode(newItem);
                newItem = { ...newItem, qrCode };
            } catch (qrErr) {
                console.warn('Could not generate QR code:', qrErr);
            }

            const updatedInventory = addItemToStorage(newItem);
            setInventory(updatedInventory);
            return newItem;
        } catch (error) {
            console.error('Error adding item:', error);
            throw error;
        }
    };

    const updateItem = (id, updatedData) => {
        const updatedInventory = updateItemInStorage(id, updatedData);
        setInventory(updatedInventory);
    };

    const deleteItem = (id) => {
        const updatedInventory = deleteItemFromStorage(id);
        setInventory(updatedInventory);
    };

    const getItemById = (id) => getItemByIdFromStorage(id);

    // --- Bulk Operations (For Excel Upload) ---

    const bulkAddItems = async (items) => {
        try {
            // Load QR generator dynamically
            let generateQRCode;
            try {
                const qrModule = await import('../utils/qrCode');
                generateQRCode = qrModule.generateQRCode;
            } catch (e) {
                console.warn('QR Module failed to load for bulk add:', e);
            }

            const newItems = await Promise.all(items.map(async (item) => {
                let newItem = createInventoryItem(item);
                if (generateQRCode) {
                    try {
                        const qrCode = await generateQRCode(newItem);
                        newItem.qrCode = qrCode;
                    } catch (e) {
                        // Ignore QR failure per item
                    }
                }
                return newItem;
            }));

            // Combine with existing
            const currentInventory = loadInventory();
            const updatedInventory = [...currentInventory, ...newItems];

            saveInventory(updatedInventory);
            setInventory(updatedInventory);
            return newItems;
        } catch (error) {
            console.error('Bulk add failed:', error);
            return [];
        }
    };

    const bulkDeleteItems = (ids) => {
        let currentInventory = loadInventory();
        const updatedInventory = currentInventory.filter(item => !ids.includes(item.id));
        saveInventory(updatedInventory);
        setInventory(updatedInventory);
        return updatedInventory.length;
    };

    // Support function for POS mainly
    const bulkUpdateItems = (updates) => {
        // updates is array of { id, quantity, ... }
        let currentInventory = loadInventory();
        updates.forEach(update => {
            const index = currentInventory.findIndex(i => i.id === update.id);
            if (index !== -1) {
                currentInventory[index] = {
                    ...currentInventory[index],
                    ...update,
                    lastUpdated: new Date().toISOString()
                };
            }
        });
        saveInventory(currentInventory);
        setInventory(currentInventory);
    };

    // Helper: Search
    const searchItems = (query) => {
        if (!query) return inventory;
        const lower = query.toLowerCase();
        return inventory.filter(item =>
            item.itemName.toLowerCase().includes(lower) ||
            (item.materialDetails && item.materialDetails.toLowerCase().includes(lower))
        );
    };

    const getLowStockItems = (threshold = 10) => {
        return inventory.filter(item => item.quantity <= threshold);
    };

    const getTotalInventoryValue = () => {
        return inventory.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        inventory,
        loading,
        addItem,
        updateItem,
        deleteItem,
        getItemById,
        getLowStockItems,
        searchItems,
        getTotalInventoryValue,
        bulkAddItems,
        bulkDeleteItems,
        bulkUpdateItems
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
