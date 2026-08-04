'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Gem, TrendingUp, Layers, CheckCircle } from 'lucide-react';

export default function ExchangeDashboard() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['gold-exchange', 'dashboard'],
        queryFn: async () => (await apiClient.get('/gold-exchange/dashboard')).data.data
    });

    if (isLoading) return <div className="h-full flex items-center justify-center text-gray-400">Loading Dashboard...</div>;

    const stats = dashboardData || {};

    return (
        <div className="h-full overflow-y-auto pr-2 space-y-6 animate-in fade-in pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard icon={<Gem size={24} className="text-amber-500" />} title="Today's Exchanges" value={stats.todayExchanges || '0'} trend="Initiated today" color="bg-amber-50 border-amber-100" />
                <DashboardCard icon={<Layers size={24} className="text-blue-500" />} title="Total Gross Weight" value={`${stats.todayWeight?.toLocaleString() || '0'} g`} trend="Collected today" color="bg-blue-50 border-blue-100" />
                <DashboardCard icon={<CheckCircle size={24} className="text-emerald-500" />} title="Approved Value" value={`₹${stats.todayValue?.toLocaleString() || '0'}`} trend="Offset/Refunded" color="bg-emerald-50 border-emerald-100" />
                <DashboardCard icon={<TrendingUp size={24} className="text-purple-500" />} title="Pending Approval" value={stats.pendingCount || '0'} trend="Awaiting manager" color="bg-purple-50 border-purple-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6 border border-gray-100 shadow-sm bg-white">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Recent Exchanges</h3>
                    <div className="overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr className="text-gray-500 uppercase tracking-wider text-xs font-bold">
                                    <th className="p-3">Ref No</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3 text-right">Value (₹)</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recent?.map((ex: any) => (
                                    <tr key={ex.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono font-bold text-gray-700">{ex.exchangeNumber}</td>
                                        <td className="p-3">{ex.customer?.name}</td>
                                        <td className="p-3 text-right font-black text-gray-900">{ex.totalExchangeValue > 0 ? `₹${ex.totalExchangeValue.toLocaleString()}` : '--'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 text-xs rounded-lg font-bold ${ex.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{ex.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats.recent || stats.recent.length === 0) && (
                                    <tr><td colSpan={4} className="p-6 text-center text-gray-400">No recent exchanges</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card p-6 border border-gray-100 shadow-sm bg-white flex flex-col">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Testing & Verification</h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                        <Gem size={48} className="text-amber-300" />
                        <p className="text-sm">XRF integration & purity test validation charts will render here.</p>
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
