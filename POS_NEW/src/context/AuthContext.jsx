import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Hardcoded roles for simplicity as requested
const ROLES = {
    ADMIN: 'admin',
    STOREKEEPER: 'storekeeper'
};

const USERS = [
    { id: 1, name: 'Admin User', role: ROLES.ADMIN, pin: '1234' },
    { id: 2, name: 'Store Keeper', role: ROLES.STOREKEEPER, pin: '0000' }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from local storage on mount
        const storedUser = localStorage.getItem('pos_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (pin) => {
        const foundUser = USERS.find(u => u.pin === pin);
        if (foundUser) {
            const userData = { id: foundUser.id, name: foundUser.name, role: foundUser.role };
            setUser(userData);
            localStorage.setItem('pos_user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, message: 'Invalid PIN' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pos_user');
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === ROLES.ADMIN;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading, ROLES }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
