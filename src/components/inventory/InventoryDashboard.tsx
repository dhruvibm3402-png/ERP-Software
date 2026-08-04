'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Package, TrendingUp, TrendingDown, Layers, Box, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function InventoryDashboard() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['inventory', 'dashboard'],
        queryFn: async () => (await apiClient.get('/inventory/dashboard')).data.data
    });

    if (isLoading) return <div className="h-full flex items-center justify-center text-gray-400">Loading Dashboard Data...</div>;

    const stats = dashboardData || {};

    return (
        <div className="h-full overflow-y-auto pr-2 space-y-6 animate-in fade-in pb-10">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard icon={<Layers size={24} className="text-blue-500" />} title="Total SKU Products" value={stats.totalProducts?.toLocaleString() || '0'} trend="+4 this week" color="bg-blue-50 border-blue-100" />
                <DashboardCard icon={<Box size={24} className="text-emerald-500" />} title="Available Stock Qty" value={stats.availableStock?.toLocaleString() || '0'} trend="Ready for sale" color="bg-emerald-50 border-emerald-100" />
                <DashboardCard icon={<CheckCircle size={24} className="text-purple-500" />} title="Reserved Stock Qty" value={stats.reservedStock?.toLocaleString() || '0'} trend="Locked for processing" color="bg-purple-50 border-purple-100" />
                <DashboardCard icon={<TrendingUp size={24} className="text-amber-500" />} title="Total Gross Weight" value={`${stats.totalGrossWeight?.toLocaleString() || '0'} g`} trend="Valuation base" color="bg-amber-50 border-amber-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6 border border-gray-100 shadow-sm bg-white">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Today's Stock Movements</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><TrendingUp size={24} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Stock In</p>
                                <p className="text-2xl font-black text-emerald-700">{stats.todayStockIn || 0} <span className="text-sm font-normal opacity-70">items</span></p>
                            </div>
                        </div>
                        <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-rose-100 rounded-full text-rose-600"><TrendingDown size={24} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Stock Out</p>
                                <p className="text-2xl font-black text-rose-700">{stats.todayStockOut || 0} <span className="text-sm font-normal opacity-70">items</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                            Inventory Value Map
                        </h3>
                        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                            <div className="text-center text-gray-400">
                                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="font-semibold text-sm">Visual metrics map to be charted here</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border border-gray-100 shadow-sm bg-white flex flex-col">
                    <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-red-100 pb-2">
                        <AlertTriangle size={18} /> Alerts & Highlights
                    </h3>
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="p-3 border rounded-lg bg-red-50/30 border-red-100 flex items-start gap-3">
                            <Box size={16} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-900">0 Products Out of Stock</p>
                                <p className="text-xs text-red-700/70 mt-1">Immediate purchasing required to avoid sales blockages.</p>
                            </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-orange-50/30 border-orange-100 flex items-start gap-3">
                            <TrendingDown size={16} className="text-orange-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-orange-900">12 Products Low on Stock</p>
                                <p className="text-xs text-orange-700/70 mt-1">Below minimum threshold of 5 units.</p>
                            </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-blue-50/30 border-blue-100 flex items-start gap-3">
                            <Layers size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-blue-900">4 Audits Pending</p>
                                <p className="text-xs text-blue-700/70 mt-1">Physical branch verification required.</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex gap-2">
                            <button className="btn w-full bg-gray-50 border text-gray-700 text-sm">View Report</button>
                            <button className="btn w-full bg-white border text-primary border-primary/20 text-sm">Raise PO</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ icon, title, value, trend, color }: any) {
    return (
        <div className={`p-5 rounded-2xl border ${color} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
            <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity translate-x-4 -translate-y-4 scale-150">
                {icon}
            </div>
            <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</div>
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100/50">{icon}</div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
            <div className="text-xs font-semibold opacity-70">{trend}</div>
        </div>
    );
}
