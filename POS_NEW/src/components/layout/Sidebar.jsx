import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: '🏠', roles: ['admin', 'storekeeper'] },
    { path: '/inventory', label: 'Inventory', icon: '📦', roles: ['admin', 'storekeeper'] },
    { path: '/pos', label: 'POS', icon: '🛒', roles: ['admin', 'storekeeper'] },
    { path: '/transactions', label: 'Transactions', icon: '📝', roles: ['admin', 'storekeeper'] },
    { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'storekeeper'] },
    { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
];

export default function Sidebar({ lowStockCount }) {
    const { user, logout, ROLES } = useAuth();

    // Filter items based on role
    const filteredNavItems = NAV_ITEMS.filter(item =>
        !item.roles || (user && item.roles.includes(user.role))
    );

    return (
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    LELCA POS
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        {...item}
                        badge={item.path === '/inventory' ? lowStockCount : 0}
                    />
                ))}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[80px]">{user?.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        ↪️
                    </button>
                </div>
            </div>
        </div>
    );
}

function NavLink({ path, label, icon, badge }) {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
            `}
        >
            <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            <span className="flex-1">{label}</span>

            {badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}

            {/* Active Indicator Strip */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />
            )}
        </Link>
    );
}
