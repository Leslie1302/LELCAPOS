import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import ScannerModal from '../Shared/ScannerModal';

export default function ProductGrid() {
    const { inventory, searchItems } = useInventory();
    const { addToCart, cartItems } = useCart();
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'low_stock'
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Scanner Logic
    const handleScan = (decodedText) => {
        try {
            // 1. Attempt to parse JSON
            const data = JSON.parse(decodedText);
            const itemId = data.id;

            // 2. Find Item
            const item = inventory.find(i => i.id === itemId);

            if (item) {
                // 3. Check Stock
                if (item.quantity > 0) {
                    addToCart(item);
                    // Play success sound if needed, or just visual feedback via UI
                    // Maybe show a toast
                    alert(`✅ Added ${item.itemName} to cart!`);
                } else {
                    alert(`❌ ${item.itemName} is Out of Stock`);
                }
            } else {
                alert('⚠️ Item not found in inventory');
            }
        } catch (e) {
            console.error(e);
            alert('⚠️ Invalid QR Code format');
        }
    };

    // Filter and Search Logic
    const filteredItems = useMemo(() => {
        let items = inventory;

        // 1. Search
        if (searchQuery.trim()) {
            // Use context search or local simple search
            const lowerQuery = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.itemName.toLowerCase().includes(lowerQuery) ||
                (item.materialDetails && item.materialDetails.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Filter (Optional categories in future, currently just All/Stock)
        // logic if needed

        return items;
    }, [inventory, searchQuery]);

    // Get item quantity in cart to show available stock correctly? 
    // Usually POS shows "Available in Stock" (overall). 
    // Optional: Show "X in cart" badge.

    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
            {/* Search Header */}
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="flex w-full">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Scanner Button */}
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="ml-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center justify-center"
                        title="Scan QR Code"
                    >
                        <span className="text-xl">📷</span>
                        <span className="hidden md:inline ml-2 font-medium">Scan</span>
                    </button>
                </div>

                {/* Visual feedback for results count */}
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>{filteredItems.length} products found</span>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                        <span className="text-4xl mb-2">🔍</span>
                        <p>No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <POSItemCard
                                key={item.id}
                                item={item}
                                onAdd={() => addToCart(item)}
                                lowStockThreshold={settings.lowStockThreshold}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                title="Scan Product"
            />
        </div>
    );
}

function POSItemCard({ item, onAdd, lowStockThreshold }) {
    const isOutOfStock = item.quantity === 0;
    const isLowStock = item.quantity > 0 && item.quantity < lowStockThreshold;

    // Generate simple color fallback if no image
    const getInitials = (name) => name.substring(0, 2).toUpperCase();
    const bgColors = ['bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'];
    const colorIndex = item.itemName.length % bgColors.length;
    const bgColor = bgColors[colorIndex];

    return (
        <button
            onClick={onAdd}
            disabled={isOutOfStock}
            className={`
                group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 shadow-sm
                h-56
                ${isOutOfStock
                    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-primary-500 hover:shadow-lg hover:-translate-y-1 active:scale-95'
                }
            `}
        >
            {/* Image Section - Fixed Height */}
            <div className="h-32 w-full relative bg-gray-50 flex items-center justify-center overflow-hidden">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.itemName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${bgColor}`}>
                        <span className="text-3xl font-bold text-gray-500 opacity-50 tracking-widest">
                            {getInitials(item.itemName)}
                        </span>
                    </div>
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {/* Low Stock Badge */}
                    {isLowStock && !isOutOfStock && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                            LOW STOCK
                        </span>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm transform -rotate-6">
                            OUT OF STOCK
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={`flex flex-col justify-between flex-1 w-full p-3 ${isOutOfStock ? 'opacity-50' : ''}`}>
                <div>
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary-700 transition-colors">
                        {item.itemName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {item.materialDetails}
                    </p>
                </div>

                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                    <span className="text-lg font-bold text-gray-900">
                        <span className="text-xs text-gray-400 font-normal mr-0.5">GH₵</span>
                        {item.price.toFixed(2)}
                    </span>

                    <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${isLowStock ? 'text-orange-600 bg-orange-50' : 'text-gray-500 bg-gray-100'
                        }`}>
                        {item.quantity} Left
                    </span>
                </div>
            </div>
        </button>
    );
}
