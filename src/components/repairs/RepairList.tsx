'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Eye, Printer, Navigation, CheckCircle, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RepairList() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data: repairData, isLoading } = useQuery({
        queryKey: ['repairs-list', search, statusFilter],
        queryFn: async () => {
            const p = new URLSearchParams();
            if (search) p.append('search', search);
            if (statusFilter !== 'ALL') p.append('status', statusFilter);
            return (await apiClient.get(`/repairs?${p.toString()}`)).data.data;
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => apiClient.post(`/repairs/${id}/status`, { status, notes: `Marked as ${status}` }),
        onSuccess: () => {
            toast.success("Workflow status updated!");
            queryClient.invalidateQueries({ queryKey: ['repairs-list'] });
            queryClient.invalidateQueries({ queryKey: ['repairs', 'dashboard'] });
        },
        onError: (e: any) => toast.error(e.response?.data?.message || "Error updating status")
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '800px' }}>
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 12px' }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Scan or Search Job No, Customer..."
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
                        <option value="RECEIVED">Received</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="READY">Ready for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', flex: 1, height: 0 }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: 'var(--bg-primary)' }}>
                            <tr>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Job Number</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Item & Task</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Promised Date</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Cost Due (₹)</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : repairData?.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No repairs found.</td></tr>
                            ) : (
                                repairData?.map((job: any) => (
                                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                                        <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary)' }}>{job.jobNumber}</td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>
                                            <div>{job.customer?.name || 'Walk-in'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.customer?.mobile}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600 }}>{job.productType}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.repairType}</div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                            {job.estimatedDate ? new Date(job.estimatedDate).toLocaleDateString() : '--'}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700 }}>₹{job.balanceDue?.toLocaleString()}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--success)' }}>Adv: ₹{job.advancePaid}</div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px',
                                                background: job.status === 'READY' ? 'var(--success-bg)' : job.status === 'RECEIVED' ? 'var(--info-bg)' : 'var(--bg-primary)',
                                                color: job.status === 'READY' ? 'var(--success)' : job.status === 'RECEIVED' ? 'var(--info)' : 'var(--text-main)',
                                                border: '1px solid currentColor'
                                            }}>{job.status}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {job.status === 'RECEIVED' && (
                                                    <button onClick={() => statusMutation.mutate({ id: job.id, status: 'IN_PROGRESS' })} title="Start Work" style={{ padding: '6px', cursor: 'pointer', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--warning)' }}><Navigation size={14} /></button>
                                                )}
                                                {job.status === 'IN_PROGRESS' && (
                                                    <button onClick={() => statusMutation.mutate({ id: job.id, status: 'READY' })} title="Mark Ready" style={{ padding: '6px', cursor: 'pointer', background: 'var(--success-bg)', border: 'none', borderRadius: '6px', color: 'var(--success)' }}><CheckCircle size={14} /></button>
                                                )}
                                                {job.status === 'READY' && (
                                                    <button onClick={() => statusMutation.mutate({ id: job.id, status: 'DELIVERED' })} title="Deliver to Customer" style={{ padding: '6px', cursor: 'pointer', background: 'var(--primary)', border: 'none', borderRadius: '6px', color: 'white' }}><PackageCheck size={14} /></button>
                                                )}
                                                <button title="View Details" style={{ padding: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)' }}><Eye size={14} /></button>
                                                <button title="Print Job Card" style={{ padding: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)' }}><Printer size={14} /></button>
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
