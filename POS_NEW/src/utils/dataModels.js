import { generateReceiptNumber } from './storage';

// Data model for inventory items
export const createInventoryItem = ({
    itemName,
    materialDetails,
    quantity,
    price,
    qrCode = null,
    image = null,
}) => {
    const now = new Date().toISOString();

    return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemName,
        materialDetails,
        quantity: Number(quantity),
        price: Number(price),
        qrCode,
        image,
        dateAdded: now,
        lastUpdated: now,
    };
};

// Data model for transactions
// Data model for transactions
export const createTransaction = ({
    items,
    subtotal,
    tax,
    totalAmount,
    paymentMethod,
    amountTendered,
    changeGiven,
    cardDetails,
    momoDetails,
    cashier = 'Staff',
}) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();

    return {
        transactionId: `txn-${timestamp}-${randomStr}`,
        receiptNumber: generateReceiptNumber(),
        date: new Date().toISOString(),
        items, // Array of { id, itemName, quantity, unitPrice, lineTotal }
        subtotal: Number(subtotal),
        tax: Number(tax),
        totalAmount: Number(totalAmount),
        paymentMethod, // 'Cash', 'Card', 'Mobile Money'
        // Cash specific
        amountTendered: amountTendered ? Number(amountTendered) : null,
        changeGiven: changeGiven ? Number(changeGiven) : null,
        // Card specific
        cardDetails: paymentMethod === 'Card' ? cardDetails : null,
        // MoMo specific
        momoDetails: paymentMethod === 'Mobile Money' ? momoDetails : null,
        status: 'Completed',
        cashier,
    };
};

// Validate inventory item
export const validateInventoryItem = (item) => {
    const errors = [];

    if (!item.itemName || item.itemName.trim() === '') {
        errors.push('Item name is required');
    }

    if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
        errors.push('Valid quantity is required');
    } else if (item.quantity < 0) {
        errors.push('Quantity cannot be negative');
    }

    if (item.price === undefined || item.price === null || isNaN(item.price)) {
        errors.push('Valid price is required');
    } else if (item.price < 0) {
        errors.push('Price cannot be negative');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
