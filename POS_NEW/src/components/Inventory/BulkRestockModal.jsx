import React, { useState, useEffect } from 'react';
import { calculateRestockSuggestion } from '../../utils/stockAlerts';

export default function BulkRestockModal({ isOpen, onClose, items, threshold, onConfirm }) {
    const [restockQuantities, setRestockQuantities] = useState({});

    // Initialize quantities with suggestions when items change
    useEffect(() => {
        if (isOpen && items.length > 0) {
            const initialQuantities = {};
            items.forEach(item => {
                const suggestion = calculateRestockSuggestion(item.quantity, threshold);
                initialQuantities[item.id] = suggestion;
            });
            setRestockQuantities(initialQuantities);
        }
    }, [isOpen, items, threshold]);

    const handleQuantityChange = (itemId, value) => {
        const qty = parseInt(value) || 0;
        setRestockQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(0, qty)
        }));
    };

    const handleConfirm = () => {
        // Filter out items with 0 restock quantity
        const itemsToRestock = items
            .map(item => ({
                id: item.id,
                quantityToAdd: restockQuantities[item.id] || 0
            }))
            .filter(item => item.quantityToAdd > 0);

        onConfirm(itemsToRestock);
        onClose();
    };

    const totalRestockCount = Object.values(restockQuantities).reduce((sum, qty) => sum + qty, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">📦</span> Bulk Restock
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-gray-600 mb-4">
                        Review and adjust restock quantities for <strong>{items.length}</strong> low stock items.
                        Default suggestions target 3x your low stock threshold.
                    </p>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current
                                </th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Add Stock
                                </th>
                                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    New Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => {
                                const addAmount = restockQuantities[item.id] || 0;
                                const newTotal = item.quantity + addAmount;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-gray-500 text-xs">{item.material || 'Standard'}</div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, addAmount - 1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={addAmount}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    className="w-16 text-center border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500 text-sm py-1"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, addAmount + 1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-center font-medium">
                                            <span className={newTotal > threshold ? 'text-green-600' : 'text-yellow-600'}>
                                                {newTotal}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
                    <div className="text-sm text-gray-500">
                        Total items to add: <strong>{totalRestockCount}</strong>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={totalRestockCount === 0}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Restock
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
