import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Add a new toast to the stack
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove handled by individual Toast component timer or here? 
        // Better to let individual Toast handle its own timer for dismissal animation, 
        // but for state management, we remove it here after delay + animation buffer.
    }, []);

    // Remove toast by ID
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {/* Global Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto transition-all duration-300">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        // We might need to modify Toast.jsx to not fix itself to top-right
                        // but instead just be the card itself
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
