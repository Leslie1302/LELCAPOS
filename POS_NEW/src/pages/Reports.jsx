import React, { useState, useEffect } from 'react';
import SalesReport from '../components/Reports/SalesReport';
import InventoryReport from '../components/Reports/InventoryReport';
import PaymentReport from '../components/Reports/PaymentReport';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('sales');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateLabel, setDateLabel] = useState('Today');

    // Initialize with Today's date
    useEffect(() => {
        setPreset('today');
    }, []);

    const setPreset = (preset) => {
        const end = new Date();
        const start = new Date();

        switch (preset) {
            case 'today':
                setDateLabel('Today');
                break;
            case 'yesterday':
                start.setDate(end.getDate() - 1);
                end.setDate(end.getDate() - 1);
                setDateLabel('Yesterday');
                break;
            case 'last7':
                start.setDate(end.getDate() - 6);
                setDateLabel('Last 7 Days');
                break;
            case 'month':
                start.setDate(1);
                setDateLabel('This Month');
                break;
            default:
                setDateLabel('Custom Range');
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500">Insights for {dateLabel} ({startDate} to {endDate})</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        <span>🖨️</span> Print Report
                    </button>
                </div>
            </div>

            {/* Date Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button onClick={() => setPreset('today')} className={`px-4 py-2 text-sm rounded-full whitespace-nowrap ${dateLabel === 'Today' ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Today</button>
                    <button onClick={() => setPreset('yesterday')} className={`px-4 py-2 text-sm rounded-full whitespace-nowrap ${dateLabel === 'Yesterday' ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Yesterday</button>
                    <button onClick={() => setPreset('last7')} className={`px-4 py-2 text-sm rounded-full whitespace-nowrap ${dateLabel === 'Last 7 Days' ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Last 7 Days</button>
                    <button onClick={() => setPreset('month')} className={`px-4 py-2 text-sm rounded-full whitespace-nowrap ${dateLabel === 'This Month' ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>This Month</button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setDateLabel('Custom Range'); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-auto"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setDateLabel('Custom Range'); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-auto"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`pb-4 px-6 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'sales'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    💵 Sales Report
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`pb-4 px-6 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'inventory'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    📦 Inventory & Stock
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`pb-4 px-6 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'payments'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    💳 Payment Analytics
                </button>
            </div>

            {/* Content Active Tab */}
            <div className="flex-1">
                {activeTab === 'sales' && <SalesReport startDate={startDate} endDate={endDate} dateLabel={dateLabel} />}
                {activeTab === 'inventory' && <InventoryReport />}
                {activeTab === 'payments' && <PaymentReport startDate={startDate} endDate={endDate} />}
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .p-6, .p-6 * {
                        visibility: visible;
                    }
                    .p-6 {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    button, input {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
