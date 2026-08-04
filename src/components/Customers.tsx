'use client';
import React, { useState } from 'react';
import {
    Search, Plus, ChevronLeft, ChevronRight,
    Edit, Eye, Trash2, Loader2, AlertTriangle, X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../utils/apiClient';
import CustomerForm from './customers/CustomerForm';
import CustomerProfile from './customers/CustomerProfile';

/* ── Tier badge ──────────────────────────────────────────── */
function TierChip({ tier }: { tier: string }) {
    const styles: Record<string, React.CSSProperties> = {
        Platinum: { background: '#E5E4E2', color: '#555' },
        Gold:     { background: 'rgba(212,175,55,0.2)', color: '#D4AF37' },
        Silver:   { background: '#F0F0F0', color: '#888' },
    };
    const s = styles[tier] ?? styles.Silver;
    return (
        <span style={{ ...s, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {tier}
        </span>
    );
}

/* ── Delete confirmation dialog ─────────────────────────── */
function DeleteDialog({
    customer,
    onConfirm,
    onCancel,
    isPending,
}: {
    customer: any;
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(30,30,30,0.6)',
                backdropFilter: 'blur(4px)', zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={(e) => { if (e.target === e.currentTarget && !isPending) onCancel(); }}
        >
            <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32, position: 'relative' }}>
                <button
                    onClick={onCancel}
                    disabled={isPending}
                    style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center gap-4" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'var(--danger-bg)', border: '2px solid rgba(239,68,68,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--secondary)', marginBottom: 8 }}>
                            Deactivate Customer?
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--secondary)' }}>{customer.name}</strong> ({customer.customerId}) will be
                            marked as <strong>Inactive</strong>. All their history is preserved and this action can be reversed.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#92400E', width: '100%',
                    }}>
                        ⚠ The customer record is never permanently deleted.
                    </div>

                    <div className="flex gap-3" style={{ width: '100%', marginTop: 4 }}>
                        <button
                            onClick={onCancel}
                            disabled={isPending}
                            className="btn"
                            style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', justifyContent: 'center' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPending}
                            className="btn"
                            style={{
                                flex: 1, background: 'var(--danger)', color: '#fff',
                                border: 'none', justifyContent: 'center',
                                opacity: isPending ? 0.7 : 1,
                            }}
                        >
                            {isPending
                                ? <><Loader2 size={14} className="animate-spin" /> Deactivating…</>
                                : <><Trash2 size={14} /> Deactivate</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main component ─────────────────────────────────────── */
export default function Customers() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm]       = useState('');
    const [debouncedSearch, setDebounced]   = useState('');
    const [tierFilter, setTierFilter]       = useState('');
    const [page, setPage]                   = useState(1);
    const [showForm, setShowForm]           = useState(false);
    const [editingCustomer, setEditing]     = useState<any>(null);
    const [viewingCustomer, setViewing]     = useState<any>(null);
    const [deletingCustomer, setDeleting]   = useState<any>(null);

    /* Debounce search */
    React.useEffect(() => {
        const t = setTimeout(() => { setDebounced(searchTerm); setPage(1); }, 450);
        return () => clearTimeout(t);
    }, [searchTerm]);

    /* List query */
    const { data: customersData, isLoading } = useQuery({
        queryKey: ['customers', page, debouncedSearch, tierFilter],
        queryFn: async () => {
            const res = await apiClient.get('/customers', {
                params: { page, limit: 10, search: debouncedSearch, tier: tierFilter || undefined },
            });
            return res.data;
        },
    });

    /* Delete mutation */
    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),
        onSuccess: () => {
            toast.success('Customer deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setDeleting(null);
        },
        onError: () => {
            toast.error('Failed to deactivate customer');
        },
    });

    const openEdit = (customer: any) => {
        setEditing(customer);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    /* Detail view */
    if (viewingCustomer) {
        return (
            <CustomerProfile
                customer={viewingCustomer}
                onBack={() => setViewing(null)}
                onEdit={(c) => { setViewing(null); openEdit(c); }}
            />
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Customers</h1>
                    <p className="text-muted mt-1">Manage your jewellery store's clientele and loyalties.</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={18} /> Add New Customer
                </button>
            </div>

            {/* Toolbar */}
            <div className="card flex items-center justify-between" style={{ padding: '12px 16px' }}>
                <div className="search-bar" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', margin: 0 }}>
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, phone or ID…"
                        className="search-input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={tierFilter}
                        onChange={e => setTierFilter(e.target.value)}
                        className="btn"
                        style={{ background: 'var(--bg-primary)', color: 'var(--secondary)', border: '1px solid var(--border-color)', outline: 'none' }}
                    >
                        <option value="">All Tiers</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                    </select>
                    <button className="btn" style={{ background: 'var(--bg-primary)', color: 'var(--secondary)' }}>
                        Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card flex-1 overflow-hidden flex flex-col p-0 relative">
                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                )}
                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                {['Customer ID', 'Name', 'Contact', 'Loyalty Tier', 'Total Spent', 'Last Visit', 'Actions'].map((h, i) => (
                                    <th key={h} style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 6 ? 'right' : 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {customersData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                        No customers found.
                                    </td>
                                </tr>
                            ) : customersData?.data?.map((customer: any) => (
                                <tr
                                    key={customer.id}
                                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{customer.customerId}</td>
                                    <td style={{ padding: '14px 16px', fontSize: 14 }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{
                                                width: 34, height: 34, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary), #8B6914)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                                            }}>
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold" style={{ color: 'var(--secondary)' }}>{customer.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                        <div>{customer.mobile}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customer.email}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}><TierChip tier={customer.tier} /></td>
                                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700 }}>₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{new Date(customer.lastVisit).toLocaleDateString('en-IN')}</td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <div className="flex justify-end gap-1">
                                            <button title="View Details" onClick={() => setViewing(customer)} className="icon-btn" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                                                <Eye size={16} />
                                            </button>
                                            <button title="Edit Customer" onClick={() => openEdit(customer)} className="icon-btn" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--secondary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                                                <Edit size={16} />
                                            </button>
                                            <button title="Deactivate Customer" onClick={() => setDeleting(customer)} className="icon-btn" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {customersData?.meta && (
                    <div className="flex justify-between items-center" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Showing {(customersData.meta.page - 1) * customersData.meta.limit + 1}–{Math.min(customersData.meta.page * customersData.meta.limit, customersData.meta.total)} of {customersData.meta.total}
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="icon-btn" style={{ opacity: page === 1 ? 0.4 : 1 }}>
                                <ChevronLeft size={18} />
                            </button>
                            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700 }}>
                                {page}
                            </button>
                            <button onClick={() => setPage(p => Math.min(customersData.meta.totalPages, p + 1))} disabled={page >= customersData.meta.totalPages} className="icon-btn" style={{ opacity: page >= customersData.meta.totalPages ? 0.4 : 1 }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit form modal */}
            {showForm && (
                <CustomerForm
                    initialData={editingCustomer}
                    onClose={closeForm}
                />
            )}

            {/* Delete confirmation dialog */}
            {deletingCustomer && (
                <DeleteDialog
                    customer={deletingCustomer}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(deletingCustomer.id)}
                    onCancel={() => { if (!deleteMutation.isPending) setDeleting(null); }}
                />
            )}
        </div>
    );
}
