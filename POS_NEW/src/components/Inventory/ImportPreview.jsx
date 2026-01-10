import React, { useState } from 'react';
import { validateRow, transformRowToItem } from '../../utils/excelParser';

export default function ImportPreview({
    data,
    headers,
    columnMapping,
    onColumnMappingChange,
    onConfirmImport,
    onCancel,
}) {
    const [previewCount] = useState(10);

    const requiredFields = {
        itemName: 'Item Name',
        materialDetails: 'Material Details',
        quantity: 'Quantity',
        price: 'Price',
    };

    // Check if all required fields are mapped
    const isReadyToImport = Object.keys(requiredFields).every(
        (field) => columnMapping[field] !== null && columnMapping[field] !== ''
    );

    // Validate preview data
    const previewData = data.slice(0, previewCount).map((row, index) => {
        const validation = validateRow(row, columnMapping);
        return {
            index,
            row,
            ...validation,
        };
    });

    const totalValidCount = data.filter((row) => {
        const validation = validateRow(row, columnMapping);
        return validation.isValid;
    }).length;

    const totalInvalidCount = data.length - totalValidCount;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Import Preview
                    </h3>
                    <p className="text-sm text-gray-500">
                        {data.length} rows found. Showing first {Math.min(previewCount, data.length)} rows.
                    </p>
                </div>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>

            {/* Column Mapping */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Column Mapping</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(requiredFields).map(([field, label]) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {label} {field !== 'materialDetails' && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                value={columnMapping[field] || ''}
                                onChange={(e) => onColumnMappingChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">-- Select Column --</option>
                                {headers.map((header) => (
                                    <option key={header} value={header}>
                                        {header}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Validation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">Total Rows</div>
                    <div className="text-2xl font-bold text-blue-900">{data.length}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-600 font-medium">Valid Rows</div>
                    <div className="text-2xl font-bold text-green-900">{totalValidCount}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-600 font-medium">Invalid Rows</div>
                    <div className="text-2xl font-bold text-red-900">{totalInvalidCount}</div>
                </div>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    #
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Item Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Material
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Price (GH₵)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {previewData.map((item) => {
                                const transformedItem = transformRowToItem(item.row, columnMapping);
                                return (
                                    <tr
                                        key={item.index}
                                        className={item.isValid ? '' : 'bg-red-50'}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {item.index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.isValid ? (
                                                <span className="text-green-600">✓</span>
                                            ) : (
                                                <span className="text-red-600" title={item.errors.join(', ')}>
                                                    ✗
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {transformedItem.itemName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {transformedItem.materialDetails}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {transformedItem.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {transformedItem.price.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invalid Rows Warning */}
            {totalInvalidCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <span className="text-yellow-600 text-xl">⚠️</span>
                        <div className="flex-1">
                            <h4 className="font-semibold text-yellow-900">Warning</h4>
                            <p className="text-sm text-yellow-800 mt-1">
                                {totalInvalidCount} row(s) contain errors and will be skipped during import.
                                Only valid rows will be imported.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <button onClick={onCancel} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">
                    Cancel
                </button>
                <button
                    onClick={onConfirmImport}
                    disabled={!isReadyToImport || totalValidCount === 0}
                    className={`btn ${isReadyToImport && totalValidCount > 0
                            ? 'btn-primary'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Confirm Import ({totalValidCount} items)
                </button>
            </div>
        </div>
    );
}
