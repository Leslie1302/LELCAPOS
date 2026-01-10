import React, { useState, useEffect } from 'react';

export default function RefundModal({ isOpen, onClose, transaction, onConfirm }) {
    const [reason, setReason] = useState('Customer Request');
    const [notes, setNotes] = useState('');
    const [confirmCheck, setConfirmCheck] = useState(false);

    // State for Partial Refunds
    const [refundItems, setRefundItems] = useState({}); // { itemId: quantityToRefund }

    // Reset when modal opens
    useEffect(() => {
        if (isOpen && transaction) {
            setRefundItems({});
            setReason('Customer Request');
            setNotes('');
            setConfirmCheck(false);
        }
    }, [isOpen, transaction]);

    if (!isOpen || !transaction) return null;

    const reasons = [
        'Customer Request',
        'Defective Product',
        'Wrong Item Sold',
        'Damaged Item',
        'Quality Issues',
        'Changed Mind',
        'Other'
    ];

    // Calculate remaining quantities
    const getRemainingQty = (item) => {
        const previousRefunds = transaction.refunds || [];
        const alreadyRefunded = previousRefunds.reduce((acc, ref) => {
            const refItem = ref.items.find(i => i.itemId === item.id || i.itemId === item.itemId);
            return acc + (refItem ? refItem.quantity : 0);
        }, 0);
        return item.quantity - alreadyRefunded;
    };

    const handleQuantityChange = (itemId, qty, max) => {
        const val = parseInt(qty, 10);
        if (isNaN(val) || val < 0) return;

        let newQty = val;
        if (newQty > max) newQty = max;

        setRefundItems(prev => {
            const updated = { ...prev };
            if (newQty === 0) {
                delete updated[itemId];
            } else {
                updated[itemId] = newQty;
            }
            return updated;
        });
    };

    const toggleItem = (itemId, max) => {
        setRefundItems(prev => {
            if (prev[itemId]) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            } else {
                return { ...prev, [itemId]: max }; // Default to max remaining
            }
        });
    };

    const handleSubmit = () => {
        if (!confirmCheck) return;

        const itemsToRefund = Object.entries(refundItems).map(([itemId, quantity]) => ({
            itemId,
            quantity
        }));

        onConfirm({ reason, notes }, itemsToRefund);
    };

    const totalToRefund = Object.entries(refundItems).reduce((sum, [itemId, qty]) => {
        const item = transaction.items.find(i => i.id === itemId || i.itemId === itemId);
        return sum + (item.unitPrice * qty);
    }, 0);

    const hasSelection = Object.keys(refundItems).length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <h2 className="text-xl font-bold text-red-800">Process Refund</h2>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">

                    {/* Item Selection List */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Items to Refund</h3>
                        <div className="border rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                            {transaction.items.map(item => {
                                const remaining = getRemainingQty(item);
                                const isFullyRefunded = remaining === 0;
                                const isSelected = !!refundItems[item.id || item.itemId];
                                const currentRefundQty = refundItems[item.id || item.itemId] || 0;

                                return (
                                    <div key={item.id || item.itemId} className={`p-3 flex items-center justify-between ${isFullyRefunded ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                disabled={isFullyRefunded}
                                                checked={isSelected}
                                                onChange={() => toggleItem(item.id || item.itemId, remaining)}
                                                className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-gray-900">{item.itemName}</div>
                                                <div className="text-xs text-gray-500">
                                                    Available: {remaining} (Sold: {item.quantity})
                                                </div>
                                            </div>
                                        </div>

                                        {!isFullyRefunded && isSelected && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Qty:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={remaining}
                                                    value={currentRefundQty}
                                                    onChange={(e) => handleQuantityChange(item.id || item.itemId, e.target.value, remaining)}
                                                    className="w-16 h-8 text-sm border-gray-300 rounded focus:ring-red-500 focus:border-red-500 text-center"
                                                />
                                            </div>
                                        )}
                                        {isFullyRefunded && <span className="text-xs font-bold text-green-600">Refunded</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Refund Amount:</span>
                            <span className="font-bold text-xl text-red-600">GH₵{totalToRefund.toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2 border"
                        >
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2 border"
                            rows="2"
                            placeholder="Optional notes..."
                        ></textarea>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <input
                            type="checkbox"
                            id="confirmRefund"
                            checked={confirmCheck}
                            onChange={(e) => setConfirmCheck(e.target.checked)}
                            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="confirmRefund" className="text-xs text-yellow-800 leading-tight">
                            I confirm to return selected items to inventory and deduct amount from sales.
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!confirmCheck || !hasSelection}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-md text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${(confirmCheck && hasSelection) ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Confirm Refund
                    </button>
                </div>
            </div>
        </div>
    );
}
