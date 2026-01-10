/**
 * Stock Alert Utilities
 * Manages low stock detection, status calculation, and restock suggestions
 */

// Stock status levels
export const STOCK_STATUS = {
    WELL_STOCKED: 'WELL_STOCKED',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    CRITICAL: 'CRITICAL',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
};

/**
 * Determine stock status based on quantity and threshold
 * @param {number} quantity - Current item quantity
 * @param {number} threshold - Low stock threshold
 * @param {number} criticalLevel - Critical stock level
 * @returns {string} Stock status enum
 */
export const getStockStatus = (quantity, threshold = 10, criticalLevel = 3) => {
    if (quantity === 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (quantity < criticalLevel) return STOCK_STATUS.CRITICAL;
    if (quantity < threshold) return STOCK_STATUS.LOW;
    if (quantity < threshold * 2) return STOCK_STATUS.MEDIUM;
    return STOCK_STATUS.WELL_STOCKED;
};

/**
 * Get color classes for stock status badge
 * @param {string} status - Stock status enum
 * @returns {string} Tailwind CSS classes
 */
export const getStockColorClasses = (status) => {
    switch (status) {
        case STOCK_STATUS.WELL_STOCKED:
            return 'bg-green-100 text-green-700 border-green-300';
        case STOCK_STATUS.MEDIUM:
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case STOCK_STATUS.LOW:
            return 'bg-orange-100 text-orange-700 border-orange-300';
        case STOCK_STATUS.CRITICAL:
            return 'bg-red-100 text-red-700 border-red-300';
        case STOCK_STATUS.OUT_OF_STOCK:
            return 'bg-gray-100 text-gray-700 border-gray-300';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-300';
    }
};

/**
 * Get status icon emoji
 * @param {string} status - Stock status enum
 * @returns {string} Emoji icon
 */
export const getStockIcon = (status) => {
    switch (status) {
        case STOCK_STATUS.WELL_STOCKED:
            return '🟢';
        case STOCK_STATUS.MEDIUM:
            return '🟡';
        case STOCK_STATUS.LOW:
            return '🟠';
        case STOCK_STATUS.CRITICAL:
            return '🔴';
        case STOCK_STATUS.OUT_OF_STOCK:
            return '⚫';
        default:
            return '⚪';
    }
};

/**
 * Get human-readable status label
 * @param {string} status - Stock status enum
 * @returns {string} Status label
 */
export const getStockLabel = (status) => {
    switch (status) {
        case STOCK_STATUS.WELL_STOCKED:
            return 'Well Stocked';
        case STOCK_STATUS.MEDIUM:
            return 'Medium Stock';
        case STOCK_STATUS.LOW:
            return 'Low Stock';
        case STOCK_STATUS.CRITICAL:
            return 'Critical';
        case STOCK_STATUS.OUT_OF_STOCK:
            return 'Out of Stock';
        default:
            return 'Unknown';
    }
};

/**
 * Filter items that are low stock or worse
 * @param {Array} inventory - Array of inventory items
 * @param {number} threshold - Low stock threshold
 * @returns {Array} Filtered low stock items
 */
export const getLowStockItems = (inventory, threshold = 10) => {
    return inventory.filter(item => item.quantity < threshold);
};

/**
 * Filter items at critical level
 * @param {Array} inventory - Array of inventory items
 * @param {number} criticalLevel - Critical stock level
 * @returns {Array} Filtered critical items
 */
export const getCriticalItems = (inventory, criticalLevel = 3) => {
    return inventory.filter(item => item.quantity < criticalLevel && item.quantity > 0);
};

/**
 * Filter out of stock items
 * @param {Array} inventory - Array of inventory items
 * @returns {Array} Out of stock items
 */
export const getOutOfStockItems = (inventory) => {
    return inventory.filter(item => item.quantity === 0);
};

/**
 * Calculate suggested restock quantity
 * Suggests bringing stock up to threshold × 3
 * @param {number} currentQty - Current quantity
 * @param {number} threshold - Low stock threshold
 * @returns {number} Suggested quantity to add
 */
export const calculateRestockSuggestion = (currentQty, threshold = 10) => {
    const targetQty = threshold * 3;
    const suggestion = Math.max(0, targetQty - currentQty);
    return suggestion;
};

/**
 * Sort low stock items by priority (most critical first)
 * @param {Array} items - Array of items
 * @param {number} threshold - Low stock threshold
 * @param {number} criticalLevel - Critical stock level
 * @returns {Array} Sorted items
 */
export const sortByPriority = (items, threshold = 10, criticalLevel = 3) => {
    return [...items].sort((a, b) => {
        const statusA = getStockStatus(a.quantity, threshold, criticalLevel);
        const statusB = getStockStatus(b.quantity, threshold, criticalLevel);

        // Priority order: OUT_OF_STOCK > CRITICAL > LOW > MEDIUM > WELL_STOCKED
        const priority = {
            [STOCK_STATUS.OUT_OF_STOCK]: 0,
            [STOCK_STATUS.CRITICAL]: 1,
            [STOCK_STATUS.LOW]: 2,
            [STOCK_STATUS.MEDIUM]: 3,
            [STOCK_STATUS.WELL_STOCKED]: 4,
        };

        const priorityDiff = priority[statusA] - priority[statusB];

        // If same priority, sort by quantity (lowest first)
        if (priorityDiff === 0) {
            return a.quantity - b.quantity;
        }

        return priorityDiff;
    });
};

/**
 * Sort items by value (price × remaining quantity)
 * @param {Array} items - Array of items
 * @returns {Array} Sorted items (highest value first)
 */
export const sortByValue = (items) => {
    return [...items].sort((a, b) => {
        const valueA = a.price * a.quantity;
        const valueB = b.price * b.quantity;
        return valueB - valueA;
    });
};

/**
 * Calculate total value at risk for low stock items
 * @param {Array} lowStockItems - Array of low stock items
 * @returns {number} Total value
 */
export const calculateValueAtRisk = (lowStockItems) => {
    return lowStockItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};
