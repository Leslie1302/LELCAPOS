/**
 * Intelligent Inventory Grouping Utilities
 * Handles smart grouping of inventory items by base name with variant extraction
 */

/**
 * Extract base name and variant from item name
 * Examples:
 *   "Coke (350ml)" → { baseName: "Coke", variant: "350ml" }
 *   "Hammer" → { baseName: "Hammer", variant: null }
 */
export function extractBaseNameAndVariant(itemName) {
    if (!itemName) return { baseName: '', variant: null };

    const match = itemName.match(/^(.+?)\s*\((.+?)\)\s*$/);

    if (match) {
        return {
            baseName: match[1].trim(),
            variant: match[2].trim(),
        };
    }

    return {
        baseName: itemName.trim(),
        variant: null,
    };
}

/**
 * Normalize base name for matching (handles plurals, case)
 * Examples:
 *   "Hammers" → "hammer"
 *   "Nails" → "nail"
 *   "Coke" → "coke"
 */
export function normalizeBaseName(baseName) {
    if (!baseName) return '';

    let normalized = baseName.toLowerCase().trim();

    // Remove trailing 's' for plural matching (simple approach)
    // Only remove if word is longer than 3 characters to avoid "gas" → "ga"
    if (normalized.length > 3 && normalized.endsWith('s') && !normalized.endsWith('ss')) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
}

/**
 * Generate group key from base name
 */
export function getGroupKey(baseName) {
    return normalizeBaseName(baseName);
}

/**
 * Group inventory items by base name
 * Returns: { groupKey: { baseName, variants: [item1, item2, ...] } }
 */
export function groupInventoryItems(items) {
    const groups = {};

    items.forEach((item) => {
        const { baseName, variant } = extractBaseNameAndVariant(item.itemName);
        const groupKey = getGroupKey(baseName);

        if (!groups[groupKey]) {
            groups[groupKey] = {
                baseName: baseName, // Use original case for display
                normalizedName: groupKey,
                variants: [],
            };
        }

        // Add variant info to item for easy access
        const itemWithVariant = {
            ...item,
            baseName,
            variant,
            groupKey,
        };

        groups[groupKey].variants.push(itemWithVariant);
    });

    return groups;
}

/**
 * Calculate statistics for a group
 */
export function calculateGroupStats(variants) {
    if (!variants || variants.length === 0) {
        return {
            totalQuantity: 0,
            variantCount: 0,
            minPrice: 0,
            maxPrice: 0,
            priceRange: 'GH₵ 0.00',
        };
    }

    const totalQuantity = variants.reduce((sum, item) => sum + item.quantity, 0);
    const prices = variants.map((item) => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    let priceRange;
    if (minPrice === maxPrice) {
        priceRange = `GH₵ ${minPrice.toFixed(2)}`;
    } else {
        priceRange = `GH₵ ${minPrice.toFixed(2)} - GH₵ ${maxPrice.toFixed(2)}`;
    }

    return {
        totalQuantity,
        variantCount: variants.length,
        minPrice,
        maxPrice,
        priceRange,
    };
}

/**
 * Sort variants within a group
 */
export function sortVariants(variants, sortBy = 'name') {
    const sorted = [...variants];

    switch (sortBy) {
        case 'name':
            sorted.sort((a, b) => {
                const variantA = a.variant || a.itemName;
                const variantB = b.variant || b.itemName;
                return variantA.localeCompare(variantB);
            });
            break;
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'quantity-asc':
            sorted.sort((a, b) => a.quantity - b.quantity);
            break;
        case 'quantity-desc':
            sorted.sort((a, b) => b.quantity - a.quantity);
            break;
        default:
            break;
    }

    return sorted;
}

/**
 * Convert grouped data to flat array (for backwards compatibility)
 */
export function flattenGroups(groups) {
    const items = [];

    Object.values(groups).forEach((group) => {
        items.push(...group.variants);
    });

    return items;
}

/**
 * Check if an item is part of a group (has multiple variants)
 */
export function isGrouped(groupKey, groups) {
    return groups[groupKey] && groups[groupKey].variants.length > 1;
}

/**
 * Search items and return matching groups
 * Returns groups where at least one variant matches the query
 */
export function searchGroupedItems(groups, query) {
    if (!query || !query.trim()) {
        return groups;
    }

    const lowerQuery = query.toLowerCase();
    const matchingGroups = {};

    Object.entries(groups).forEach(([groupKey, group]) => {
        const matchingVariants = group.variants.filter((item) => {
            const matchesName = item.itemName.toLowerCase().includes(lowerQuery);
            const matchesBase = item.baseName.toLowerCase().includes(lowerQuery);
            const matchesVariant = item.variant && item.variant.toLowerCase().includes(lowerQuery);
            const matchesDetails = item.materialDetails.toLowerCase().includes(lowerQuery);

            return matchesName || matchesBase || matchesVariant || matchesDetails;
        });

        if (matchingVariants.length > 0) {
            matchingGroups[groupKey] = {
                ...group,
                variants: matchingVariants,
            };
        }
    });

    return matchingGroups;
}
