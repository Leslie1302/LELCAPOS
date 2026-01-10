import React from 'react';

export default function InventoryFilters({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    filterBy,
    onFilterChange,
    onClearFilters,
    showClearButton,
}) {
    const sortOptions = [
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'price-asc', label: 'Price (Low to High)' },
        { value: 'price-desc', label: 'Price (High to Low)' },
        { value: 'quantity-asc', label: 'Quantity (Low to High)' },
        { value: 'quantity-desc', label: 'Quantity (High to Low)' },
        { value: 'date-desc', label: 'Date Added (Newest First)' },
        { value: 'date-asc', label: 'Date Added (Oldest First)' },
    ];

    const filterButtons = [
        { value: 'all', label: 'All Items', icon: '📋', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
        { value: 'low-stock', label: 'Low Stock', icon: '⚠️', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
        { value: 'critical', label: 'Critical', icon: '🔴', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
        { value: 'out-of-stock', label: 'Out of Stock', icon: '⚫', color: 'bg-gray-800 text-white hover:bg-gray-700' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            {/* Search Input */}
            <div className="w-full">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search Inventory
                </label>
                <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by item name or details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Sort Dropdown */}
                <div className="w-full md:w-1/3">
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                    </label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quick Filters */}
                <div className="w-full md:w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Filters
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {filterButtons.map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => onFilterChange(btn.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${filterBy === btn.value
                                        ? 'ring-2 ring-primary-500 ring-offset-2 transform scale-105 ' + btn.color.replace('hover:', '')
                                        : 'opacity-80 hover:opacity-100 ' + btn.color
                                    }`}
                            >
                                <span>{btn.icon}</span>
                                {btn.label}
                            </button>
                        ))}

                        {/* Clear Filters Button - Show only when needed */}
                        {showClearButton && (
                            <button
                                onClick={onClearFilters}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-2 ml-auto"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
