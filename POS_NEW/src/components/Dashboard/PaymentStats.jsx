import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']; // Green (Cash), Blue (Card), Orange (MoMo), Red (Other)

const PaymentStats = ({ data }) => {
    // If no data, show a placeholder
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-white p-4 rounded-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 w-full text-left">Payment Methods</h3>
                <p className="text-gray-400">No transaction data yet</p>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Methods</h3>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PaymentStats;
