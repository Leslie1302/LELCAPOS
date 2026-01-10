import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
    const [pin, setPin] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    // Where to redirect after login (default to dashboard)
    const from = location.state?.from?.pathname || '/';

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleClear = () => {
        setPin('');
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleLogin = (e) => {
        e?.preventDefault(); // Handle form submit if triggered
        if (pin.length !== 4) return;

        const result = login(pin);
        if (result.success) {
            addToast('🔓 Access Granted', 'success');
            navigate(from, { replace: true });
        } else {
            addToast('❌ Invalid PIN', 'error');
            setPin('');
        }
    };

    // Auto-submit when 4 digits entered
    React.useEffect(() => {
        if (pin.length === 4) {
            handleLogin();
        }
    }, [pin]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8 text-center bg-primary-600 text-white">
                    <h1 className="text-3xl font-bold mb-2">RetailPOS</h1>
                    <p className="text-blue-100">Enter PIN to Access System</p>
                </div>

                <div className="p-8">
                    {/* PIN Display */}
                    <div className="mb-8 flex justify-center gap-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border-2 border-primary-500 transition-all duration-200 ${pin.length > i ? 'bg-primary-500' : 'bg-transparent'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                className="h-16 rounded-xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            className="h-16 rounded-xl bg-red-50 text-lg font-bold text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                        >
                            CLR
                        </button>
                        <button
                            onClick={() => handleNumberClick('0')}
                            className="h-16 rounded-xl bg-gray-50 text-2xl font-bold text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
                        >
                            0
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="h-16 rounded-xl bg-gray-50 text-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            ⌫
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="text-sm text-gray-400">
                            {/* PINs masked for security */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
