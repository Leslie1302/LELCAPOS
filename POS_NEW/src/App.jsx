import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { InventoryProvider } from './context/InventoryContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import KeyboardShortcuts from './components/Shared/KeyboardShortcuts';

function App() {
    return (
        <SettingsProvider>
            <CartProvider>
                <InventoryProvider>
                    <ToastProvider>
                        <AuthProvider>
                            <Router>
                                <KeyboardShortcuts />
                                <Routes>
                                    <Route path="/login" element={<Login />} />

                                    {/* Protected Layout Routes */}
                                    <Route path="/" element={
                                        <ProtectedRoute>
                                            <Layout />
                                        </ProtectedRoute>
                                    }>
                                        <Route index element={<Dashboard />} />
                                        <Route path="inventory" element={<Inventory />} />
                                        <Route path="pos" element={<POS />} />
                                        <Route path="transactions" element={<Transactions />} />
                                        <Route path="reports" element={<Reports />} />
                                        <Route
                                            path="settings"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <Settings />
                                                </ProtectedRoute>
                                            }
                                        />
                                    </Route>
                                </Routes>
                            </Router>
                        </AuthProvider>
                    </ToastProvider>
                </InventoryProvider>
            </CartProvider>
        </SettingsProvider>
    );
}

export default App;
