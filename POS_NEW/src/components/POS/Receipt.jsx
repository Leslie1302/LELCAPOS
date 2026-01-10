import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const Receipt = React.forwardRef(({ transaction }, ref) => {
    const { settings } = useSettings();

    if (!transaction) return null;

    return (
        <div ref={ref} className="receipt-container bg-white p-4 text-black text-xs font-mono leading-tight max-w-[80mm] mx-auto hidden-print-block">
            {/* Store Header */}
            <div className="text-center mb-4">
                {settings.storeLogo && (
                    <img src={settings.storeLogo} alt="Store Logo" className="h-16 mx-auto mb-2 object-contain grayscale" />
                )}
                <h1 className="text-xl font-bold uppercase mb-1">{settings.storeName}</h1>
                {settings.storeAddress && (
                    <p className="whitespace-pre-line mb-1">{settings.storeAddress}</p>
                )}
                <div className="text-[10px]">
                    {settings.storePhone && <p>Tel: {settings.storePhone}</p>}
                    {settings.storeEmail && <p>Email: {settings.storeEmail}</p>}
                </div>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            {/* Transaction Details */}
            <div className="mb-2">
                <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <span className="font-bold">{transaction.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{transaction.cashier || 'Staff'}</span>
                </div>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            {/* Items */}
            <div className="mb-2">
                <div className="font-bold mb-1 uppercase">Items</div>
                <table className="w-full">
                    <tbody>
                        {transaction.items.map((item, index) => (
                            <tr key={index} className="align-top">
                                <td className="pb-1 pr-1">
                                    <div>{item.itemName}</div>
                                    <div className="text-[10px] pl-2 text-gray-600">
                                        {item.quantity} x {item.unitPrice.toFixed(2)}
                                    </div>
                                </td>
                                <td className="text-right pb-1 align-bottom">
                                    {item.lineTotal.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            {/* Totals */}
            <div className="mb-2 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>GH₵ {transaction.subtotal.toFixed(2)}</span>
                </div>
                {transaction.tax > 0 && (
                    <div className="flex justify-between">
                        <span>Tax ({settings.taxRate}%):</span>
                        <span>GH₵ {transaction.tax.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm mt-2">
                    <span>TOTAL:</span>
                    <span>GH₵ {transaction.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            {/* Payment Details */}
            <div className="mb-4 text-[10px]">
                <div className="flex justify-between font-bold">
                    <span>Payment Method:</span>
                    <span className="uppercase">{transaction.paymentMethod}</span>
                </div>

                {transaction.paymentMethod === 'Cash' && (
                    <>
                        <div className="flex justify-between">
                            <span>Tendered:</span>
                            <span>GH₵ {transaction.amountTendered?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Change:</span>
                            <span>GH₵ {transaction.changeGiven?.toFixed(2)}</span>
                        </div>
                    </>
                )}

                {transaction.paymentMethod === 'Card' && transaction.cardDetails && (
                    <>
                        <div className="flex justify-between">
                            <span>Card:</span>
                            <span>{transaction.cardDetails.cardType} (**** {transaction.cardDetails.lastFourDigits})</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Auth Ref:</span>
                            <span>{transaction.cardDetails.transactionReference}</span>
                        </div>
                    </>
                )}

                {transaction.paymentMethod === 'Mobile Money' && transaction.momoDetails && (
                    <>
                        <div className="flex justify-between">
                            <span>Provider:</span>
                            <span>{transaction.momoDetails.provider}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Phone:</span>
                            <span>{transaction.momoDetails.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Ref ID:</span>
                            <span>{transaction.momoDetails.transactionReference}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="text-center space-y-2 mt-6">
                {settings.receiptSlogan && (
                    <p className="italic font-serif">{settings.receiptSlogan}</p>
                )}
                {settings.receiptFooter && (
                    <p className="font-bold">{settings.receiptFooter}</p>
                )}
                {settings.returnPolicy && (
                    <div className="border-t border-black border-dashed pt-2 mt-2">
                        <p className="text-[9px] uppercase font-bold">Return Policy</p>
                        <p className="text-[9px]">{settings.returnPolicy}</p>
                    </div>
                )}
                <div className="pt-4 text-[8px] text-gray-400">
                    Powered by Mama's POS
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    @page {
                        margin: 0;
                        size: 80mm auto; 
                    }
                    body * {
                        visibility: hidden;
                    }
                    .receipt-container, .receipt-container * {
                        visibility: visible;
                    }
                    .receipt-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: 80mm;
                        padding: 5mm;
                        background: white;
                        color: black;
                    }
                    .hidden-print-block {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
});

export default Receipt;
