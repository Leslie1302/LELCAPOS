import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { calculateRestockSuggestion, getStockStatus, getStockColorClasses, getStockLabel, getStockIcon } from '../../utils/stockAlerts';

export default function RestockModal({ item, onClose, onRestock }) {
    const { settings } = useSettings();
    const [addedQty, setAddedQty] = useState(
        calculateRestockSuggestion(item.quantity, settings.lowStockThreshold)
    );
    const [error, setError] = useState('');

    const stockStatus = getStockStatus(item.quantity, settings.lowStockThreshold, settings.criticalStockLevel);
    const newQuantity = parseInt(item.quantity) + parseInt(addedQty || 0);
    const targetQty = settings.lowStockThreshold * 3;

    const handleSubmit = () => {
        // Validation
        if (!addedQty || addedQty <= 0) {
            setError('Please enter a valid quantity greater than 0');
            return;
        }

        if (addedQty > 10000) {
            setError('Quantity too large. Maximum 10,000 units per restock.');
            return;
        }

        // Call restock handler
        onRestock(item.id, parseInt(addedQty));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Restock Item</h2>
                        <p className="text-gray-600 mt-1">{item.itemName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Current Stock Status */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Current Stock:</span>
                        <span className="text-2xl font-bold text-gray-900">{item.quantity} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStockColorClasses(stockStatus)}`}>
                            {getStockIcon(stockStatus)} {getStockLabel(stockStatus)}
                        </span>
                    </div>
                </div>

                {/* Add Quantity Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Quantity
                    </label>
                    <input
                        type="number"
                        value={addedQty}
                        onChange={(e) => {
                            setAddedQty(e.target.value);
                            setError('');
                        }}
                        min="1"
                        max="10000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter quantity to add"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        💡 Suggested: {calculateRestockSuggestion(item.quantity, settings.lowStockThreshold)} units (to reach {targetQty})
                    </p>
                    {error && (
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    )}
                </div>

                {/* Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">New Quantity:</span>
                        <span className="text-2xl font-bold text-blue-600">{newQuantity} units</span>
                    </div>
                    {newQuantity >= settings.lowStockThreshold && (
                        <p className="text-xs text-blue-700 mt-1">
                            ✅ This will bring the item above low stock threshold
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 btn bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        Restock
                    </button>
                </div>

                <div className="mt-3 text-center">
                    <button
                        onClick={() => {
                            onClose();
                            // You can trigger edit modal here if needed
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        Edit Item Details Instead →
                    </button>
                </div>
            </div>
        </div>
    );
}
