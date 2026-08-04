'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Hammer, Pickaxe, Settings2, PackageCheck, AlertTriangle, Layers, ArrowDownUp } from 'lucide-react';

export default function MfgDashboard() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['manufacturing', 'dashboard'],
        queryFn: async () => (await apiClient.get('/manufacturing/dashboard')).data.data
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Manufacturing Dashboard...</div>;

    const stats = qData || {};

    return (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-6 animate-in fade-in pb-10">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                <DashboardCard icon={<Hammer size={24} className="text-blue-500" />} title="Today's Jobs" value={stats.todayJobs || '0'} trend="Initiated today" color="rgba(59, 130, 246, 0.1)" textCol="var(--info)" />
                <DashboardCard icon={<Settings2 size={24} className="text-amber-500" />} title="In Progress" value={stats.inProgressJobs || '0'} trend="Actively working" color="rgba(245, 158, 11, 0.1)" textCol="var(--warning)" />
                <DashboardCard icon={<AlertTriangle size={24} className="text-red-500" />} title="QC Pending" value={stats.qcPending || '0'} trend="Awaiting approval" color="rgba(239, 68, 68, 0.1)" textCol="var(--danger)" />
                <DashboardCard icon={<PackageCheck size={24} className="text-emerald-500" />} title="Completed" value={stats.completedJobs || '0'} trend="Finished pipeline" color="rgba(34, 197, 94, 0.1)" textCol="var(--success)" />
                <DashboardCard icon={<ArrowDownUp size={24} className="text-purple-500" />} title="Gold Issued" value={`${stats.todayGoldIssued?.toFixed(2) || '0'}g`} trend="Total Net Wt Issued" color="rgba(168, 85, 247, 0.1)" textCol="#A855F7" />
                <DashboardCard icon={<Layers size={24} className="text-pink-500" />} title="Wastage Logged" value={`${stats.todayWastage?.toFixed(2) || '0'}g`} trend="Total processing loss" color="rgba(236, 72, 153, 0.1)" textCol="#EC4899" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <div className="card p-0" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Recent Manufacturing Pipeline</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Order No</th>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Design/Product</th>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Priority</th>
                                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent?.map((job: any) => (
                                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{job.orderNumber}</td>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>
                                            <div>{job.designNumber || (job.Product ? job.Product.name : 'Custom Job')}</div>
                                            {job.Product && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SKU: {job.Product.sku}</div>}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: job.priority === 'URGENT' ? 'var(--danger)' : 'var(--text-muted)' }}>{job.priority}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{job.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats.recent || stats.recent.length === 0) && (
                                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No active manufacturing orders.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px' }}>Karigar Capacity</h3>
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center gap-3">
                        <Pickaxe size={48} className="text-secondary" />
                        <p className="text-sm font-semibold max-w-[200px]">Karigar routing & allocation sync maps real-time here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ icon, title, value, trend, color, textCol }: any) {
    return (
        <div className="card transition-all group hover:-translate-y-1" style={{ gridColumn: 'span 2', position: 'relative', overflow: 'hidden', cursor: 'default' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'scale(3)', color: textCol, transition: 'var(--transition)' }} className="group-hover:scale-[4]">
                {icon}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
                <div style={{ padding: '6px', borderRadius: '6px', background: color, border: '1px solid rgba(0,0,0,0.05)' }}>{icon}</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '10px', fontWeight: '600', opacity: 0.6 }}>{trend}</div>
        </div>
    );
}
