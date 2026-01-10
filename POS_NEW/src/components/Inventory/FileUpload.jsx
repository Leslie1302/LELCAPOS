import React, { useState, useRef } from 'react';

export default function FileUpload({ onFileSelect, acceptedFormats = '.xlsx,.csv' }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const validateFile = (file) => {
        const errors = [];

        // Check file type
        const extension = file.name.split('.').pop().toLowerCase();
        const allowed = acceptedFormats.replace(/\./g, '').split(',');

        if (!allowed.includes(extension)) {
            errors.push(`Invalid file type. Only ${acceptedFormats} files are accepted.`);
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            errors.push(`File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    };

    const handleFileChange = (file) => {
        if (!file) return;

        const validation = validateFile(file);

        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        setSelectedFile(file);
        if (onFileSelect) {
            onFileSelect(file);
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleClear = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileSelect) {
            onFileSelect(null);
        }
    };

    return (
        <div className="space-y-3">
            {/* Drag and Drop Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats}
                    onChange={handleInputChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="text-5xl">📁</div>

                    {selectedFile ? (
                        <>
                            <div className="text-lg font-semibold text-gray-900">
                                {selectedFile.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                                className="btn btn-secondary text-sm"
                            >
                                Remove File
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-lg font-semibold text-gray-700">
                                Drag and drop your file here
                            </div>
                            <div className="text-sm text-gray-500">
                                or click to browse
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                Supported formats: {acceptedFormats} (Max 5MB)
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* File Info Message */}
            {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg  p-3 text-sm text-green-800">
                    <span className="font-semibold">✓</span> File selected successfully. Click "Process File" to continue.
                </div>
            )}
        </div>
    );
}
