import React, { useState } from 'react';
import { calculateGroupStats } from '../../utils/groupingUtils';
import { getStockStatus, getStockColorClasses, getStockIcon, getStockLabel, STOCK_STATUS } from '../../utils/stockAlerts';
import { useSettings } from '../../context/SettingsContext';

export default function GroupedInventoryCard({ group, onItemClick, selectionMode = false, selectedItems = [], onToggleSelect = null }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { settings } = useSettings();
    const stats = calculateGroupStats(group.variants);

    // Calculate low stock variants count for the group
    const lowStockVariantsCount = group.variants.filter(
        v => v.quantity < settings.lowStockThreshold
    ).length;

    const hasCriticalVariant = group.variants.some(
        v => v.quantity < settings.criticalStockLevel && v.quantity > 0
    );

    // If only one variant, show as regular card (no grouping)
    if (group.variants.length === 1) {
        const item = group.variants[0];
        const isSelected = selectedItems.includes(item.id);
        const status = getStockStatus(item.quantity, settings.lowStockThreshold, settings.criticalStockLevel);
        const isCritical = status === STOCK_STATUS.CRITICAL;

        return (
            <div
                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 ${isSelected ? 'border-l-primary-600 ring-2 ring-primary-300' :
                    isCritical ? 'border-l-red-600 animate-pulse' :
                        status === STOCK_STATUS.LOW ? 'border-l-orange-500' :
                            status === STOCK_STATUS.OUT_OF_STOCK ? 'border-l-gray-500' :
                                'border-l-green-500'
                    } overflow-hidden`}
            >
                <div className="relative p-4">
                    {/* Selection Checkbox */}
                    {selectionMode && onToggleSelect && (
                        <div className="absolute top-2 left-2 z-10">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(item.id);
                                }}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                        </div>
                    )}

                    {/* Image Thumbnail */}
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

                        {item.qrCode && (
                            <div className="absolute top-2 right-2 bg-white p-1 rounded shadow-sm border border-gray-200">
                                <img
                                    src={item.qrCode}
                                    alt={`QR for ${item.itemName}`}
                                    className="w-8 h-8"
                                />
                            </div>
                        )}
                    </div>

                    <h3 className={`text-lg font-bold text-gray-900 mb-1 ${selectionMode ? 'pl-8' : ''}`}>
                        {item.itemName}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {item.materialDetails}
                    </p>

                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold text-primary-600">
                            GH₵ {item.price.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Stock: {item.quantity} units
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStockColorClasses(status)}`}>
                            {getStockIcon(status)} {getStockLabel(status)}
                        </span>
                    </div>

                    <button
                        className="w-full btn btn-primary text-sm mt-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemClick(item);
                        }}
                    >
                        View Details
                    </button>
                </div>
            </div>
        );
    }

    // Multiple variants - show expandable group
    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${lowStockVariantsCount > 0 ? 'ring-1 ring-red-200' : ''
            }`}>
            {/* Group Header - Clickable */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${hasCriticalVariant ? 'border-l-red-600' :
                    lowStockVariantsCount > 0 ? 'border-l-orange-500' :
                        'border-l-blue-500'
                    }`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">📦</span>
                            <h3 className="text-lg font-bold text-gray-900">{group.baseName}</h3>
                            {lowStockVariantsCount > 0 && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    ⚠️ {lowStockVariantsCount} low stock
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {stats.variantCount} variants
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                {stats.totalQuantity} units total
                            </span>
                            <span className="text-gray-700 font-medium">
                                {stats.priceRange}
                            </span>
                        </div>
                    </div>

                    <button className="text-2xl text-gray-400 hover:text-gray-600 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        ▼
                    </button>
                </div>
            </div>

            {/* Variants - Show when expanded */}
            {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                    {group.variants.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const status = getStockStatus(item.quantity, settings.lowStockThreshold, settings.criticalStockLevel);

                        return (
                            <div
                                key={item.id}
                                className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors ${isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-300' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Selection Checkbox */}
                                    {selectionMode && onToggleSelect && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onToggleSelect(item.id);
                                            }}
                                            className="w-5 h-5 mt-1 text-primary-600 rounded focus:ring-primary-500 flex-shrink-0"
                                        />
                                    )}

                                    {/* Image Thumbnail or Placeholder */}
                                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.itemName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl opacity-30">📦</span>
                                        )}
                                    </div>

                                    {/* QR Code (if exists, small next to image?) - actually maybe just show Image primarily now */}
                                    {/* Let's keep QR code if desired but image is more visual. 
                                        Or we can show QR code on hover? 
                                        For now let's just REPLACE QR code with Image if present, or show Image. 
                                        Wait, existing code showed QR code. Let's show Image by default, maybe QR code if no image?
                                        Actually let's just show Image. The QR code is less useful for visual ID in list.
                                    */}
                                    {/* Just sticking to image for consistency with design */}

                                    {/* Variant Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900">
                                                ↳ {item.variant || item.itemName}
                                            </h4>
                                            <span className="text-lg font-bold text-primary-600 whitespace-nowrap">
                                                GH₵ {item.price.toFixed(2)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                            {item.materialDetails}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStockColorClasses(status)}`}>
                                                    {item.quantity} units
                                                </span>
                                                {status !== STOCK_STATUS.WELL_STOCKED && (
                                                    <span className="text-xs text-gray-500">
                                                        {getStockIcon(status)}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => onItemClick(item)}
                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
