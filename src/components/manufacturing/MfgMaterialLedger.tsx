import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Database, TrendingUp, Package } from 'lucide-react';

export default function MfgMaterialLedger() {
    const { data: jobs, isLoading } = useQuery({
        queryKey: ['manufacturing', 'materials'],
        queryFn: async () => {
            const res = await apiClient.get('/manufacturing');
            return res.data.data;
        }
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading Material Ledger...</div>;
    }

    const allMaterials = jobs?.flatMap((job: any) =>
        (job.JobMaterial || []).map((m: any) => ({ ...m, jobNumber: job.jobNumber }))
    ) || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={24} className="text-secondary" />
                <div>
                    <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'bold' }}>Job Material Ledger</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Raw materials assigned to manufacturing jobs.</p>
                </div>
            </div>

            <div className="card flex-1 p-0 flex flex-col overflow-hidden">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: 'var(--bg-primary)' }}>
                            <tr>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Job Number</th>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Material Details</th>
                                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Type</th>
                                <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>Weight (g)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMaterials.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No material ledgers found.</td></tr>
                            ) : (
                                allMaterials.map((m: any, i: number) => (
                                    <tr key={m.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{m.jobNumber}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '500' }}>{m.materialName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Purity: {m.purity || 'N/A'} • Qty: {m.quantity}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-main)', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px' }}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {m.weight?.toFixed(2)}g
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
