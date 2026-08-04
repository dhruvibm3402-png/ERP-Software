'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { IndianRupee, Clock, TrendingUp, TrendingDown, RefreshCcw, User, Star, Package, Diamond, ArrowRightLeft } from 'lucide-react';

export default function ReportDashboard() {
    const { data: dashboardData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['reports', 'dashboard'],
        queryFn: async () => (await apiClient.get('/reports/dashboard')).data.data
    });

    if (isLoading) return <div className="h-full flex items-center justify-center text-gray-400">Loading master analytics...</div>;

    const stats = dashboardData || {};

    return (
        <div className="h-full overflow-y-auto pr-2 pb-10 space-y-6 animate-in fade-in">
            <div className="flex justify-end mb-2">
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="btn bg-white border hover:bg-gray-50 text-sm font-semibold flex items-center gap-2"
                >
                    <RefreshCcw size={14} className={isFetching ? 'animate-spin text-primary' : 'text-gray-500'} /> Sync Analytics
                </button>
            </div>

            {/* HIGH-LEVEL METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<IndianRupee />} title="Total Sales Volume" value={`₹${stats.totalSales?.toLocaleString() || 0}`} trend="Lifetime completed value" bg="bg-blue-50" color="text-blue-600" />
                <MetricCard icon={<ArrowRightLeft />} title="Monthly Revenue" value={`₹${stats.monthlyRevenue?.toLocaleString() || 0}`} trend="Current Calendar Month" bg="bg-emerald-50" color="text-emerald-600" />
                <MetricCard icon={<Clock />} title="Outstanding Receivables" value={`₹${stats.outstandingReceivables?.toLocaleString() || 0}`} trend="From active partial invoices" bg="bg-rose-50" color="text-rose-600" />
                <MetricCard icon={<TrendingDown />} title="Outstanding Payables" value={`₹${stats.outstandingPayables?.toLocaleString() || 0}`} trend="To active vendors" bg="bg-orange-50" color="text-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* RECENT SALES */}
                <div className="lg:col-span-2 card p-0 border border-gray-100 shadow-sm bg-white overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                    <th className="p-3 pl-4">Invoice #</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3 text-right">Value (₹)</th>
                                    <th className="p-3 text-right">Balance Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentSales?.map((ex: any) => (
                                    <tr key={ex.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="p-3 pl-4 font-mono font-bold text-gray-700">{ex.invoiceNumber}</td>
                                        <td className="p-3">{ex.customer?.name || 'Walkin'}</td>
                                        <td className="p-3 text-right font-black text-emerald-700">₹{ex.grandTotal?.toLocaleString()}</td>
                                        <td className="p-3 text-right">
                                            {ex.balanceAmount > 0
                                                ? <span className="font-bold text-rose-500">₹{ex.balanceAmount.toLocaleString()}</span>
                                                : <span className="text-emerald-500 text-xs font-bold uppercase">PAID</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* INVENTORY QUICK STATS */}
                <div className="card p-0 border border-gray-100 shadow-sm bg-white overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex justify-between">
                            Inventory Metrics <Diamond size={16} className="text-primary" />
                        </h3>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase">Total Items</div>
                                <div className="text-2xl font-black text-gray-900">{stats.inventoryItems?.toLocaleString()}</div>
                            </div>
                            <Package size={32} className="text-blue-300" />
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase">Total Weight</div>
                                <div className="text-2xl font-black text-gray-900">{stats.inventoryWeight?.toLocaleString()} <span className="text-sm font-normal text-gray-500">g</span></div>
                            </div>
                            <TrendingUp size={32} className="text-amber-300" />
                        </div>
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</div>
                                <div className="text-2xl font-black text-rose-600">{stats.lowStockCount}</div>
                            </div>
                            <TrendingDown size={32} className="text-red-300" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ icon, title, value, trend, bg, color }: any) {
    return (
        <div className="card p-5 border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity scale-150 -translate-y-2 translate-x-2 ${color}`}>
                {React.cloneElement(icon, { size: 64 })}
            </div>
            <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</div>
                <div className={`p-2 rounded-lg text-white ${bg} ${color}`}>{React.cloneElement(icon, { size: 16 })}</div>
            </div>
            <div className={`text-2xl font-black mb-1 text-gray-900`}>{value}</div>
            <div className="text-xs font-semibold text-gray-400">{trend}</div>
        </div>
    );
}
