import React, { useState, useEffect } from 'react';
import { searchPexelsImages, processPexelsImage, generatePlaceholderImage, optimizeSearchQuery } from '../../utils/pexels';
import { useSettings } from '../../context/SettingsContext';

export default function ImageSelectionModal({ isOpen, onClose, checkItemName, onSelectImage }) {
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Auto-search when modal opens
    useEffect(() => {
        if (isOpen && checkItemName && settings.autoFetchImages) {
            const query = optimizeSearchQuery(checkItemName);
            setSearchQuery(query);
            handleSearch(query);
        } else if (isOpen) {
            setSearchQuery('');
            setImages([]);
        }
    }, [isOpen, checkItemName, settings.autoFetchImages]);

    const handleSearch = async (query = searchQuery) => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setSelectedUrl(null);

        try {
            // Append context keywords if needed, or rely on user input
            const results = await searchPexelsImages(query, settings.pexelsApiKey);
            setImages(results);
        } catch (err) {
            setError(err.message);
            // If no API key, we fail gracefully
            if (err.message.includes('API Key is missing')) {
                setImages([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPexelsImage = async (imageUrl) => {
        setSelectedUrl(imageUrl);
    };

    const handleConfirmSelection = async () => {
        if (!selectedUrl) return;

        setProcessing(true);
        try {
            const base64 = await processPexelsImage(selectedUrl);
            onSelectImage(base64);
            onClose();
        } catch (err) {
            setError('Failed to process image. Please try another.');
        } finally {
            setProcessing(false);
        }
    };

    const handleUsePlaceholder = () => {
        const placeholder = generatePlaceholderImage(checkItemName || 'Item');
        onSelectImage(placeholder);
        onClose();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit check before processing
            setError('File too large. Max 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // We reuse processPexelsImage logic by passing data URL if compatible, 
            // but processPexelsImage expects a URL it can fetch. 
            // Better to resize independently or use a resize utility.
            // For simplicity, let's just resize this base64 similar to pexels utility logic in a separate step if needed.
            // Or just pass raw for now and assume the resizing utility can be made generic later?
            // Let's implement a quick resize here for uploaded files to match the 300x300 requirement.
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 300;
                let width = img.width;
                let height = img.height;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                onSelectImage(canvas.toDataURL('image/jpeg', 0.7));
                onClose();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>🖼️</span> Select Product Image
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Search Bar */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search Pexels..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                        <button
                            onClick={() => handleSearch()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Pexels Grid */}
                    {loading ? (
                        <div className="h-48 flex items-center justify-center text-gray-500 gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                            Searching...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {images.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map(photo => (
                                        <button
                                            key={photo.id}
                                            onClick={() => handleSelectPexelsImage(photo.src.medium)}
                                            className={`
                                                relative aspect-square rounded-lg overflow-hidden border-2 transition-all group
                                                ${selectedUrl === photo.src.medium ? 'border-primary-500 ring-2 ring-primary-100' : 'border-transparent hover:border-gray-300'}
                                            `}
                                        >
                                            <img
                                                src={photo.src.medium}
                                                alt={photo.alt}
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedUrl === photo.src.medium && (
                                                <div className="absolute inset-0 bg-primary-600 bg-opacity-20 flex items-center justify-center">
                                                    <span className="text-2xl drop-shadow-md">✅</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                !error && searchQuery && (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">📷</div>
                                        <p>No images found. Try a different search term.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                    {/* Selected Action */}
                    {selectedUrl && (
                        <button
                            onClick={handleConfirmSelection}
                            disabled={processing}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md flex justify-center items-center gap-2"
                        >
                            {processing ? 'Processing...' : '✅ Use Selected Image'}
                        </button>
                    )}

                    <div className="flex gap-3">
                        {/* File Upload */}
                        <label className="flex-1 cursor-pointer bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 text-center flex items-center justify-center gap-2 transition-colors">
                            <span>📁</span> Upload File
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>

                        {/* Use Placeholder */}
                        <button
                            onClick={handleUsePlaceholder}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>🎨</span> Use Placeholder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
