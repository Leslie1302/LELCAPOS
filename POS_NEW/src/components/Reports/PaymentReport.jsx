import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getPaymentMethodStats } from '../../utils/analytics';

const PaymentReport = ({ startDate, endDate }) => {

    const stats = useMemo(() => getPaymentMethodStats(startDate, endDate), [startDate, endDate]);
    const totalRevenue = stats.reduce((sum, item) => sum + item.value, 0);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0.1 ? (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Method Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map(method => (
                    <div key={method.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            {/* Large Icon Background */}
                            <span className="text-6xl">
                                {method.name === 'Cash' ? '💵' : method.name === 'Card' ? '💳' : '📱'}
                            </span>
                        </div>

                        <div className="text-sm text-gray-500 mb-1">{method.name} Payments</div>
                        <div className="text-2xl font-bold text-gray-900">GH₵{method.value.toFixed(2)}</div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                                {method.count} Transactions
                            </span>
                            <span className="text-xs font-bold text-gray-400">
                                {((method.value / totalRevenue) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-50" style={{ width: `${(method.value / totalRevenue) * 100}%`, color: method.color }}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-800 w-full mb-4">Payment Method Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₵${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights / Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Comparisons & Insights</h3>

                    <div className="space-y-4">
                        {stats.length > 0 ? (
                            <>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                                    <strong>Most Popular (Revenue):</strong> {stats.sort((a, b) => b.value - a.value)[0].name}
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
                                    <strong>Most Popular (Count):</strong> {stats.sort((a, b) => b.count - a.count)[0].name}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Detailed Breakdown</h4>
                                    <div className="space-y-2">
                                        {stats.map(s => (
                                            <div key={s.name} className="flex justify-between text-sm">
                                                <span>{s.name}</span>
                                                <span className="font-mono">GH₵{s.value.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                                            <span>Totals</span>
                                            <span>GH₵{totalRevenue.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-10">No payment data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReport;
