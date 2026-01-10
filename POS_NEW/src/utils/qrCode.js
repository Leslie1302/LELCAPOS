import QRCode from 'qrcode';

/**
 * Generate QR code for an inventory item
 * @param {Object} item - Inventory item with id and itemName
 * @returns {Promise<string>} Base64 encoded QR code image
 */
export const generateQRCode = async (item) => {
    try {
        // Create QR code data
        const qrData = JSON.stringify({
            id: item.id,
            name: item.itemName,
            type: 'LELCA_POS_ITEM',
        });

        // Generate QR code as base64 data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 200,
            margin: 1,
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
};

/**
 * Generate QR codes for multiple items
 * @param {Array} items - Array of inventory items
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Array>} Items with QR codes added
 */
export const generateQRCodesForItems = async (items, progressCallback = null) => {
    const itemsWithQR = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const qrCode = await generateQRCode(item);

        itemsWithQR.push({
            ...item,
            qrCode,
        });

        // Call progress callback if provided
        if (progressCallback) {
            progressCallback({
                current: i + 1,
                total: items.length,
                percentage: Math.round(((i + 1) / items.length) * 100),
            });
        }
    }

    return itemsWithQR;
};

/**
 * Download QR code as PNG
 * @param {string} qrCodeDataURL - Base64 QR code data URL
 * @param {string} fileName - File name for download
 */
export const downloadQRCode = (qrCodeDataURL, fileName = 'qrcode.png') => {
    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
