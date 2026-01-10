import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import {
    getTodaysSalesTotal,
    getSalesHistory,
    getPaymentMethodStats,
    getTopSellingItems
} from '../utils/storage';
import {
    getLowStockItems,
    getOutOfStockItems,
    getStockStatus,
    getStockColorClasses,
    getStockIcon,
    getStockLabel,
    sortByPriority
} from '../utils/stockAlerts';
import RestockModal from '../components/Inventory/RestockModal';
import BulkRestockModal from '../components/Inventory/BulkRestockModal';
import SalesChart from '../components/Dashboard/SalesChart';
import PaymentStats from '../components/Dashboard/PaymentStats';
import Toast from '../components/common/Toast';

export default function Dashboard() {
    console.log('Dashboard component rendering...');
    const { inventory, loading, updateItem, getTotalInventoryValue, bulkUpdateItems } = useInventory();
    const { settings } = useSettings();
    const [selectedRestockItem, setSelectedRestockItem] = useState(null);
    const [showLowStockDetails, setShowLowStockDetails] = useState(false);
    const [showBulkRestock, setShowBulkRestock] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const lowStockItems = getLowStockItems(inventory, settings.lowStockThreshold);
    const outOfStockItems = getOutOfStockItems(inventory);
    const sortedLowStockItems = sortByPriority(lowStockItems, settings.lowStockThreshold, settings.criticalStockLevel);

    const todaysSales = getTodaysSalesTotal();
    const totalValue = getTotalInventoryValue();
    const totalStockCount = inventory.reduce((sum, item) => sum + item.quantity, 0);

    // Analytics Data
    const salesHistory = getSalesHistory(7);
    const paymentStats = getPaymentMethodStats();
    const topItems = getTopSellingItems(5);

    const handleRestock = (itemId, addedQuantity) => {
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            updateItem(itemId, {
                quantity: parseInt(item.quantity) + parseInt(addedQuantity),
                lastUpdated: Date.now()
            });
            setToastMessage(`Restocked ${item.itemName} (+${addedQuantity})`);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleBulkRestockConfirm = (itemsToRestock) => {
        const updates = itemsToRestock.map(({ id, quantityToAdd }) => {
            const item = inventory.find(i => i.id === id);
            if (!item) return null;
            return {
                id,
                quantity: parseInt(item.quantity) + parseInt(quantityToAdd)
            };
        }).filter(Boolean);

        const count = bulkUpdateItems(updates);
        setToastMessage(`Successfully restocked ${count} items!`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Animated Banner */}
            <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative h-full flex items-center justify-center">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4 animate-fade-in">
                        Quality and Elegance in Every Piece
                    </h1>
                </div>
                {/* Subtle animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Items Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Total Stock
                                </p>
                                <h3 className="text-3xl md:text-4xl font-bold text-green-600 mt-2">
                                    {totalStockCount}
                                </h3 >
                                <p className="text-xs text-gray-400 mt-1">
                                    {inventory.length} items
                                </p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-full">
                                <span className="text-4xl">📦</span>
                            </div>
                        </div>
                    </div>

                    {/* Today's Sales Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Today's Sales
                                </p>
                                <h3 className="text-3xl md:text-4xl font-bold text-blue-600 mt-2">
                                    GH₵{todaysSales.toFixed(2)}
                                </h3 >
                                <p className="text-xs text-gray-400 mt-1">
                                    Transaction Total
                                </p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-full">
                                <span className="text-4xl">💰</span>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Value Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Inventory Value
                                </p>
                                <h3 className="text-3xl md:text-4xl font-bold text-purple-600 mt-2">
                                    GH₵{totalValue.toFixed(2)}
                                </h3 >
                                <p className="text-xs text-gray-400 mt-1">
                                    Total worth
                                </p>
                            </div>
                            <div className="bg-purple-100 p-4 rounded-full">
                                <span className="text-4xl">💎</span>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts Card */}
                    <div
                        onClick={() => setShowLowStockDetails(!showLowStockDetails)}
                        className={`rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border-2 ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-transparent'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className={`text-sm font-medium uppercase tracking-wide ${lowStockItems.length > 0 ? 'text-red-700' : 'text-gray-500'
                                    }`}>
                                    Low Stock Alerts
                                </p>
                                <h3 className={`text-3xl md:text-4xl font-bold mt-2 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {lowStockItems.length}
                                </h3>
                                <div className="text-xs mt-1 font-medium">
                                    {outOfStockItems.length > 0 && (
                                        <span className="text-red-600">
                                            {outOfStockItems.length} Out of Stock
                                        </span>
                                    )}
                                    {outOfStockItems.length === 0 && (
                                        <span className="text-gray-400">
                                            Below {settings.lowStockThreshold} units
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`p-4 rounded-full ${lowStockItems.length > 0 ? 'bg-red-100 animate-pulse' : 'bg-green-100'
                                }`}>
                                <span className="text-4xl">
                                    {lowStockItems.length > 0 ? '⚠️' : '✅'}
                                </span>
                            </div>
                        </div>
                        {lowStockItems.length > 0 && (
                            <div className="mt-2 text-xs text-red-600 font-semibold text-right">
                                {showLowStockDetails ? 'Click to hide details' : 'Click to view details'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Analytics Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {/* Debugging: Log data */}
                        {console.log('Sales Data:', salesHistory)}
                        {console.log('Payment Data:', paymentStats)}

                        <SalesChart data={salesHistory} />
                    </div>
                    <div>
                        <PaymentStats data={paymentStats} />
                    </div>
                </div>

                {/* Top Selling & Low Stock Details Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions - Moved here for better layout */}
                    <div className="lg:col-span-3">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link
                                to="/pos"
                                className="flex items-center gap-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                            >
                                <span className="text-5xl">🛒</span>
                                <div>
                                    <h3 className="text-xl font-bold">New Sale</h3>
                                    <p className="text-sm opacity-90">Process a transaction</p>
                                </div>
                            </Link>

                            <Link
                                to="/inventory"
                                className="flex items-center gap-4 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                            >
                                <span className="text-5xl">📦</span>
                                <div>
                                    <h3 className="text-xl font-bold">Manage Inventory</h3>
                                    <p className="text-sm opacity-90">Add or update items</p>
                                </div>
                            </Link>

                            <Link
                                to="/transactions"
                                className="flex items-center gap-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                            >
                                <span className="text-5xl">📊</span>
                                <div>
                                    <h3 className="text-xl font-bold">View Reports</h3>
                                    <p className="text-sm opacity-90">Sales and analytics</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts Detail Table - Expandable */}
                {showLowStockDetails && lowStockItems.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fade-in-down">
                        <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⚠️</span>
                                <h2 className="text-lg font-bold text-red-800">Low Stock Items ({lowStockItems.length})</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowBulkRestock(true)}
                                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 shadow-sm flex items-center gap-2"
                                >
                                    <span>📥</span> Restock All
                                </button>
                                <button
                                    onClick={() => setShowLowStockDetails(false)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedLowStockItems.map((item) => {
                                        const status = getStockStatus(item.quantity, settings.lowStockThreshold, settings.criticalStockLevel);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {item.qrCode && (
                                                            <img className="h-8 w-8 rounded-full mr-3 border border-gray-200" src={item.qrCode} alt="" />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                                                            <div className="text-xs text-gray-500">{item.materialDetails}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-bold ${item.quantity === 0 ? 'text-gray-900' : 'text-red-600'
                                                        }`}>
                                                        {item.quantity} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockColorClasses(status)}`}>
                                                        {getStockIcon(status)} {getStockLabel(status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    GH₵ {item.price.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => setSelectedRestockItem(item)}
                                                        className="text-primary-600 hover:text-primary-900 font-bold hover:underline"
                                                    >
                                                        Restock
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Top Selling Items */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-2xl">🔥</span> Top Selling Items
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topItems.length > 0 ? (
                                    topItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-50 text-blue-800'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                GH₵ {item.revenue.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No sales data available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Restock Modal */}
            {selectedRestockItem && (
                <RestockModal
                    item={selectedRestockItem}
                    onClose={() => setSelectedRestockItem(null)}
                    onRestock={handleRestock}
                />
            )}

            {/* Bulk Restock Modal */}
            <BulkRestockModal
                isOpen={showBulkRestock}
                onClose={() => setShowBulkRestock(false)}
                items={sortedLowStockItems}
                threshold={settings.lowStockThreshold}
                onConfirm={handleBulkRestockConfirm}
            />

            {/* Global Toast */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Toast
                        message={toastMessage}
                        type="success"
                        onClose={() => setToastMessage(null)}
                    />
                </div>
            )}
        </div>
    );
}


