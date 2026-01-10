import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const KeyboardShortcuts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if input/textarea is focused (unless it's a specific function key)
            const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

            // F2: New Sale (POS)
            if (e.key === 'F2') {
                e.preventDefault();
                navigate('/pos');
                addToast('🛒 New Sale Mode (F2)', 'info', 2000);
            }

            // F3: Inventory Search
            if (e.key === 'F3') {
                e.preventDefault();
                // Pass a state or query param to trigger focus
                navigate('/inventory?action=search');
                addToast('📦 Inventory Search (F3)', 'info', 2000);
            }

            // F4: Transactions
            if (e.key === 'F4') {
                e.preventDefault();
                navigate('/transactions');
                addToast('📝 Transaction History (F4)', 'info', 2000);
            }

            // Ctrl + P: Print Last Receipt
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                // Logic to trigger reprint would go here. 
                // For now just a toast as we need to access the last receipt data.
                addToast('🖨️ Print Shortcut Triggered', 'info', 2000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, addToast]);

    return null; // Headless component
};

export default KeyboardShortcuts;
