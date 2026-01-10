import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-white p-4 rounded-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 w-full text-left">Sales Trend (Last 7 Days)</h3>
                <p className="text-gray-400">No sales data yet</p>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `₵${value}`}
                        />
                        <Tooltip
                            formatter={(value) => [`₵${value.toFixed(2)}`, 'Sales']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
