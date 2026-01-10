import React, { useMemo } from 'react';

export default function TransactionStats({ transactions }) {
    const stats = useMemo(() => {
        // Filter for sales (Completed) vs Refunds
        const completedTxns = transactions.filter(t => t.status === 'Completed');
        const refundedTxns = transactions.filter(t => t.status === 'Refunded');

        const totalSales = completedTxns.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalItems = completedTxns.reduce((sum, t) => sum + t.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
        const refundAmount = refundedTxns.reduce((sum, t) => sum + t.totalAmount, 0);

        return {
            totalSales,
            txnCheck: completedTxns.length,
            itemsSold: totalItems,
            refundCount: refundedTxns.length,
            refundAmount
        };
    }, [transactions]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Sales */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Sales</span>
                <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-bold text-gray-900">GH₵{stats.totalSales.toFixed(2)}</span>
                    <span className="text-2xl">💰</span>
                </div>
            </div>

            {/* Transactions Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Transactions</span>
                <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-bold text-blue-600">{stats.txnCheck}</span>
                    <span className="text-2xl">📊</span>
                </div>
            </div>

            {/* Items Sold */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Items Sold</span>
                <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-bold text-green-600">{stats.itemsSold}</span>
                    <span className="text-2xl">📦</span>
                </div>
            </div>

            {/* Refunds */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Refunds</span>
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <span className="text-xl font-bold text-red-500">{stats.refundCount}</span>
                        <span className="text-xs text-red-400 ml-1 font-medium">(GH₵{stats.refundAmount.toFixed(2)})</span>
                    </div>
                    <span className="text-2xl">↩️</span>
                </div>
            </div>
        </div>
    );
}
