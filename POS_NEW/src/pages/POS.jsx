import React, { useState } from 'react';
import ProductGrid from '../components/POS/ProductGrid';
import CartSidebar from '../components/POS/CartSidebar';
import PaymentModal from '../components/POS/PaymentModal';
import SuccessScreen from '../components/POS/SuccessScreen';
import { useCart } from '../context/CartContext';
import { useInventory } from '../context/InventoryContext';
import { createTransaction } from '../utils/dataModels';
import { addTransaction } from '../utils/storage';

export default function POS() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [showCartMobile, setShowCartMobile] = useState(false);

    const { cartItems, subtotal, tax, total, clearCart, itemCount } = useCart();
    const { inventory, bulkUpdateItems } = useInventory();

    const handleCheckout = () => {
        setIsPaymentModalOpen(true);
    };

    const handleCompleteSale = async (paymentDetails) => {
        // 1. Prepare transaction data
        const transaction = createTransaction({
            items: cartItems.map(item => ({
                id: item.id,
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.price,
                lineTotal: item.price * item.quantity
            })),
            subtotal,
            tax,
            totalAmount: total,
            paymentMethod: paymentDetails.paymentMethod,
            amountTendered: paymentDetails.amountTendered,
            changeGiven: paymentDetails.changeGiven,
            cardDetails: paymentDetails.cardDetails,
            momoDetails: paymentDetails.momoDetails
        });

        // 2. Update Inventory (Deduct stock)
        const inventoryUpdates = cartItems.map(cartItem => {
            const inventoryItem = inventory.find(i => i.id === cartItem.id);
            if (!inventoryItem) return null;
            return {
                id: cartItem.id,
                quantity: Math.max(0, inventoryItem.quantity - cartItem.quantity)
            };
        }).filter(Boolean);

        await bulkUpdateItems(inventoryUpdates);

        // 3. Save Transaction
        addTransaction(transaction);

        // 4. Show Success & Clear
        setLastTransaction(transaction);
        setIsPaymentModalOpen(false);
        clearCart();
    };

    const handleNewSale = () => {
        setLastTransaction(null);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-screen overflow-hidden bg-gray-100 relative">
            {/* Left Side: Product Grid (Full width on mobile, 60% on desktop) */}
            <div className="w-full md:w-3/5 h-full">
                <ProductGrid />
            </div>

            {/* Right Side: Cart (Hidden on mobile unless toggled, 40% on desktop) */}
            <div className={`
                fixed inset-0 z-40 md:static md:z-auto md:w-2/5 md:block transition-transform duration-300
                ${showCartMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
            `}>
                <div className="h-full bg-white md:border-l border-gray-200">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setShowCartMobile(false)}
                        className="md:hidden absolute top-4 right-4 p-2 bg-gray-100 rounded-full z-50"
                    >
                        ✕
                    </button>
                    <CartSidebar onCheckout={handleCheckout} />
                </div>
            </div>

            {/* Mobile Cart Toggle (Bottom Bar) */}
            <div className="md:hidden fixed bottom-[60px] left-0 right-0 p-4 z-30 pointer-events-none">
                <button
                    onClick={() => setShowCartMobile(true)}
                    className="w-full bg-primary-600 text-white shadow-xl rounded-xl p-4 flex justify-between items-center pointer-events-auto"
                >
                    <div className="flex items-center gap-2">
                        <span className="bg-white text-primary-600 px-2 py-0.5 rounded-full text-sm font-bold">
                            {itemCount}
                        </span>
                        <span className="font-medium">View Cart</span>
                    </div>
                    <span className="font-bold text-lg">GH₵{total.toFixed(2)}</span>
                </button>
            </div>

            {/* Modals */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onComplete={handleCompleteSale}
            />

            {lastTransaction && (
                <SuccessScreen
                    transaction={lastTransaction}
                    onNewSale={handleNewSale}
                />
            )}
        </div>
    );
}
