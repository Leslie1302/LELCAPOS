import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

export default function PaymentModal({ isOpen, onClose, onComplete }) {
    const { total, cartItems, subtotal, tax } = useCart();
    const [paymentMethod, setPaymentMethod] = useState(null); // 'Cash', 'Card', 'Mobile Money'
    const [isProcessing, setIsProcessing] = useState(false);

    // Cash State
    const [amountTendered, setAmountTendered] = useState('');
    const [change, setChange] = useState(0);

    // Card State
    const [cardDetails, setCardDetails] = useState({
        cardType: '',
        lastFourDigits: '',
        transactionReference: '',
        cardholderName: '',
        approved: false
    });

    // MoMo State
    const [momoDetails, setMomoDetails] = useState({
        provider: '',
        phoneNumber: '',
        transactionReference: '',
        customerName: '',
        received: false
    });

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod(null);
            setAmountTendered('');
            setChange(0);
            setCardDetails({
                cardType: '',
                lastFourDigits: '',
                transactionReference: '',
                cardholderName: '',
                approved: false
            });
            setMomoDetails({
                provider: '',
                phoneNumber: '',
                transactionReference: '',
                customerName: '',
                received: false
            });
            setIsProcessing(false);
        }
    }, [isOpen]);

    // Cash Logic
    useEffect(() => {
        if (amountTendered) {
            const tendered = parseFloat(amountTendered);
            setChange(tendered - total);
        } else {
            setChange(0);
        }
    }, [amountTendered, total]);

    const handleCashSubmit = () => {
        const tendered = parseFloat(amountTendered);
        if (isNaN(tendered) || tendered < total) return;

        processPayment({
            paymentMethod: 'Cash',
            amountTendered: tendered,
            changeGiven: tendered - total
        });
    };

    // Card Logic
    const handleCardSubmit = () => {
        if (!cardDetails.cardType || !cardDetails.transactionReference || !cardDetails.approved) return;

        processPayment({
            paymentMethod: 'Card',
            cardDetails: {
                cardType: cardDetails.cardType,
                lastFourDigits: cardDetails.lastFourDigits,
                transactionReference: cardDetails.transactionReference,
                cardholderName: cardDetails.cardholderName
            }
        });
    };

    // MoMo Logic
    const formatPhoneNumber = (value) => {
        // Strip non-digits
        const digits = value.replace(/\D/g, '');
        // Limit to 9-10 digits (local format)
        // If user types 024..., store as is for display logic, but maybe we want international format +233
        // Let's keep it simple: just numbers.
        return digits;
    };

    const handleMomoSubmit = () => {
        if (!momoDetails.provider || !momoDetails.phoneNumber || !momoDetails.transactionReference || !momoDetails.received) return;

        /*
            For phone number, let's assume we want to store it as +233...
            If user enters 0244123456 (10 digits), we strip leading 0 -> 244123456 -> prepend +233
            If user enters 244123456 (9 digits), prepend +233
        */
        let formattedPhone = momoDetails.phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
            formattedPhone = formattedPhone.substring(1);
        }
        formattedPhone = '+233' + formattedPhone;

        processPayment({
            paymentMethod: 'Mobile Money',
            momoDetails: {
                provider: momoDetails.provider,
                phoneNumber: formattedPhone, // formatted
                transactionReference: momoDetails.transactionReference,
                customerName: momoDetails.customerName
            }
        });
    };


    const processPayment = (details) => {
        setIsProcessing(true);
        setTimeout(() => {
            onComplete(details);
            // Modal closes, no need to set processing false
        }, 1500);
    };

    const handleBack = () => {
        if (paymentMethod) {
            setPaymentMethod(null);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    // --- RENDER HELPERS ---

    const renderMethodSelection = () => (
        <div className="flex flex-col h-full justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Choose Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                    onClick={() => setPaymentMethod('Cash')}
                    className="flex flex-col items-center justify-center p-8 bg-green-50 border-2 border-green-100 rounded-2xl hover:border-green-500 hover:bg-green-100 hover:shadow-lg transition-all group h-48"
                >
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">💵</div>
                    <span className="text-2xl font-bold text-green-700">CASH</span>
                </button>

                <button
                    onClick={() => setPaymentMethod('Card')}
                    className="flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-blue-100 rounded-2xl hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg transition-all group h-48"
                >
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">💳</div>
                    <span className="text-2xl font-bold text-blue-700">CARD</span>
                </button>

                <button
                    onClick={() => setPaymentMethod('Mobile Money')}
                    className="flex flex-col items-center justify-center p-8 bg-purple-50 border-2 border-purple-100 rounded-2xl hover:border-purple-500 hover:bg-purple-100 hover:shadow-lg transition-all group h-48"
                >
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">📱</div>
                    <span className="text-2xl font-bold text-purple-700">MOMO</span>
                </button>
            </div>
            <div className="mt-12 text-center text-gray-500 font-medium text-lg">
                Total Amount to Pay: <span className="text-gray-900 font-bold ml-2">GH₵{total.toFixed(2)}</span>
            </div>
        </div>
    );

    const renderCashForm = () => {
        const isValidTender = parseFloat(amountTendered) >= total;
        return (
            <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span>💵</span> Cash Payment
                </h2>

                <div className="flex-1 space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Amount Tendered</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 text-2xl font-bold">GH₵</span>
                            <input
                                type="number"
                                className={`block w-full pl-16 pr-4 py-4 text-4xl font-bold border-2 rounded-xl focus:ring-4 outline-none transition-all ${parseFloat(amountTendered) < total && amountTendered
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100 text-red-600'
                                    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 text-gray-900'
                                    }`}
                                placeholder="0.00"
                                value={amountTendered}
                                onChange={(e) => setAmountTendered(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {parseFloat(amountTendered) < total && amountTendered && (
                            <p className="text-red-500 text-sm mt-2 font-medium">Insufficient amount. Add GH₵{(total - parseFloat(amountTendered)).toFixed(2)} more.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[10, 20, 50, 100, 200, 500].map(amt => (
                            <button
                                key={amt}
                                onClick={() => setAmountTendered(amt.toString())}
                                className="py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-primary-500 hover:text-primary-700 font-semibold text-lg transition-all"
                            >
                                GH₵{amt}
                            </button>
                        ))}
                        <button
                            onClick={() => setAmountTendered(total.toString())}
                            className="col-span-3 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-all"
                        >
                            Exact Amount (GH₵{total.toFixed(2)})
                        </button>
                    </div>

                    <div className={`p-6 rounded-xl border transition-all duration-300 flex justify-between items-center ${change >= 0 && amountTendered ? 'bg-green-50 border-green-200 opacity-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                        <span className="text-gray-600 font-medium text-lg">Change Due</span>
                        <span className={`text-3xl font-bold ${change >= 0 ? 'text-green-700' : 'text-gray-400'}`}>GH₵{change >= 0 ? change.toFixed(2) : '0.00'}</span>
                    </div>
                </div>

                <button
                    onClick={handleCashSubmit}
                    disabled={!isValidTender || isProcessing}
                    className="mt-6 w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                </button>
            </div>
        );
    };

    const renderCardForm = () => {
        const isValid = cardDetails.cardType && cardDetails.transactionReference && cardDetails.approved;
        return (
            <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span>💳</span> Card Payment
                </h2>

                <div className="flex-1 space-y-5 overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Type <span className="text-red-500">*</span></label>
                        <select
                            value={cardDetails.cardType}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Select card type</option>
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Verve">Verve</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Last 4 Digits (Optional)</label>
                        <input
                            type="text"
                            maxLength="4"
                            placeholder="1234"
                            value={cardDetails.lastFourDigits}
                            onChange={(e) => setCardDetails({ ...cardDetails, lastFourDigits: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter approval code"
                            value={cardDetails.transactionReference}
                            onChange={(e) => setCardDetails({ ...cardDetails, transactionReference: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-yellow-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Found on the POS terminal receipt</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name (Optional)</label>
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={cardDetails.cardholderName}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="pt-4">
                        <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${cardDetails.approved ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input
                                type="checkbox"
                                checked={cardDetails.approved}
                                onChange={(e) => setCardDetails({ ...cardDetails, approved: e.target.checked })}
                                className="w-6 h-6 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 font-medium text-gray-900">Payment approved on terminal</span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleCardSubmit}
                    disabled={!isValid || isProcessing}
                    className="mt-6 w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                </button>
            </div>
        );
    };

    const renderMomoForm = () => {
        const isValid = momoDetails.provider && momoDetails.phoneNumber.length >= 9 && momoDetails.transactionReference && momoDetails.received;

        return (
            <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span>📱</span> Mobile Money
                </h2>

                <div className="flex-1 space-y-5 overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">MoMo Provider <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 gap-2">
                            {['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money'].map(p => (
                                <label key={p} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${momoDetails.provider === p ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="provider"
                                        value={p}
                                        checked={momoDetails.provider === p}
                                        onChange={(e) => setMomoDetails({ ...momoDetails, provider: e.target.value })}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="ml-3 font-medium text-gray-900">{p}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium">+233</span>
                            <input
                                type="tel"
                                placeholder="24 123 4567"
                                value={momoDetails.phoneNumber}
                                onChange={(e) => setMomoDetails({ ...momoDetails, phoneNumber: formatPhoneNumber(e.target.value) })}
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter transaction ID"
                            value={momoDetails.transactionReference}
                            onChange={(e) => setMomoDetails({ ...momoDetails, transactionReference: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-yellow-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Message ID from the payment confirmation SMS</p>
                    </div>

                    <div className="pt-4">
                        <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${momoDetails.received ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input
                                type="checkbox"
                                checked={momoDetails.received}
                                onChange={(e) => setMomoDetails({ ...momoDetails, received: e.target.checked })}
                                className="w-6 h-6 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 font-medium text-gray-900">Payment received and confirmed</span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleMomoSubmit}
                    disabled={!isValid || isProcessing}
                    className="mt-6 w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden">

                {/* Left Side: Order Summary */}
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col hidden md:flex">
                    <button onClick={onClose} className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium">
                        ← Cancel & Close
                    </button>

                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <span className="font-semibold text-gray-700 block">{item.itemName}</span>
                                    <div className="text-gray-500 text-xs mt-0.5">{item.quantity} x GH₵{item.price.toFixed(2)}</div>
                                </div>
                                <span className="font-medium text-gray-900">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-300 pt-4 space-y-2 bg-gray-50">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>GH₵{subtotal.toFixed(2)}</span>
                        </div>
                        {tax > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>GH₵{tax.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                            <span>Total</span>
                            <span>GH₵{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Form */}
                <div className="w-full md:w-2/3 p-8 flex flex-col">
                    {paymentMethod && (
                        <div className="mb-4">
                            <button onClick={handleBack} className="text-primary-600 font-medium hover:underline flex items-center gap-1">
                                ← Change Payment Method
                            </button>
                        </div>
                    )}

                    {!paymentMethod && renderMethodSelection()}
                    {paymentMethod === 'Cash' && renderCashForm()}
                    {paymentMethod === 'Card' && renderCardForm()}
                    {paymentMethod === 'Mobile Money' && renderMomoForm()}
                </div>
            </div>
        </div>
    );
}
