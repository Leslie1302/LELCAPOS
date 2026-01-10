import React, { useState } from 'react';
import { generateQRCode } from '../../utils/qrCode';
import ImageSelectionModal from './ImageSelectionModal';

export default function AddItemModal({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        itemName: '',
        materialDetails: '',
        quantity: 0,
        price: 0,
        image: null,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleImageSelect = (base64Image) => {
        setFormData(prev => ({ ...prev, image: base64Image }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.itemName.trim()) {
            newErrors.itemName = 'Item name is required';
        } else if (formData.itemName.length > 100) {
            newErrors.itemName = 'Item name must be less than 100 characters';
        }

        if (!formData.materialDetails.trim()) {
            newErrors.materialDetails = 'Material details are required';
        } else if (formData.materialDetails.length > 500) {
            newErrors.materialDetails = 'Material details must be less than 500 characters';
        }

        const quantity = Number(formData.quantity);
        if (isNaN(quantity) || quantity < 0) {
            newErrors.quantity = 'Quantity must be at least 0';
        } else if (quantity > 999999) {
            newErrors.quantity = 'Quantity must be less than 1,000,000';
        }

        const price = Number(formData.price);
        if (isNaN(price) || price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        } else if (price > 999999.99) {
            newErrors.price = 'Price must be less than 1,000,000';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Generate QR code
            const tempId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const qrCode = await generateQRCode({
                id: tempId,
                name: formData.itemName,
                type: 'LELCA_POS_ITEM',
            });

            const newItem = {
                itemName: formData.itemName.trim(),
                materialDetails: formData.materialDetails.trim(),
                quantity: Number(formData.quantity),
                price: Number(formData.price),
                qrCode,
                image: formData.image,
            };

            onAdd(newItem);
            onClose();
        } catch (error) {
            console.error('Error adding item:', error);
            setErrors({ submit: 'Failed to add item. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Image Section */}
                        <div className="flex justify-center">
                            <div className="relative group">
                                <button
                                    type="button"
                                    onClick={() => setShowImageModal(true)}
                                    className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary-500 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    {formData.image ? (
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-2">
                                            <span className="text-2xl block mb-1">📷</span>
                                            <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                                        </div>
                                    )}

                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                        {formData.image && <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">Change</span>}
                                    </div>
                                </button>
                                {formData.image && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData(prev => ({ ...prev, image: null }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-sm hover:bg-red-200 text-xs font-bold"
                                        title="Remove Image"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Item Name */}
                        <div>
                            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="itemName"
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                autoFocus
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.itemName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="e.g., Coca-Cola (350ml)"
                                disabled={isSubmitting}
                            />
                            {errors.itemName && (
                                <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>
                            )}
                        </div>

                        {/* Material Details */}
                        <div>
                            <label htmlFor="materialDetails" className="block text-sm font-medium text-gray-700 mb-1">
                                Material Details <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="materialDetails"
                                name="materialDetails"
                                value={formData.materialDetails}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.materialDetails ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Describe the item..."
                                disabled={isSubmitting}
                            />
                            {errors.materialDetails && (
                                <p className="text-red-500 text-sm mt-1">{errors.materialDetails}</p>
                            )}
                        </div>

                        {/* Quantity and Price Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="0"
                                    max="999999"
                                    step="1"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="0"
                                    disabled={isSubmitting}
                                    onFocus={(e) => e.target.select()}
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (GH₵) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">GH₵</span>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0.01"
                                        max="999999.99"
                                        step="0.01"
                                        className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                        disabled={isSubmitting}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Adding...
                                    </>
                                ) : (
                                    '✓ Add Item'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image Selection Modal */}
            <ImageSelectionModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                checkItemName={formData.itemName}
                onSelectImage={handleImageSelect}
            />
        </>
    );
}
