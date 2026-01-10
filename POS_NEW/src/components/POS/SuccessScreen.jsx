import React, { useEffect, useState, useRef } from 'react';
import Receipt from './Receipt';

export default function SuccessScreen({ transaction, onNewSale }) {
    const [countdown, setCountdown] = useState(5);
    const receiptRef = useRef();

    useEffect(() => {
        if (!transaction) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onNewSale();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [transaction, onNewSale]);

    const handlePrint = () => {
        window.print();
    };

    if (!transaction) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 animate-fade-in no-print">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-short">
                        <span className="text-4xl">✅</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sale Completed!</h2>
                    <p className="text-gray-500 mb-8">Transaction successfully recorded</p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3 border border-gray-100 dash-border">
                        <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Receipt No.</span>
                            <span className="font-mono font-medium text-gray-900">{transaction.receiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Date</span>
                            <span className="text-gray-900 text-sm font-medium">
                                {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>

                        {/* Payment Method Specific Details */}
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Method</span>
                            <span className="font-medium text-gray-900">{transaction.paymentMethod}</span>
                        </div>

                        {transaction.paymentMethod === 'Cash' && (
                            <>
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-gray-800">Total Paid</span>
                                    <span className="text-primary-600">GH₵{transaction.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tendered</span>
                                    <span className="text-gray-900 font-medium">GH₵{transaction.amountTendered?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Change</span>
                                    <span className="text-gray-900 font-medium">GH₵{transaction.changeGiven?.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        {transaction.paymentMethod === 'Card' && transaction.cardDetails && (
                            <>
                                <div className="flex justify-between text-lg font-bold mb-1">
                                    <span className="text-gray-800">Total Paid</span>
                                    <span className="text-primary-600">GH₵{transaction.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Card</span>
                                    <span className="text-gray-900 font-medium">
                                        {transaction.cardDetails.cardType} {transaction.cardDetails.lastFourDigits ? `(**** ${transaction.cardDetails.lastFourDigits})` : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Auth Ref</span>
                                    <span className="text-gray-900 font-mono text-xs">{transaction.cardDetails.transactionReference}</span>
                                </div>
                            </>
                        )}

                        {transaction.paymentMethod === 'Mobile Money' && transaction.momoDetails && (
                            <>
                                <div className="flex justify-between text-lg font-bold mb-1">
                                    <span className="text-gray-800">Total Paid</span>
                                    <span className="text-primary-600">GH₵{transaction.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Provider</span>
                                    <span className="text-gray-900 font-medium">{transaction.momoDetails.provider}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Phone</span>
                                    <span className="text-gray-900 font-medium">{transaction.momoDetails.phoneNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ref ID</span>
                                    <span className="text-gray-900 font-mono text-xs">{transaction.momoDetails.transactionReference}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handlePrint}
                            className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors flex justify-center items-center gap-2"
                        >
                            <span>🖨️</span> Print Receipt
                        </button>

                        <button
                            onClick={onNewSale}
                            className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30 transition-all transform active:scale-95"
                        >
                            New Sale ({countdown}s)
                        </button>
                    </div>
                </div>
            </div>

            {/* Printable Receipt Component - Hidden from screen, shown on print */}
            <div className="hidden">
                <Receipt transaction={transaction} ref={receiptRef} />
            </div>
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
