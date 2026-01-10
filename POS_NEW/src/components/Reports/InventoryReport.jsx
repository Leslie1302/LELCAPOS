import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { calculateInventoryMetrics } from '../../utils/analytics';

const InventoryReport = () => {

    // Inventory is generally static for the session unless reloaded, 
    // but we can memoize it.
    const metrics = useMemo(() => calculateInventoryMetrics(), []);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0.05 ? (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Total Inventory Value</div>
                    <div className="text-3xl font-bold text-gray-900">GH₵{metrics.inventoryValue.toFixed(2)}</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                        Across {metrics.totalItems} distinct items
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Total Stock Units</div>
                    <div className="text-3xl font-bold text-gray-900">{metrics.totalStockUnits}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        Physical units in store
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Low Stock Alerts</div>
                    <div className="text-3xl font-bold text-orange-600">{metrics.lowStockItems.length + metrics.outOfStockItems.length}</div>
                    <div className="text-xs text-red-500 font-medium mt-1">
                        {metrics.outOfStockItems.length} Out of Stock
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Stock Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-800 w-full mb-4">Stock Level Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.stockDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {metrics.stockDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Critical Items List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">⚠️ Attention Required</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {metrics.outOfStockItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <div className="font-bold text-red-800">{item.itemName}</div>
                                    <div className="text-xs text-red-600">Physical Stock: 0</div>
                                </div>
                                <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded">
                                    OUT OF STOCK
                                </span>
                            </div>
                        ))}

                        {metrics.lowStockItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <div>
                                    <div className="font-bold text-orange-800">{item.itemName}</div>
                                    <div className="text-xs text-orange-600">Stock: {item.quantity}</div>
                                </div>
                                <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded">
                                    LOW STOCK
                                </span>
                            </div>
                        ))}

                        {metrics.outOfStockItems.length === 0 && metrics.lowStockItems.length === 0 && (
                            <div className="text-center py-10 text-green-600 bg-green-50 rounded-lg border border-green-100">
                                <div className="text-2xl mb-2">✅</div>
                                <div className="font-bold">Inventory is Healthy</div>
                                <div className="text-sm">No items need immediate attention.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryReport;
