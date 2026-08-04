'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Target, FileText, CheckCircle, Paintbrush, Hammer, ScanSearch, Car, DollarSign, CalendarDays } from 'lucide-react';

export default function Dashboard() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['custom-orders', 'dashboard'],
        queryFn: async () => (await apiClient.get('/custom-orders/dashboard')).data.data
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Dashboard Metrics...</div>;
    const stats = qData || {};

    return (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-6 animate-in fade-in pb-10">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                <DashboardCard icon={<Target className="text-blue-500" />} title="Today's Orders" value={stats.todayOrders} color="rgba(59, 130, 246, 0.1)" textCol="var(--info)" />
                <DashboardCard icon={<FileText className="text-amber-500" />} title="Pending Quotations" value={stats.pendingQuotations} color="rgba(245, 158, 11, 0.1)" textCol="var(--warning)" />
                <DashboardCard icon={<CheckCircle className="text-purple-500" />} title="Waiting Approval" value={stats.waitingApproval} color="rgba(168, 85, 247, 0.1)" textCol="#A855F7" />
                <DashboardCard icon={<Paintbrush className="text-pink-500" />} title="Design Phase" value={stats.designInProgress} color="rgba(236, 72, 153, 0.1)" textCol="#EC4899" />

                <DashboardCard icon={<Hammer className="text-orange-500" />} title="Mfg In Progress" value={stats.manufacturingInProgress} color="rgba(249, 115, 22, 0.1)" textCol="#F97316" />
                <DashboardCard icon={<ScanSearch className="text-red-500" />} title="QC Pending" value={stats.qcPending} color="rgba(239, 68, 68, 0.1)" textCol="var(--danger)" />
                <DashboardCard icon={<Car className="text-emerald-500" />} title="Ready For Delivery" value={stats.readyForDelivery} color="rgba(34, 197, 94, 0.1)" textCol="var(--success)" />

                <DashboardCard icon={<DollarSign className="text-green-600" />} title="Today's Revenue" value={`₹${(stats.todayRevenue || 0).toLocaleString()}`} color="rgba(22, 163, 74, 0.1)" textCol="#16A34A" />
                <DashboardCard icon={<CalendarDays className="text-indigo-500" />} title="Monthly Volume" value={stats.monthlyCustomOrders} color="rgba(99, 102, 241, 0.1)" textCol="#6366F1" />
            </div>

            <div className="card p-0 flex flex-col overflow-hidden">
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Recent Custom Order Pipeline</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Order No</th>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Customer</th>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Design Desc</th>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders?.map((job: any) => (
                                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{job.orderNumber}</td>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{job.customer?.name}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                                        {job.items?.[0]?.itemName || job.description || 'Custom Request'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                                            {job.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent custom orders.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ icon, title, value, color, textCol }: any) {
    return (
        <div className="card transition-all group hover:-translate-y-1" style={{ gridColumn: 'span 4', position: 'relative', overflow: 'hidden', cursor: 'default' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'scale(3)', color: textCol, transition: 'var(--transition)' }} className="group-hover:scale-[4]">
                {icon}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
                <div style={{ padding: '6px', borderRadius: '6px', background: color, border: '1px solid rgba(0,0,0,0.05)' }}>{React.cloneElement(icon, { size: 18 })}</div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-main)' }}>{value || 0}</div>
        </div>
    );
}
