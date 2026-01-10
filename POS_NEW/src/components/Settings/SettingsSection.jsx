import React, { useState } from 'react';

const SettingsSection = ({ title, icon, children, defaultOpen = false, description }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        {description && !isOpen && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{description}</p>
                        )}
                    </div>
                </div>
                <div
                    className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                    ▼
                </div>
            </button>

            {isOpen && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

export default SettingsSection;
