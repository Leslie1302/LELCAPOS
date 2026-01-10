import React from 'react';

export default function RefundNote({ transaction }) {
    if (!transaction || !transaction.refundInfo) return null;

    const { refundInfo, receiptNumber } = transaction;
    // Use the specific items from this refund instance, not the whole transaction items
    // Fallback to transaction.items only if refundInfo.items is missing (legacy support)
    const refundedItems = refundInfo.items || transaction.items;

    return (
        <div className="print-only receipt p-4 max-w-sm mx-auto bg-white text-sm font-mono leading-tight">
            {/* Header */}
            <div className="text-center mb-6 pt-2">
                <div className="border-4 border-double border-black p-2 mb-4 inline-block transform rotate-[-2deg]">
                    <h1 className="text-2xl font-black text-black">⚠️ REFUND NOTE ⚠️</h1>
                </div>
                <div className="font-bold text-lg mb-1">MAMA'S STORE</div>
                <div className="text-xs mb-4">Official Refund Document</div>

                <div className="text-left border-t border-b border-dashed border-gray-400 py-2 my-2 space-y-1">
                    <div className="flex justify-between">
                        <span>Note #:</span>
                        <span className="font-bold">{refundInfo.refundNoteNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Orig Receipt:</span>
                        <span>{receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(refundInfo.refundDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{new Date(refundInfo.refundDate).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Reason:</span>
                        <span>{refundInfo.reason || 'Customer Request'}</span>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="mb-4">
                <div className="font-bold border-b border-black mb-2 pb-1">ITEMS REFUNDED</div>
                {refundedItems.map((item, index) => (
                    <div key={index} className="mb-2">
                        <div className="font-bold">{item.itemName}</div>
                        <div className="flex justify-between pl-4">
                            <span>{item.quantity} x {item.unitPrice.toFixed(2)}</span>
                            <span>GH₵ {item.lineTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t border-black pt-2 mb-6">
                <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL REFUND:</span>
                    <span>GH₵ {(refundInfo.totalAmount || transaction.totalAmount).toFixed(2)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs space-y-2">
                <div className="border-t border-gray-300 pt-8 mt-8 w-48 mx-auto">
                    Customer Signature
                </div>
                <p>Refund Approved By: Manager</p>
                <p className="font-bold mt-4"> INVENTORY RESTORED </p>
            </div>

            <style jsx global>{`
                @media print {
                    .print-only {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 9999;
                    }
                    body > *:not(.print-only) {
                        display: none !important;
                    }
                }
                .receipt {
                    font-family: 'Courier New', Courier, monospace;
                }
            `}</style>
        </div>
    );
}
