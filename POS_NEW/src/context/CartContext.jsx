import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);

    // Use settings for tax rate (defaulting to 0 if not set, though requirement mentioned 12.5% VAT)
    // For now we'll simulate a tax setting or keep it 0 as per plan "Tax calculation: ... If tax disabled, hide this line"
    // Let's assume 0 for now as specified in the plan 'default to 0 for simplicity' unless settings context has it.
    const { settings } = useSettings();
    const taxRate = settings?.taxRate || 0;

    // Calculate totals whenever cart items change
    useEffect(() => {
        const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTax = newSubtotal * (taxRate / 100);
        const newTotal = newSubtotal + newTax;

        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newTotal);
    }, [cartItems, taxRate]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                // Check stock limit
                if (existingItem.quantity >= item.quantity) { // Item.quantity here refers to available stock?
                    // This logic needs to be careful. The 'item' passed in usually has the available stock quantity.
                    // But in the cart 'quantity' is how many we are buying.
                    // Let's assume 'item' passed has 'quantity' as available stock.
                    // And existingItem.quantity is cart quantity.
                    if (existingItem.quantity < item.quantity) {
                        return prev.map(i =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        );
                    }
                    return prev; // Max stock reached
                }
                // This logic is bit tricky without standardized validation outside.
                // For now, simple increment. Specific validation can happen in the UI handler too.
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            // Add new item with qty 1
            // We store maxStock in the cart item to validate later easily
            return [...prev, { ...item, quantity: 1, maxStock: item.quantity }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, newQuantity) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    // Validate against maxStock
                    const limit = item.maxStock || Infinity;
                    const validatedQty = Math.max(1, Math.min(newQuantity, limit));
                    return { ...item, quantity: validatedQty };
                }
                return item;
            });
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        total,
        itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
