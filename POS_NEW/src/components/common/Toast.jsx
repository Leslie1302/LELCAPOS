import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div
            className={`${typeStyles[type]} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}
        >
            <span className="text-2xl">{icons[type]}</span>
            <p className="flex-1 font-medium text-sm md:text-base">{message}</p>
            <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-xl font-bold ml-2 opacity-80 hover:opacity-100"
            >
                ×
            </button>
        </div>
    );
}
