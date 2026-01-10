import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

export default function CartSidebar({ onCheckout }) {
    const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, tax, total } = useCart();

    // State to track if an item quantity is being edited manually
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleQuantityClick = (item) => {
        setEditingId(item.id);
        setEditValue(item.quantity.toString());
    };

    const handleQuantityBlur = (item) => {
        if (editingId === item.id) {
            const newQty = parseInt(editValue, 10);
            if (!isNaN(newQty) && newQty > 0) {
                updateQuantity(item.id, newQty);
            } else {
                // Revert if invalid
                setEditValue(item.quantity.toString());
            }
            setEditingId(null);
        }
    };

    const handleKeyDown = (e, item) => {
        if (e.key === 'Enter') {
            handleQuantityBlur(item);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    const handleIncrement = (item) => {
        // Assume updateQuantity handles max stock check internally or returns limited value
        // But better to check here for UI feedback if we had easy access to maxStock
        updateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = (item) => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        } else {
            // Optional: Confirm remove
            removeFromCart(item.id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl">
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    <h2 className="text-lg font-bold text-gray-800">Current Sale</h2>
                </div>
                {cartItems.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm('Clear cart?')) clearCart();
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-200"
                        title="Clear Cart"
                    >
                        🗑️
                    </button>
                )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <span className="text-6xl mb-4">🛒</span>
                        <p className="text-center font-medium">Your cart is empty</p>
                        <p className="text-sm mt-2 text-center">Select items from the list to start a sale</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="flex flex-col p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{item.itemName}</h4>
                                    {item.materialDetails && (
                                        <p className="text-xs text-gray-500 line-clamp-1">{item.materialDetails}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-400 hover:text-red-500 -mt-1 -mr-1 p-1"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600 font-medium">
                                    GH₵{item.price.toFixed(2)}
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                    <button
                                        onClick={() => handleDecrement(item)}
                                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-100 text-gray-700 font-bold"
                                    >
                                        -
                                    </button>

                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            className="w-10 text-center text-sm border border-primary-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleQuantityBlur(item)}
                                            onKeyDown={(e) => handleKeyDown(e, item)}
                                            autoFocus
                                            min="1"
                                        />
                                    ) : (
                                        <span
                                            className="w-8 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
                                            onClick={() => handleQuantityClick(item)}
                                            title="Click to edit"
                                        >
                                            {item.quantity}
                                        </span>
                                    )}

                                    <button
                                        onClick={() => handleIncrement(item)}
                                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-100 text-gray-700 font-bold"
                                        disabled={item.quantity >= item.maxStock}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="text-sm font-bold text-gray-900 w-16 text-right">
                                    GH₵{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                            {item.quantity >= item.maxStock && (
                                <p className="text-xs text-orange-500 mt-1 text-right">Max stock reached</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal</span>
                        <span>GH₵{subtotal.toFixed(2)}</span>
                    </div>
                    {tax > 0 && (
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Tax</span>
                            <span>GH₵{tax.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-900 font-bold text-xl pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>GH₵{total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cartItems.length === 0}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-all transform active:scale-95
                        ${cartItems.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-primary-500/30'
                        }
                    `}
                >
                    <span>💳</span> Proceed to Payment
                </button>
            </div>
        </div>
    );
}
