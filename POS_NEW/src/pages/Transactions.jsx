import React, { useState, useEffect } from 'react';
import { loadTransactions, refundTransaction } from '../utils/storage';
import Receipt from '../components/POS/Receipt';
import TransactionStats from '../components/Transactions/TransactionStats';
import RefundModal from '../components/Transactions/RefundModal';
import RefundNote from '../components/Transactions/RefundNote';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [expandedTransactionId, setExpandedTransactionId] = useState(null);
    const [printingTransaction, setPrintingTransaction] = useState(null);
    const [printingRefund, setPrintingRefund] = useState(null);

    // Refund State
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [transactionToRefund, setTransactionToRefund] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const loaded = loadTransactions();
        setTransactions(loaded);
        setFilteredTransactions(loaded);
    }, []);

    // Apply filters whenever dependencies change
    useEffect(() => {
        let result = transactions;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(txn =>
                txn.receiptNumber.toLowerCase().includes(term) ||
                txn.totalAmount.toString().includes(term)
            );
        }

        if (startDate) {
            result = result.filter(txn => {
                const txnDate = new Date(txn.date).toISOString().split('T')[0];
                return txnDate >= startDate;
            });
        }

        if (endDate) {
            result = result.filter(txn => {
                const txnDate = new Date(txn.date).toISOString().split('T')[0];
                return txnDate <= endDate;
            });
        }

        if (statusFilter !== 'All') {
            result = result.filter(txn => txn.status === statusFilter);
        }

        // Sort by date descending (newest first)
        result.sort((a, b) => new Date(b.date) - new Date(a.date));

        setFilteredTransactions(result);
    }, [searchTerm, startDate, endDate, statusFilter, transactions]);

    const toggleExpand = (id) => {
        setExpandedTransactionId(expandedTransactionId === id ? null : id);
    };

    const getPaymentIcon = (method) => {
        switch (method) {
            case 'Cash': return '💵';
            case 'Card': return '💳';
            case 'Mobile Money': return '📱';
            default: return '❓';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Refunded': return 'bg-red-100 text-red-800';
            case 'Partially Refunded': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePrint = (txn) => {
        setPrintingTransaction(txn);
        setPrintingRefund(null);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handlePrintRefund = (txn, specificRefundIndex = null) => {
        // If specificRefundIndex is provided, we print THAT specific refund note.
        // Otherwise we print the latest one (default behavior).
        let refundInfoToPrint;

        if (specificRefundIndex !== null && txn.refunds && txn.refunds[specificRefundIndex]) {
            refundInfoToPrint = txn.refunds[specificRefundIndex];
        } else if (txn.refunds && txn.refunds.length > 0) {
            refundInfoToPrint = txn.refunds[txn.refunds.length - 1]; // Latest
        } else if (txn.refundInfo) {
            refundInfoToPrint = txn.refundInfo; // Legacy single refund
        }

        if (!refundInfoToPrint) return;

        const printableRefund = {
            ...txn,
            refundInfo: refundInfoToPrint
        };

        setPrintingRefund(printableRefund);
        setPrintingTransaction(null);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const initiateRefund = (txn) => {
        // Check if fully refunded
        if (txn.status === 'Refunded') {
            alert('This transaction is fully refunded.');
            return;
        }
        setTransactionToRefund(txn);
        setIsRefundModalOpen(true);
    };

    const handleConfirmRefund = (refundDetails, itemsToRefund) => {
        try {
            const updatedTxn = refundTransaction(transactionToRefund.transactionId, refundDetails, itemsToRefund);

            // Update local state
            const updatedTransactions = transactions.map(t =>
                t.transactionId === updatedTxn.transactionId ? updatedTxn : t
            );
            setTransactions(updatedTransactions);
            setIsRefundModalOpen(false);
            setTransactionToRefund(null);

            // Auto-print refund note (latest one)
            handlePrintRefund(updatedTxn);
        } catch (error) {
            alert('Refund Failed: ' + error.message);
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-gray-50 overflow-hidden no-print">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>

            {/* Summary Stats */}
            <TransactionStats transactions={transactions} />

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Search Receipt #</label>
                    <input
                        type="text"
                        placeholder="Search RCP-..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Partially Refunded">Partially Refunded</option>
                        <option value="Refunded">Refunded</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-6xl mb-4 bg-gray-50 p-6 rounded-full">📉</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Transactions Found</h2>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 w-10"></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt No.</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((txn) => (
                                    <React.Fragment key={txn.transactionId}>
                                        <tr
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedTransactionId === txn.transactionId ? 'bg-gray-50' : ''}`}
                                            onClick={() => toggleExpand(txn.transactionId)}
                                        >
                                            <td className="px-6 py-4 text-gray-400">
                                                {expandedTransactionId === txn.transactionId ? '▼' : '▶'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(txn.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                                                {txn.receiptNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                                    <span className="mr-1.5">{getPaymentIcon(txn.paymentMethod)}</span>
                                                    {txn.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                                GH₵{txn.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedTransactionId === txn.transactionId && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="6" className="px-6 pb-6 pt-2">
                                                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-fade-in">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                                                            <div className="flex gap-2">
                                                                {txn.status !== 'Refunded' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); initiateRefund(txn); }}
                                                                        className="text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                                                    >
                                                                        ↩️ Process Refund
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handlePrint(txn); }}
                                                                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 px-3 py-1"
                                                                >
                                                                    🖨️ Print Receipt
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Refund History List */}
                                                        {txn.refunds && txn.refunds.length > 0 && (
                                                            <div className="mb-6 space-y-4">
                                                                {txn.refunds.map((refund, idx) => (
                                                                    <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-lg flex justify-between items-start">
                                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
                                                                            <div className="col-span-2 font-bold text-red-800 text-base mb-1 flex items-center gap-2">
                                                                                ⚠️ Refund #{refund.refundNoteNumber}
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500 block">Date</span>
                                                                                <span className="font-medium">{new Date(refund.refundDate).toLocaleString()}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500 block">Reason</span>
                                                                                <span className="font-medium">{refund.refundReason}</span>
                                                                            </div>
                                                                            <div className="col-span-2 mt-2 border-t border-red-100 pt-2">
                                                                                <span className="text-xs font-semibold text-gray-500 uppercase">Items Returned</span>
                                                                                <div className="mt-1 space-y-1">
                                                                                    {refund.items.map((item, i) => (
                                                                                        <div key={i} className="flex justify-between text-sm">
                                                                                            <span>{item.quantity} x {item.itemName}</span>
                                                                                            <span className="font-medium">GH₵{item.lineTotal.toFixed(2)}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-span-2 text-right mt-2 pt-2 border-t border-red-200">
                                                                                <span className="font-bold text-red-700">Total Refunded: GH₵{refund.totalAmount.toFixed(2)}</span>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handlePrintRefund(txn, idx); }}
                                                                            className="ml-4 text-orange-600 hover:text-orange-700 font-medium text-xs border border-orange-200 px-2 py-1 rounded bg-white"
                                                                        >
                                                                            🖨️ Print Note
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Legacy Check for old single refund format */}
                                                        {!txn.refunds && txn.refundInfo && (
                                                            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-lg">
                                                                <div className="flex justify-between">
                                                                    <h4 className="text-sm font-bold text-red-800 mb-2">⚠️ Refund Information</h4>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handlePrintRefund(txn); }}
                                                                        className="text-orange-600 hover:text-orange-700 font-medium text-xs border border-orange-200 px-2 py-1 rounded bg-white h-fit"
                                                                    >
                                                                        🖨️ Print Note
                                                                    </button>
                                                                </div>
                                                                <div className="text-sm">
                                                                    <span className="font-mono font-medium block">{txn.refundInfo.refundNoteNumber}</span>
                                                                    <span className="block text-gray-500">{new Date(txn.refundInfo.refundDate).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Original Items</h4>
                                                                <div className="space-y-3">
                                                                    {txn.items.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 p-2 rounded">
                                                                            <div>
                                                                                <span className="font-medium text-gray-900 block">{item.itemName}</span>
                                                                                <span className="text-gray-500 text-xs">{item.quantity} x GH₵{item.unitPrice.toFixed(2)}</span>
                                                                            </div>
                                                                            <span className="font-medium text-gray-900">GH₵{item.lineTotal.toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Info</h4>
                                                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-100">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-500">Method</span>
                                                                            <span className="font-medium text-gray-900">{txn.paymentMethod}</span>
                                                                        </div>
                                                                        {txn.paymentMethod === 'Cash' && (
                                                                            <>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Tendered</span>
                                                                                    <span className="font-medium text-gray-900">GH₵{txn.amountTendered?.toFixed(2)}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">Change</span>
                                                                                    <span className="font-medium text-gray-900">GH₵{txn.changeGiven?.toFixed(2)}</span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="flex justify-between text-sm py-1">
                                                                        <span className="text-gray-500">Subtotal</span>
                                                                        <span className="font-medium text-gray-900">GH₵{txn.subtotal.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm py-1">
                                                                        <span className="text-gray-500">Tax</span>
                                                                        <span className="font-medium text-gray-900">GH₵{txn.tax.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                                                                        <span className="text-gray-900">Total</span>
                                                                        <span className="text-primary-600">GH₵{txn.totalAmount.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Hidden Receipt Component for Printing */}
            <div className="hidden">
                <Receipt transaction={printingTransaction} />
                <RefundNote transaction={printingRefund} />
            </div>

            <RefundModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                transaction={transactionToRefund}
                onConfirm={handleConfirmRefund}
            />

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
