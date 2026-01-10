import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const { addToast } = useToast();

    // While checking stored token, don't redirect yet
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page, saving the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User logged in but doesn't have permission
        // Use a ref or effect to show toast only once, or just simple redirect
        // Ideally we'd show a toast here, but rendering inside render can be tricky for side effects.
        // We will just redirect to home.
        return <Navigate to="/" replace />;
    }

    return children;
}
