import * as XLSX from 'xlsx';

/**
 * Parse an Excel or CSV file into JSON format
 * @param {File} file - The uploaded file
 * @returns {Promise<Object>} Object containing parsed data and metadata
 */
export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Get the first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON (header row becomes keys)
                const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

                // Get headers
                const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

                resolve({
                    success: true,
                    data: jsonData,
                    headers,
                    totalRows: jsonData.length,
                    sheetName,
                });
            } catch (error) {
                reject({
                    success: false,
                    error: 'Failed to parse file. Please ensure it is a valid Excel or CSV file.',
                    details: error.message,
                });
            }
        };

        reader.onerror = () => {
            reject({
                success: false,
                error: 'Failed to read file. Please try again.',
            });
        };

        reader.readAsBinaryString(file);
    });
};

/**
 * Auto-detect column mapping from headers
 * @param {Array<string>} headers - Column headers from Excel
 * @returns {Object} Mapped columns
 */
export const autoDetectColumns = (headers) => {
    const mapping = {
        itemName: null,
        materialDetails: null,
        quantity: null,
        price: null,
    };

    const normalizeHeader = (header) => header.toLowerCase().trim().replace(/[_\s-]+/g, '');

    headers.forEach((header, index) => {
        const normalized = normalizeHeader(header);

        // Item Name variations
        if (
            normalized.includes('itemname') ||
            normalized.includes('name') ||
            normalized.includes('product') ||
            normalized === 'item'
        ) {
            mapping.itemName = header;
        }

        // Material Details variations
        if (
            normalized.includes('material') ||
            normalized.includes('description') ||
            normalized.includes('details') ||
            normalized.includes('spec')
        ) {
            mapping.materialDetails = header;
        }

        // Quantity variations
        if (
            normalized.includes('quantity') ||
            normalized.includes('qty') ||
            normalized.includes('stock') ||
            normalized.includes('amount')
        ) {
            mapping.quantity = header;
        }

        // Price variations
        if (
            normalized.includes('price') ||
            normalized.includes('cost') ||
            normalized.includes('rate')
        ) {
            mapping.price = header;
        }
    });

    return mapping;
};

/**
 * Validate a row of data
 * @param {Object} row - Data row
 * @param {Object} columnMapping - Column mapping
 * @returns {Object} Validation result
 */
export const validateRow = (row, columnMapping) => {
    const errors = [];

    // Check Item Name
    const itemName = row[columnMapping.itemName];
    if (!itemName || itemName.toString().trim() === '') {
        errors.push('Item name is required');
    }

    // Check Quantity
    const quantity = row[columnMapping.quantity];
    if (quantity === undefined || quantity === null || quantity === '') {
        errors.push('Quantity is required');
    } else {
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity)) {
            errors.push('Quantity must be a number');
        } else if (numQuantity < 0) {
            errors.push('Quantity cannot be negative');
        }
    }

    // Check Price
    const price = row[columnMapping.price];
    if (price === undefined || price === null || price === '') {
        errors.push('Price is required');
    } else {
        const numPrice = Number(price);
        if (isNaN(numPrice)) {
            errors.push('Price must be a number');
        } else if (numPrice < 0) {
            errors.push('Price cannot be negative');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Transform Excel row to inventory item format
 * @param {Object} row - Excel row data
 * @param {Object} columnMapping - Column mapping
 * @returns {Object} Inventory item data
 */
export const transformRowToItem = (row, columnMapping) => {
    return {
        itemName: row[columnMapping.itemName]?.toString().trim() || '',
        materialDetails: row[columnMapping.materialDetails]?.toString().trim() || '',
        quantity: Number(row[columnMapping.quantity]) || 0,
        price: Number(row[columnMapping.price]) || 0,
    };
};

/**
 * Validate entire dataset
 * @param {Array} data - Array of rows
 * @param {Object} columnMapping - Column mapping
 * @returns {Object} Validation results
 */
export const validateDataset = (data, columnMapping) => {
    const results = data.map((row, index) => {
        const validation = validateRow(row, columnMapping);
        return {
            rowIndex: index,
            row,
            ...validation,
        };
    });

    const validRows = results.filter((r) => r.isValid);
    const invalidRows = results.filter((r) => !r.isValid);

    return {
        totalRows: data.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        validRows,
        invalidRows,
    };
};

/**
 * Generate sample Excel template
 * @returns {Blob} Excel file blob
 */
export const generateSampleTemplate = () => {
    const sampleData = [
        {
            'Item Name': 'Example Item 1',
            'Material Details': 'Description of the item',
            'Quantity': 100,
            'Price': 25.50,
        },
        {
            'Item Name': 'Example Item 2',
            'Material Details': 'Another item description',
            'Quantity': 50,
            'Price': 12.00,
        },
        {
            'Item Name': 'Example Item 3',
            'Material Details': 'Third item details',
            'Quantity': 75,
            'Price': 18.75,
        },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Template');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
};

/**
 * Download sample template
 */
export const downloadSampleTemplate = () => {
    const blob = generateSampleTemplate();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LELCA_POS_Inventory_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
