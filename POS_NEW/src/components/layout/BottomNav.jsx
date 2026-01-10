import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/pos', label: 'POS', icon: '🛒' },
    { path: '/transactions', label: 'Transactions', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav({ lowStockCount }) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="grid grid-cols-6 h-16">
                {navItems.map((item) => (
                    <NavButton
                        key={item.path}
                        {...item}
                        badge={item.path === '/inventory' ? lowStockCount : 0}
                    />
                ))}
            </div>
        </nav>
    );
}

function NavButton({ path, label, icon, badge }) {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            className={`
        flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative
        ${isActive
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-500 hover:text-primary-600'
                }
      `}
        >
            <span className="text-2xl relative">
                {icon}
                {badge > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center shadow-sm animate-pulse border-2 border-white">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </span>
            <span className="text-xs">{label}</span>
        </Link>
    );
}
