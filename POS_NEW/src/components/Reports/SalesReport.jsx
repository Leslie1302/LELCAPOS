import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell
} from 'recharts';
import { calculateSalesMetrics, getHourlySalesDistribution, getTopSellingItems } from '../../utils/analytics';

const SalesReport = ({ startDate, endDate, dateLabel }) => {

    // Memoize calculations to prevent re-renders
    const metrics = useMemo(() => calculateSalesMetrics(startDate, endDate), [startDate, endDate]);
    const hourlyData = useMemo(() => getHourlySalesDistribution(startDate, endDate), [startDate, endDate]);
    const topItems = useMemo(() => getTopSellingItems(startDate, endDate), [startDate, endDate]);

    // Determine peak hour
    const peakHour = hourlyData.reduce((max, current) =>
        (current.sales > max.sales ? current : max), { sales: 0, time: '-' }
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Total Sales</div>
                    <div className="text-2xl font-bold text-gray-900">GH₵{metrics.totalSales.toFixed(2)}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">
                        {metrics.transactionCount} transactions
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Net Revenue</div>
                    <div className="text-2xl font-bold text-primary-600">GH₵{metrics.netRevenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        After refunds
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Refunds/Returns</div>
                    <div className="text-2xl font-bold text-red-600">GH₵{metrics.totalRefunds.toFixed(2)}</div>
                    <div className="text-xs text-red-500 font-medium mt-1">
                        {metrics.refundCount} refunds processed
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Avg. Transaction</div>
                    <div className="text-2xl font-bold text-orange-600">GH₵{metrics.avgTransaction.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {metrics.itemsSold} items sold total
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Hourly Sales Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Sales by Hour</h3>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            Peak: {peakHour.time} (GH₵{peakHour.sales.toFixed(0)})
                        </span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    interval={2} // Show every 3rd label
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    tickFormatter={(val) => `₵${val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Top 10 Best Sellers</h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {topItems.length > 0 ? topItems.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 truncate w-32" title={item.name}>{idx + 1}. {item.name}</span>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-900">{item.quantity}</span>
                                        <span className="text-xs text-gray-400 ml-1">sold</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                                    <div
                                        className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                    GH₵{item.revenue.toFixed(2)}
                                </div>
                            </div>
                        )) : (
                            <div className="text-gray-400 text-center py-8 text-sm">
                                No sales data for this period
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
