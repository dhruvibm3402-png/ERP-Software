'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Wrench, CheckCircle, Clock, AlertTriangle, TrendingUp, BellRing } from 'lucide-react';

export default function RepairDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['repairs', 'dashboard'],
        queryFn: async () => (await apiClient.get('/repairs/dashboard')).data.data
    });

    if (isLoading) return <div className="h-full flex items-center justify-center text-gray-400">Loading Dashboard...</div>;

    const stats = data || {};

    return (
        <div className="h-full overflow-y-auto pr-2 space-y-6 animate-in fade-in pb-10" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                <DashboardCard icon={<Wrench size={24} className="text-blue-500" />} title="Today's Repairs" value={stats.todayRepairs || '0'} trend="Jobs created today" color="rgba(59, 130, 246, 0.1)" textCol="var(--info)" />
                <DashboardCard icon={<Clock size={24} className="text-amber-500" />} title="In Progress" value={stats.inProgress || '0'} trend="Actively working" color="rgba(245, 158, 11, 0.1)" textCol="var(--warning)" />
                <DashboardCard icon={<CheckCircle size={24} className="text-emerald-500" />} title="Ready For Delivery" value={stats.readyCount || '0'} trend="Awaiting pickup" color="rgba(34, 197, 94, 0.1)" textCol="var(--success)" />
                <DashboardCard icon={<TrendingUp size={24} className="text-purple-500" />} title="Today's Revenue" value={`₹${stats.todayRevenue?.toLocaleString() || '0'}`} trend="Advance collected" color="rgba(168, 85, 247, 0.1)" textCol="#A855F7" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <div className="card p-0" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-main)', margin: 0 }}>Recent Repairs Pipeline</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Job No</th>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Customer</th>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Task</th>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent?.map((job: any) => (
                                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{job.jobNumber}</td>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{job.customer?.name || 'Walk-in'}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{job.repairType}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>{job.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats.recent || stats.recent.length === 0) && (
                                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent repair jobs</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-main)', margin: 0 }}>Karigar Updates</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, gap: '16px' }}>
                        <BellRing size={48} className="text-amber-400" />
                        <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Job assignments and notification payloads tracking syncs here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ icon, title, value, trend, color, textCol }: any) {
    return (
        <div className="card transition-all group" style={{ gridColumn: 'span 3', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '16px', top: '16px', opacity: 0.1, transform: 'scale(1.5)', color: textCol, transition: 'var(--transition)' }} className="group-hover:scale-125">
                {icon}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
                <div style={{ padding: '8px', borderRadius: '8px', background: color, border: '1px solid rgba(0,0,0,0.05)' }}>{icon}</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', opacity: 0.6 }}>{trend}</div>
        </div>
    );
}
