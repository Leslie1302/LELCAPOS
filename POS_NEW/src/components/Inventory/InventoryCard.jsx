import React from 'react';

export default function InventoryCard({ item, onClick }) {
    // Determine stock level color
    const getStockBadge = () => {
        if (item.quantity === 0) {
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-300',
                label: 'Out of Stock',
            };
        } else if (item.quantity < 10) {
            return {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-300',
                label: `${item.quantity} units`,
            };
        } else if (item.quantity < 20) {
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-300',
                label: `${item.quantity} units`,
            };
        } else {
            return {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-300',
                label: `${item.quantity} units`,
            };
        }
    };

    const stockBadge = getStockBadge();
    const borderColor = item.quantity === 0 ? 'border-l-gray-400' :
        item.quantity < 10 ? 'border-l-red-500' :
            item.quantity < 20 ? 'border-l-yellow-500' : 'border-l-green-500';

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div
            onClick={() => onClick(item)}
            className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 ${borderColor} overflow-hidden`}
        >
            {/* Header with Image and QR Code */}
            <div className="relative p-4 pb-2">
                {/* Image or Placeholder */}
                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 relative group">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.itemName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-4xl opacity-30">📦</span>
                    )}

                    {/* QR Code Overlay (mini) */}
                    {item.qrCode && (
                        <div className="absolute top-2 right-2 bg-white p-1 rounded shadow-sm border border-gray-200">
                            <img
                                src={item.qrCode}
                                alt="QR"
                                className="w-8 h-8"
                            />
                        </div>
                    )}
                </div>

                {/* Item Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {item.itemName}
                </h3>
            </div>

            {/* Body */}
            <div className="px-4 pb-4 space-y-3">
                {/* Material Details */}
                <p className="text-sm text-gray-600 line-clamp-2">
                    {item.materialDetails || 'No description'}
                </p>

                {/* Stock Badge */}
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockBadge.bg} ${stockBadge.text} border ${stockBadge.border}`}>
                        {stockBadge.label}
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary-600">
                        GH₵ {item.price.toFixed(2)}
                    </span>
                </div>

                {/* Date Added */}
                <div className="text-xs text-gray-400">
                    Added {formatDate(item.dateAdded)}
                </div>

                {/* View Details Button */}
                <button
                    className="w-full btn btn-primary text-sm mt-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(item);
                    }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
