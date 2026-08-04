'use client';
import React, { useState } from 'react';
import {
    Search, Plus, ChevronLeft, ChevronRight,
    Edit, Eye, Trash2, Loader2, AlertTriangle, X,
    Download
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../utils/apiClient';
import VendorForm from './vendors/VendorForm';
import VendorProfile from './vendors/VendorProfile';

/* ── Delete confirmation dialog ─────────────────────────── */
function DeleteDialog({
    vendor,
    onConfirm,
    onCancel,
    isPending,
}: {
    vendor: any;
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(30,30,30,0.6)',
                backdropFilter: 'blur(4px)', zIndex: 200,
                display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'
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
                            Deactivate Vendor?
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--secondary)' }}>{vendor.vendorName}</strong> ({vendor.vendorCode}) will be
                            marked as <strong>Inactive</strong>. All their history is preserved and this action can be reversed.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#92400E', width: '100%',
                    }}>
                        ⚠ The vendor record is never permanently deleted.
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

export default function Vendors() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebounced] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingVendor, setEditing] = useState<any>(null);
    const [viewingVendor, setViewing] = useState<any>(null);
    const [deletingVendor, setDeleting] = useState<any>(null);

    React.useEffect(() => {
        const t = setTimeout(() => { setDebounced(searchTerm); setPage(1); }, 450);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const { data: vendorsData, isLoading } = useQuery({
        queryKey: ['vendors', page, debouncedSearch, statusFilter, typeFilter],
        queryFn: async () => {
            const res = await apiClient.get('/vendors', {
                params: { page, limit: 10, search: debouncedSearch, status: statusFilter || undefined, vendorType: typeFilter || undefined },
            });
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/vendors/${id}`),
        onSuccess: () => {
            toast.success('Vendor deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            setDeleting(null);
        },
        onError: () => {
            toast.error('Failed to deactivate vendor');
        },
    });

    const openEdit = (vendor: any) => {
        setEditing(vendor);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    if (viewingVendor) {
        return (
            <VendorProfile
                vendor={viewingVendor}
                onBack={() => setViewing(null)}
                onEdit={(v) => { setViewing(null); openEdit(v); }}
            />
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Vendor Management</h1>
                    <p className="text-muted mt-1">Manage your suppliers, manufacturers, and partners.</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-lg">
                    <Plus size={18} /> Add Vendor
                </button>
            </div>

            {/* Toolbar */}
            <div className="card flex flex-wrap items-center justify-between gap-3" style={{ padding: '12px 16px' }}>
                <div className="search-bar" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', margin: 0, minWidth: '280px' }}>
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search vendors by name, company, GST, mobile..."
                        className="search-input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        className="btn"
                        style={{ background: 'var(--bg-primary)', color: 'var(--secondary)', border: '1px solid var(--border-color)', outline: 'none' }}
                    >
                        <option value="">All Types</option>
                        <option value="GOLD_SUPPLIER">Gold Supplier</option>
                        <option value="SILVER_SUPPLIER">Silver Supplier</option>
                        <option value="DIAMOND_SUPPLIER">Diamond Supplier</option>
                        <option value="JEWELLERY_MANUFACTURER">Jewellery Manufacturer</option>
                        <option value="PACKAGING_SUPPLIER">Packaging Supplier</option>
                        <option value="ACCESSORIES_SUPPLIER">Accessories Supplier</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="btn"
                        style={{ background: 'var(--bg-primary)', color: 'var(--secondary)', border: '1px solid var(--border-color)', outline: 'none' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <button className="btn text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100" onClick={() => queryClient.invalidateQueries({ queryKey: ['vendors'] })}>
                        Refresh
                    </button>
                    <button className="btn bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">
                        <Download size={16} /> Export Excel
                    </button>
                    <button className="btn bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card flex-1 overflow-hidden flex flex-col p-0 relative min-h-[400px]">
                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                )}
                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                {['Vendor Code', 'Vendor Name', 'Type / Contact', 'GST / City', 'Outstanding', 'Status', 'Actions'].map((h, i) => (
                                    <th key={h} style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 6 ? 'right' : 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {!isLoading && vendorsData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Search size={28} className="text-gray-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-800">No vendors found</p>
                                            <p className="text-sm mt-1">Try tweaking your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : vendorsData?.data?.map((vendor: any) => (
                                <tr
                                    key={vendor.id}
                                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                    className="hover:bg-gray-50/50"
                                >
                                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{vendor.vendorCode}</td>
                                    <td style={{ padding: '14px 16px', fontSize: 14 }}>
                                        <div className="font-bold text-gray-900">{vendor.vendorName}</div>
                                        {vendor.companyName && <div className="text-xs text-gray-500 font-medium">{vendor.companyName}</div>}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                        <div className="font-semibold text-gray-700">{vendor.vendorType?.replace('_', ' ')}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{vendor.mobile}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                                        <div>{vendor.gstNumber || 'N/A'}</div>
                                        <div>{vendor.city || '-'}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--secondary)' }}>
                                        ₹{(vendor.outstandingBalance || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <div className="flex justify-end gap-1">
                                            <button title="View Details" onClick={() => setViewing(vendor)} className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                                                <Eye size={16} />
                                            </button>
                                            <button title="Edit Vendor" onClick={() => openEdit(vendor)} className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                                                <Edit size={16} />
                                            </button>
                                            {vendor.status === 'ACTIVE' && (
                                                <button title="Deactivate Vendor" onClick={() => setDeleting(vendor)} className="icon-btn hover:text-red-500 hover:bg-red-50" style={{ color: 'var(--text-muted)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {vendorsData?.meta && vendorsData.data.length > 0 && (
                    <div className="flex justify-between items-center" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Showing {(vendorsData.meta.page - 1) * vendorsData.meta.limit + 1}–{Math.min(vendorsData.meta.page * vendorsData.meta.limit, vendorsData.meta.total)} of {vendorsData.meta.total}
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="icon-btn" style={{ opacity: page === 1 ? 0.4 : 1 }}>
                                <ChevronLeft size={18} />
                            </button>
                            <button style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700 }}>
                                {page}
                            </button>
                            <button onClick={() => setPage(p => Math.min(vendorsData.meta.totalPages, p + 1))} disabled={page >= vendorsData.meta.totalPages} className="icon-btn" style={{ opacity: page >= vendorsData.meta.totalPages ? 0.4 : 1 }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <VendorForm
                    initialData={editingVendor}
                    onClose={closeForm}
                />
            )}

            {deletingVendor && (
                <DeleteDialog
                    vendor={deletingVendor}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(deletingVendor.id)}
                    onCancel={() => { if (!deleteMutation.isPending) setDeleting(null); }}
                />
            )}
        </div>
    );
}
