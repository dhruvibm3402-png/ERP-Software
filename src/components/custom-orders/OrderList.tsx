'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Eye, ArrowRight } from 'lucide-react';
import OrderDetails from './OrderDetails';

export default function OrderList() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [viewingOrder, setViewingOrder] = useState<string | null>(null);

    const { data: qData, isLoading } = useQuery({
        queryKey: ['custom-orders', search, statusFilter],
        queryFn: async () => {
            const p = new URLSearchParams();
            if (search) p.append('search', search);
            if (statusFilter !== 'ALL') p.append('status', statusFilter);
            return (await apiClient.get(`/custom-orders?${p.toString()}`)).data;
        }
    });

    const orders = qData?.data || [];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DRAFT': return { bg: 'var(--bg-primary)', color: 'var(--text-muted)' };
            case 'QUOTATION': return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
            case 'CUSTOMER_APPROVAL': return { bg: 'var(--info-bg)', color: 'var(--info)' };
            case 'MANUFACTURING': return { bg: '#FCE7F3', color: '#BE185D' };
            case 'READY': return { bg: 'var(--success-bg)', color: 'var(--success)' };
            case 'DELIVERED': return { bg: '#DEF7EC', color: '#03543F' };
            default: return { bg: 'var(--bg-primary)', color: 'var(--text-main)' };
        }
    };

    if (viewingOrder) {
        return <OrderDetails orderId={viewingOrder} onBack={() => setViewingOrder(null)} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div className="card" style={{ padding: '12px', display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 12px' }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search Order No, Customer, Mobile..."
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
                    <option value="QUOTATION">Quotation</option>
                    <option value="CUSTOMER_APPROVAL">Waiting Approval</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="READY">Ready for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                </select>
            </div>

            <div className="card flex-1 p-0 flex flex-col overflow-hidden">
                <div className="overflow-x-auto flex-1 h-0">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ background: 'var(--bg-primary)' }}>
                            <tr>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Order No</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Type / Item</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Advances Due</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Pipeline Stage</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No custom orders found.</td></tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary)' }}>{order.orderNumber}</td>
                                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{order.customer?.name || 'Walk-in'}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                            {order.items?.[0]?.itemName || 'Jewellery Set'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div className="font-semibold text-danger">Due: ₹{(order.balance || 0).toLocaleString()}</div>
                                            <div className="text-xs text-muted">Paid: ₹{(order.advancePaid || 0).toLocaleString()}</div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px',
                                                background: getStatusStyle(order.status).bg,
                                                color: getStatusStyle(order.status).color,
                                                border: '1px solid currentColor'
                                            }}>{order.status.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button onClick={() => setViewingOrder(order.id)} title="View Workflow" style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                Workflow <ArrowRight size={14} />
                                            </button>
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
