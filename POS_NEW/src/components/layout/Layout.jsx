import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { getLowStockItems } from '../../utils/stockAlerts';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
    const { inventory } = useInventory();
    const { settings } = useSettings();

    // Calculate low stock count for badges
    const lowStockCount = useMemo(() => {
        if (!settings.enableNotifications) return 0;
        return getLowStockItems(inventory, settings.lowStockThreshold).length;
    }, [inventory, settings]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar lowStockCount={lowStockCount} />

            {/* Mobile Header (Only visible on small screens) */}
            <div className="md:hidden bg-white shadow-sm p-4 sticky top-0 z-30 flex justify-between items-center h-16">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    LELCA POS
                </h1>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                    A
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-auto pb-20 md:pb-0 h-[calc(100vh-4rem)] md:h-screen">
                <div className="mx-auto p-4 md:p-8 max-w-7xl">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNav lowStockCount={lowStockCount} />
        </div>
    );
}
