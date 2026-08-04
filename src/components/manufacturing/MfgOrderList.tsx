'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Eye, ArrowRightCircle, ArrowLeftCircle, CheckCircle, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MfgOrderList() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data: qData, isLoading } = useQuery({
        queryKey: ['manufacturing', 'list', search, statusFilter],
        queryFn: async () => {
            const p = new URLSearchParams();
            if (search) p.append('search', search);
            if (statusFilter !== 'ALL') p.append('status', statusFilter);
            return (await apiClient.get(`/manufacturing?${p.toString()}`)).data.data;
        }
    });

    const issueMaterialMutation = useMutation({
        mutationFn: (id: string) => apiClient.post('/manufacturing/issue', {
            manufacturingOrderId: id,
            materialType: 'GOLD',
            grossWeight: 10,
            netWeight: 10,
            quantity: 1,
            remarks: 'Default Issue Action Trigger'
        }),
        onSuccess: () => {
            toast.success("Test Gold Issued Successfully!");
            queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
        },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Issue Error')
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '800px' }}>
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 12px' }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Scan or Search Order No, Design..."
                            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px', width: '100%', fontSize: '13px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        style={{ padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white', fontSize: '13px', outline: 'none' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="QUALITY_CHECK">Quality Check</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            <div className="card flex-1 p-0 flex flex-col overflow-hidden">
                <div className="overflow-x-auto flex-1 h-0">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: 'var(--bg-primary)' }}>
                            <tr>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Order No</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Design / Details</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Items/Weight Specs</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Timeline</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Pipeline Stage</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : qData?.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No production orders found.</td></tr>
                            ) : (
                                qData?.map((job: any) => (
                                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                                        <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary)' }}>{job.orderNumber}</td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>
                                            <div>{job.designNumber || 'Design #TBD'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.priority} Priority</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {job.Items?.length > 0 ? (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {job.Items[0].metalType} {job.Items[0].purity} • {job.Items[0].grossWeight}g
                                                </div>
                                            ) : <span className="text-gray-400 italic text-xs">No Items Spec</span>}
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                            {job.expectedDate ? new Date(job.expectedDate).toLocaleDateString() : '--'}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px',
                                                background: job.status === 'COMPLETED' ? 'var(--success-bg)' : job.status === 'IN_PROGRESS' ? 'var(--warning-bg)' : 'var(--bg-primary)',
                                                color: job.status === 'COMPLETED' ? 'var(--success)' : job.status === 'IN_PROGRESS' ? 'var(--warning)' : 'var(--text-main)',
                                                border: '1px solid currentColor'
                                            }}>{job.status}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {(job.status === 'DRAFT' || job.status === 'PENDING') && (
                                                    <button onClick={() => issueMaterialMutation.mutate(job.id)} title="Issue Material" style={{ padding: '6px', cursor: 'pointer', background: 'var(--warning-bg)', border: 'none', borderRadius: '6px', color: 'var(--warning)' }}><ArrowRightCircle size={14} /></button>
                                                )}
                                                {job.status === 'IN_PROGRESS' && (
                                                    <button title="Receive Material" style={{ padding: '6px', cursor: 'pointer', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}><ArrowLeftCircle size={14} /></button>
                                                )}
                                                {job.status === 'QUALITY_CHECK' && (
                                                    <button title="QC Pass" style={{ padding: '6px', cursor: 'pointer', background: 'var(--success-bg)', border: 'none', borderRadius: '6px', color: 'var(--success)' }}><CheckCircle size={14} /></button>
                                                )}
                                                <button title="View Details" style={{ padding: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)' }}><Eye size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
