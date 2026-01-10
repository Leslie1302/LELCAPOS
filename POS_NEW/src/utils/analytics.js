
import { loadTransactions, loadInventory } from './storage';

/**
 * Filter transactions by date range
 */
const getTransactionsInDateRange = (startDate, endDate) => {
    const transactions = loadTransactions();
    if (!startDate && !endDate) return transactions;

    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return transactions.filter(txn => {
        const txnDate = new Date(txn.date);
        return txnDate >= start && txnDate <= end;
    });
};

/**
 * Calculate Sales Metrics for a given period
 */
export const calculateSalesMetrics = (startDate, endDate) => {
    const transactions = getTransactionsInDateRange(startDate, endDate);

    // Initial metrics
    let totalSales = 0;
    let totalRefunds = 0;
    let transactionCount = 0;
    let refundCount = 0;
    let itemsSold = 0;

    transactions.forEach(txn => {
        // Count all transactions in period
        transactionCount++;

        // Calculate Revenue from Completed and Partially Refunded
        if (txn.status === 'Completed' || txn.status === 'Partially Refunded') {
            totalSales += txn.totalAmount;

            // Add items from this transaction
            txn.items.forEach(item => {
                itemsSold += item.quantity;
            });
        }

        // Handle Refunds (Full and Partial)
        // Note: We need to check if the refund happened IN THIS PERIOD, distinct from the transaction date
        // But for simple reporting (Sales Report by Transaction Date), usually we net it out based on the transaction date
        // OR we scan all refunds that happened in this period.
        // Let's stick to: "Metrics for Transactions originated in this period" mostly, 
        // BUT for "Total Refunds", we often want to know what was refunded *today* regardless of when bought.

        // MIXED APPROACH: 
        // For accurate financial reporting for a specific day:
        // + Sales made that day
        // - Refunds processed that day (even if bought earlier)

        // Let's implement that strict "Cash Flow" approach if possible, but our Refund object has a `refundDate`.
    });


    // RE-CALCULATION For Strict Date-Based Reporting (Cash Flow)
    // 1. Get ALL transactions to scan for refunds occurred in period
    const allTransactions = loadTransactions();
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let periodRefundsTotal = 0;
    let periodRefundsCount = 0;

    allTransactions.forEach(txn => {
        // Check for legacy single refund
        if (txn.refundInfo && txn.refundInfo.refundDate) {
            const rDate = new Date(txn.refundInfo.refundDate);
            if (rDate >= start && rDate <= end) {
                // If it's a legacy structure, it might typically be the full amount
                // But better to use recorded amount if available, or total
                const amount = txn.refundInfo.totalAmount || txn.totalAmount;
                periodRefundsTotal += amount;
                periodRefundsCount++;
            }
        }

        // Check for new array refunds
        if (txn.refunds) {
            txn.refunds.forEach(ref => {
                const rDate = new Date(ref.refundDate);
                if (rDate >= start && rDate <= end) {
                    periodRefundsTotal += ref.totalAmount;
                    periodRefundsCount++;
                }
            });
        }
    });

    // Now Sales (only strictly those made in period)
    const periodTransactions = transactions; // Already filtered by date
    let periodSales = 0;
    let periodTxnCount = 0;
    let periodItemsSold = 0;

    periodTransactions.forEach(txn => {
        // We count the sale if it happened in this period
        // Status validity: Even if now 'Refunded', the SALE happened today.
        // We count the Gross Sale. Net Sales = Gross - Refunds.
        periodSales += txn.totalAmount;
        periodTxnCount++;
        txn.items.forEach(item => {
            periodItemsSold += item.quantity;
        });
    });

    return {
        totalSales: periodSales,
        totalRefunds: periodRefundsTotal,
        netRevenue: periodSales - periodRefundsTotal,
        transactionCount: periodTxnCount,
        refundCount: periodRefundsCount,
        itemsSold: periodItemsSold,
        avgTransaction: periodTxnCount > 0 ? periodSales / periodTxnCount : 0
    };
};

/**
 * Get Hourly Sales Distribution
 */
export const getHourlySalesDistribution = (startDate, endDate) => {
    const transactions = getTransactionsInDateRange(startDate, endDate);
    const hours = {};

    // Initialize 24 hours
    for (let i = 0; i < 24; i++) {
        const h = i.toString().padStart(2, '0');
        hours[`${h}:00`] = { time: `${h}:00`, sales: 0, count: 0 };
    }

    transactions.forEach(txn => {
        const date = new Date(txn.date);
        const hour = date.getHours().toString().padStart(2, '0') + ':00';

        hours[hour].sales += txn.totalAmount;
        hours[hour].count += 1;
    });

    return Object.values(hours);
};

/**
 * Get Payment Method Stats
 */
export const getPaymentMethodStats = (startDate, endDate) => {
    const transactions = getTransactionsInDateRange(startDate, endDate);
    const stats = {
        'Cash': { value: 0, count: 0, color: '#10B981' },
        'Card': { value: 0, count: 0, color: '#3B82F6' },
        'Mobile Money': { value: 0, count: 0, color: '#F97316' },
        'Other': { value: 0, count: 0, color: '#9CA3AF' }
    };

    transactions.forEach(txn => {
        const method = txn.paymentMethod || 'Other';
        if (stats[method]) {
            stats[method].value += txn.totalAmount;
            stats[method].count += 1;
        } else {
            stats['Other'].value += txn.totalAmount;
            stats['Other'].count += 1;
        }
    });

    return Object.keys(stats).map(key => ({
        name: key,
        ...stats[key]
    })).filter(item => item.value > 0);
};

/**
 * Get Top Selling Items
 */
export const getTopSellingItems = (startDate, endDate, limit = 10) => {
    const transactions = getTransactionsInDateRange(startDate, endDate);
    const itemMap = {};

    transactions.forEach(txn => {
        txn.items.forEach(item => {
            if (!itemMap[item.itemName]) {
                itemMap[item.itemName] = { name: item.itemName, quantity: 0, revenue: 0 };
            }
            itemMap[item.itemName].quantity += item.quantity;
            itemMap[item.itemName].revenue += item.lineTotal;
        });
    });

    const sortedItems = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

    // Calculate percentages for progress bars
    const maxQty = sortedItems.length > 0 ? sortedItems[0].quantity : 1;

    return sortedItems.slice(0, limit).map(item => ({
        ...item,
        percent: Math.round((item.quantity / maxQty) * 100)
    }));
};

/**
 * Calculate Inventory Metrics
 */
export const calculateInventoryMetrics = () => {
    const inventory = loadInventory();

    let totalItems = inventory.length;
    let totalStockUnits = 0;
    let inventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let wellStockedCount = 0;
    let mediumStockCount = 0;

    const lowStockThreshold = 10;
    const mediumThreshold = 20;

    inventory.forEach(item => {
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;

        totalStockUnits += qty;
        inventoryValue += qty * price;

        if (qty === 0) outOfStockCount++;
        else if (qty < lowStockThreshold) lowStockCount++;
        else if (qty < mediumThreshold) mediumStockCount++;
        else wellStockedCount++;
    });

    const stockDistribution = [
        { name: 'Well Stocked', value: wellStockedCount, color: '#10B981' },
        { name: 'Medium', value: mediumStockCount, color: '#FBBF24' },
        { name: 'Low Stock', value: lowStockCount, color: '#F97316' },
        { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' },
    ].filter(i => i.value > 0);

    return {
        totalItems,
        totalStockUnits,
        inventoryValue,
        lowStockItems: inventory.filter(i => i.quantity > 0 && i.quantity < lowStockThreshold),
        outOfStockItems: inventory.filter(i => i.quantity === 0),
        stockDistribution
    };
};
