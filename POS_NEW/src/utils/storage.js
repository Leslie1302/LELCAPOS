const INVENTORY_KEY = 'lelca_pos_inventory';
const TRANSACTIONS_KEY = 'lelca_pos_transactions';

// ============ INVENTORY FUNCTIONS ============

/**
 * Load all inventory items from localStorage
 * @returns {Array} Array of inventory items
 */
export const loadInventory = () => {
    try {
        const data = localStorage.getItem(INVENTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading inventory:', error);
        return [];
    }
};

/**
 * Save inventory array to localStorage
 * @param {Array} items - Array of inventory items
 */
export const saveInventory = (items) => {
    try {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving inventory:', error);
        return false;
    }
};

/**
 * Add a new item to inventory
 * @param {Object} item - Inventory item to add
 * @returns {Array} Updated inventory array
 */
export const addItem = (item) => {
    const inventory = loadInventory();
    const updatedInventory = [...inventory, item];
    saveInventory(updatedInventory);
    return updatedInventory;
};

/**
 * Update an existing item in inventory
 * @param {string} id - Item ID to update
 * @param {Object} updatedData - Partial item data to update
 * @returns {Array} Updated inventory array
 */
export const updateItem = (id, updatedData) => {
    const inventory = loadInventory();
    const updatedInventory = inventory.map((item) =>
        item.id === id
            ? { ...item, ...updatedData, lastUpdated: new Date().toISOString() }
            : item
    );
    saveInventory(updatedInventory);
    return updatedInventory;
};

/**
 * Delete an item from inventory
 * @param {string} id - Item ID to delete
 * @returns {Array} Updated inventory array
 */
export const deleteItem = (id) => {
    const inventory = loadInventory();
    const updatedInventory = inventory.filter((item) => item.id !== id);
    saveInventory(updatedInventory);
    return updatedInventory;
};

/**
 * Get a specific item by ID
 * @param {string} id - Item ID to find
 * @returns {Object|null} Item object or null if not found
 */
export const getItemById = (id) => {
    const inventory = loadInventory();
    return inventory.find((item) => item.id === id) || null;
};

/**
 * Clear all inventory data
 */
export const clearInventory = () => {
    try {
        localStorage.removeItem(INVENTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing inventory:', error);
        return false;
    }
};

// ============ TRANSACTION FUNCTIONS ============

/**
 * Load all transactions from localStorage
 * @returns {Array} Array of transactions
 */
export const loadTransactions = () => {
    try {
        const data = localStorage.getItem(TRANSACTIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
    }
};

/**
 * Save transactions array to localStorage
 * @param {Array} transactions - Array of transaction objects
 */
export const saveTransactions = (transactions) => {
    try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
        return true;
    } catch (error) {
        console.error('Error saving transactions:', error);
        return false;
    }
};

/**
 * Add a new transaction
 * @param {Object} transaction - Transaction object
 * @returns {Array} Updated transactions array
 */
export const addTransaction = (transaction) => {
    const transactions = loadTransactions();
    const updatedTransactions = [transaction, ...transactions]; // New transactions at the top
    saveTransactions(updatedTransactions);
    return updatedTransactions;
};


/**
 * Generate a unique refund note number
 * @returns {string} Refund note number
 */
export const generateRefundNoteNumber = () => {
    let counter = localStorage.getItem('lelca_pos_refund_counter') || 0;
    counter = parseInt(counter) + 1;
    localStorage.setItem('lelca_pos_refund_counter', counter);
    return `REF-${String(counter).padStart(5, '0')}`;
};

/**
 * Refund a transaction
 * @param {string} transactionId - ID of transaction to refund
 * @param {Object} refundDetails - Refund metadata
 * @returns {Object} Updated transaction
 */
/**
 * Refund a transaction (Full or Partial)
 * @param {string} transactionId - ID of transaction to refund
 * @param {Object} refundDetails - Refund metadata { reason, notes, ... }
 * @param {Array} itemsToRefund - Array of { itemId, quantity }
 * @returns {Object} Updated transaction
 */
export const refundTransaction = (transactionId, refundDetails, itemsToRefund) => {
    const transactions = loadTransactions();
    const txnIndex = transactions.findIndex(t => t.transactionId === transactionId);

    if (txnIndex === -1) throw new Error('Transaction not found');
    const transaction = transactions[txnIndex];

    if (transaction.status === 'Refunded') throw new Error('Transaction is already fully refunded');

    // Calculate previously refunded quantities to validate
    const previousRefunds = transaction.refunds || [];
    const refundedQtyMap = {};
    previousRefunds.forEach(ref => {
        ref.items.forEach(item => {
            refundedQtyMap[item.itemId] = (refundedQtyMap[item.itemId] || 0) + item.quantity;
        });
    });

    // Validate and Prepare Refund Items
    const refundItemsSnapshot = [];
    let refundTotalAmount = 0;

    const inventory = loadInventory();

    itemsToRefund.forEach(refundRequest => {
        const originalItem = transaction.items.find(i => i.id === refundRequest.itemId || i.itemId === refundRequest.itemId); // Handle potential ID naming mismatch
        if (!originalItem) throw new Error(`Item ${refundRequest.itemId} not found in transaction`);

        const alreadyRefunded = refundedQtyMap[refundRequest.itemId] || 0;
        const remainingQty = originalItem.quantity - alreadyRefunded;

        if (refundRequest.quantity > remainingQty) {
            throw new Error(`Cannot refund ${refundRequest.quantity} of ${originalItem.itemName}. Only ${remainingQty} remaining.`);
        }

        if (refundRequest.quantity <= 0) return;

        // Restore Inventory
        const itemIndex = inventory.findIndex(i => i.id === refundRequest.itemId);
        if (itemIndex !== -1) {
            inventory[itemIndex].quantity += refundRequest.quantity;
            inventory[itemIndex].lastUpdated = new Date().toISOString();
        }

        // Calculate Refund Amount for this item (pro-rated logic if needed, but simple unit price is fine)
        const itemTotal = refundRequest.quantity * originalItem.unitPrice;
        refundTotalAmount += itemTotal;

        refundItemsSnapshot.push({
            itemId: refundRequest.itemId,
            itemName: originalItem.itemName,
            quantity: refundRequest.quantity,
            unitPrice: originalItem.unitPrice,
            lineTotal: itemTotal
        });
    });

    if (refundItemsSnapshot.length === 0) throw new Error("No items selected for refund");

    saveInventory(inventory);

    // Create Refund Record
    const refundNoteNumber = generateRefundNoteNumber();
    const newRefundRecord = {
        refundNoteNumber,
        refundDate: new Date().toISOString(),
        items: refundItemsSnapshot,
        totalAmount: refundTotalAmount, // Subtotal basically
        ...refundDetails
    };

    const updatedRefunds = [...previousRefunds, newRefundRecord];

    // Determine New Status
    const totalOriginalQty = transaction.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalRefundedQty = updatedRefunds.reduce((sum, r) => sum + r.items.reduce((isum, i) => isum + i.quantity, 0), 0);

    const newStatus = totalRefundedQty >= totalOriginalQty ? 'Refunded' : 'Partially Refunded';

    const updatedTransaction = {
        ...transaction,
        status: newStatus,
        refunds: updatedRefunds
    };

    transactions[txnIndex] = updatedTransaction;
    saveTransactions(transactions);

    return updatedTransaction;
};
/**
 * Generate a unique receipt number
 * @returns {string} Receipt number
 */
export const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${timestamp}-${random}`;
};

/**
 * Get transactions for today
 * @returns {Array} Array of today's transactions
 */
export const getTodaysTransactions = () => {
    const transactions = loadTransactions();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return transactions.filter((txn) => {
        const txnDate = new Date(txn.date).toISOString().split('T')[0];
        return txnDate === today;
    });
};

/**
 * Calculate today's sales total
 * @returns {number} Total sales amount for today
 */
export const getTodaysSalesTotal = () => {
    try {
        const todaysTxns = getTodaysTransactions();
        return todaysTxns
            .filter((txn) => txn.status === 'Completed')
            .reduce((total, txn) => total + txn.totalAmount, 0);

        // Subtract refunds processed today (optional logic depending on accounting)
        // For now, we only count 'Completed' sales as revenue.
        // If a sale from yesterday is refunded today, does it affect today's sales?
        // Usually, cash drawer balance is affected.
        // Let's stick to "Current Active Sales Revenue" for this specific function.
    } catch (error) {
        console.error('Error calculating todays sales:', error);
        return 0;
    }
};

/**
 * Clear all transaction data
 */
export const clearTransactions = () => {
    try {
        localStorage.removeItem(TRANSACTIONS_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing transactions:', error);
        return false;
    }
};

/**
 * Get sales history for the last N days
 * @param {number} days - Number of days to look back
 * @returns {Array} Array of { date, sales } objects
 */
export const getSalesHistory = (days = 7) => {
    try {
        const transactions = loadTransactions();
        const history = [];
        const today = new Date();

        // Create map of last N days initialized to 0
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            // Format: "Jan 10"
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            history.push({ date: dateStr, label, sales: 0 });
        }

        // Aggregate sales
        transactions.forEach(txn => {
            if (txn.status !== 'Completed' || !txn.date) return;

            try {
                const txnDateObj = new Date(txn.date);
                if (isNaN(txnDateObj.getTime())) return; // Skip invalid dates

                const txnDate = txnDateObj.toISOString().split('T')[0];
                const dayStat = history.find(h => h.date === txnDate);
                if (dayStat) {
                    dayStat.sales += txn.totalAmount;
                }
            } catch (e) {
                console.warn('Skipping transaction with invalid date:', txn);
            }
        });

        return history;
    } catch (error) {
        console.error('Error getting sales history:', error);
        return [];
    }
};

/**
 * Get top selling items
 * @param {number} limit - Number of items to return
 * @returns {Array} Array of { name, quantity, revenue }
 */
export const getTopSellingItems = (limit = 5) => {
    try {
        const transactions = loadTransactions();
        const itemMap = {};

        transactions.forEach(txn => {
            if (txn.status !== 'Completed' || !txn.items) return;
            txn.items.forEach(item => {
                if (!itemMap[item.itemName]) {
                    itemMap[item.itemName] = { name: item.itemName, quantity: 0, revenue: 0 };
                }
                itemMap[item.itemName].quantity += item.quantity || 0;
                itemMap[item.itemName].revenue += item.lineTotal || 0;
            });
        });

        return Object.values(itemMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting top items:', error);
        return [];
    }
};

/**
 * Get payment method statistics
 * @returns {Array} Array of { name, value } for pie chart
 */
export const getPaymentMethodStats = () => {
    try {
        const transactions = loadTransactions();
        const stats = {
            'Cash': 0,
            'Card': 0,
            'Mobile Money': 0
        };

        transactions.forEach(txn => {
            if (txn.status !== 'Completed') return;
            const method = txn.paymentMethod;
            if (method && stats[method] !== undefined) {
                stats[method] += 1;
            } else if (method) {
                // Handle unknown methods if any
                if (!stats['Other']) stats['Other'] = 0;
                stats['Other'] += 1;
            }
        });

        return Object.entries(stats)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    } catch (error) {
        console.error('Error getting payment stats:', error);
        return [];
    }
};
