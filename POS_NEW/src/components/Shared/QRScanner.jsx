import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const QRScanner = ({ onScan, onError, onClose }) => {
    const scannerRef = useRef(null);
    const [scanError, setScanError] = useState(null);

    useEffect(() => {
        // Initialize scanner
        // We use a unique ID for the element
        const elementId = "html5-qr-code-full-region";

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        const verbose = false;

        // Use setTimeout to ensure the DOM element exists
        const timerId = setTimeout(() => {
            if (!scannerRef.current) {
                scannerRef.current = new Html5QrcodeScanner(elementId, config, verbose);

                scannerRef.current.render(
                    (decodedText, decodedResult) => {
                        // Success callback
                        if (onScan) {
                            cleanup(); // Stop scanning on success
                            onScan(decodedText, decodedResult);
                        }
                    },
                    (errorMessage) => {
                        // Error callback (called frequently when no QR code is found)
                        // Only update state if it's a critical error or we want to show feedback
                        // Usually we ignore frame read errors
                        if (onError) onError(errorMessage);
                    }
                );
            }
        }, 100);

        const cleanup = () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                } catch (e) {
                    console.error("Error clearing scanner", e);
                }
                scannerRef.current = null;
            }
        };

        return () => {
            clearTimeout(timerId);
            cleanup();
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-black">
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>📷</span> Scan QR Code
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 relative flex flex-col justify-center items-center bg-black overflow-hidden">
                <div id="html5-qr-code-full-region" className="w-full max-w-md bg-black"></div>

                {/* Custom Overlay / Instructions if needed, though library provides some */}
                <div className="absolute bottom-10 left-0 right-0 text-center text-white text-sm bg-black/50 p-2">
                    Point camera at a product QR code
                </div>
            </div>

            {/* Styles to override library defaults for a cleaner look */}
            <style jsx global>{`
                #html5-qr-code-full-region {
                    border: none !important;
                }
                #html5-qr-code-full-region img {
                    display: none; /* Hide the info icon */
                }
                #html5-qr-code-full-region__scan_region {
                    background: transparent !important;
                }
                #html5-qr-code-full-region__dashboard_section_csr button {
                    background-color: white;
                    color: black;
                    border: 1px solid #ccc;
                    padding: 8px 16px;
                    border-radius: 4px;
                    margin-top: 10px;
                    font-size: 14px;
                }
                #html5-qr-code-full-region__dashboard_section_swaplink {
                    text-decoration: underline;
                    color: white;
                    margin-top: 5px;
                    display: inline-block;
                }
            `}</style>
        </div>
    );
};

export default QRScanner;
