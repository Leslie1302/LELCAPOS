import React, { useEffect } from 'react';
import QRScanner from './QRScanner';

const ScannerModal = ({ isOpen, onClose, onScan, title = "Scan Item" }) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="h-[500px] w-full bg-black relative">
                    <QRScanner
                        onScan={(data) => {
                            onScan(data);
                            // We don't close automatically here multiple scans might be desired, OR parent handles close
                        }}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
