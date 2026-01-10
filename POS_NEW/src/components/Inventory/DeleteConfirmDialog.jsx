import React from 'react';

export default function DeleteConfirmDialog({ item, onClose, onConfirm, isDeleting }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Delete Item?</h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <span className="font-semibold">{item.itemName}</span>?
                        This action cannot be undone.
                    </p>

                    {/* Warning Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-600 text-xl">⚠️</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800">Item Details:</p>
                                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                    <li>• Current Stock: <span className="font-semibold">{item.quantity} units</span></li>
                                    <li>• Unit Price: <span className="font-semibold">GH₵ {item.price.toFixed(2)}</span></li>
                                    <li>• Total Value: <span className="font-semibold">GH₵ {(item.quantity * item.price).toFixed(2)}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Deleting...
                            </>
                        ) : (
                            '🗑️ Delete Item'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
