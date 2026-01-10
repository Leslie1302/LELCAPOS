import { useSettings } from '../../context/SettingsContext';

export default function ItemDetailModal({ item, onClose, onEdit, onDelete }) {
    const { settings } = useSettings();

    if (!item) return null;

    // ... existing code ...

    // Get stock badge info
    const getStockInfo = () => {
        if (item.quantity === 0) {
            return { color: 'text-gray-700 bg-gray-100', barColor: 'bg-gray-500', label: 'Out of Stock' };
        } else if (item.quantity < settings.criticalStockLevel) {
            return { color: 'text-red-700 bg-red-100', barColor: 'bg-red-600', label: 'Critical' };
        } else if (item.quantity < settings.lowStockThreshold) {
            return { color: 'text-yellow-700 bg-yellow-100', barColor: 'bg-yellow-500', label: 'Low Stock' };
        } else {
            return { color: 'text-green-700 bg-green-100', barColor: 'bg-green-500', label: 'Well Stocked' };
        }
    };

    // Date formatter
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadQR = () => {
        if (!item.qrCode) return;
        const link = document.createElement('a');
        link.href = item.qrCode;
        link.download = `${item.itemName.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintQR = () => {
        if (!item.qrCode) return;
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR - ${item.itemName}</title>
                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            font-family: sans-serif;
                        }
                        img {
                            max-width: 300px;
                            height: auto;
                        }
                        h2 {
                            margin-top: 20px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <img src="${item.qrCode}" alt="${item.itemName}" />
                    <h2>${item.itemName}</h2>
                    <p>GH₵ ${item.price.toFixed(2)}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const stockInfo = getStockInfo();

    // Calculate progress percentage (relative to 3x threshold which is considered "full" for display)
    const targetStock = settings.lowStockThreshold * 3;
    const stockPercentage = Math.min(100, Math.max(5, (item.quantity / targetStock) * 100));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Item Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* QR Code Section */}
                    {item.qrCode && (
                        <div className="flex flex-col items-center bg-gray-50 rounded-lg p-6">
                            <img
                                src={item.qrCode}
                                alt={`QR Code for ${item.itemName}`}
                                className="w-48 h-48 border-2 border-gray-300 rounded"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleDownloadQR}
                                    className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
                                >
                                    📥 Download QR
                                </button>
                                <button
                                    onClick={handlePrintQR}
                                    className="btn bg-secondary-600 hover:bg-secondary-700 text-white text-sm"
                                >
                                    🖨️ Print QR
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Item Information */}
                    <div className="space-y-4">
                        {/* Item Name */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{item.itemName}</h3>
                        </div>

                        {/* Material Details */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 uppercase">
                                Material Details
                            </label>
                            <p className="text-gray-700 mt-1">{item.materialDetails || 'No description provided'}</p>
                        </div>

                        {/* Stock Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Quantity */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="text-sm font-medium text-gray-500 uppercase block mb-2">
                                    Stock Level
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {item.quantity}
                                    </span>
                                    <span className="text-sm text-gray-600">units</span>
                                </div>
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${stockInfo.barColor} transition-all duration-500`}
                                        style={{ width: `${stockPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${stockInfo.color}`}>
                                        {stockInfo.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Target: {targetStock}+
                                    </span>
                                </div>
                            </div>

                            {/* Unit Price */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="text-sm font-medium text-gray-500 uppercase block mb-2">
                                    Unit Price
                                </label>
                                <div className="text-3xl font-bold text-primary-600">
                                    GH₵ {item.price.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Total Value */}
                        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-200">
                            <label className="text-sm font-medium text-gray-600 uppercase block mb-2">
                                Total Inventory Value
                            </label>
                            <div className="text-3xl font-bold text-primary-700">
                                GH₵ {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {item.quantity} units × GH₵ {item.price.toFixed(2)}
                            </p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-gray-500 font-medium">Date Added</label>
                                <p className="text-gray-900">{formatDate(item.dateAdded)}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 font-medium">Last Updated</label>
                                <p className="text-gray-900">{formatDate(item.lastUpdated)}</p>
                            </div>
                        </div>

                        {/* Item ID */}
                        <div className="text-xs text-gray-400">
                            Item ID: {item.id}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onEdit(item)}
                        className="btn bg-blue-600 text-white hover:bg-blue-700"
                    >
                        ✏️ Edit Item
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                    >
                        🗑️ Delete Item
                    </button>
                </div>
            </div>
        </div >
    );
}
