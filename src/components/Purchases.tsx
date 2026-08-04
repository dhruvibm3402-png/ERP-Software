'use client';
import React, { useState } from 'react';
import { Search, Plus, FileText, ShoppingCart, Download, Printer, Filter, ChevronRight, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';

import PurchaseForm from './purchases/PurchaseForm';
import PurchaseDetails from './purchases/PurchaseDetails';

export default function Purchases() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [viewingPo, setViewingPo] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['purchases', search, page],
        queryFn: async () => {
            const res = await apiClient.get(`/purchases?search=${search}&page=${page}&limit=10`);
            return res.data;
        }
    });

    const purchases = data?.data || [];
    const meta = data?.meta;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700 border border-gray-200';
            case 'PENDING_APPROVAL': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
            case 'APPROVED': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'PARTIALLY_RECEIVED': return 'bg-orange-50 text-orange-700 border border-orange-200';
            case 'RECEIVED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border border-red-200';
            case 'COMPLETED': return 'bg-purple-50 text-purple-700 border border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    if (viewingPo) {
        return <PurchaseDetails poId={viewingPo.id} onBack={() => setViewingPo(null)} />;
    }

    return (
        <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
                        <ShoppingCart size={24} className="text-primary" /> Purchase Management
                    </h1>
                    <p className="text-muted mt-1 text-sm">Manage enterprise purchase orders, vendor interactions, and stock receiving.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn bg-white border text-gray-700 hover:bg-gray-50"><Download size={16} /> Export</button>
                    <button className="btn btn-primary shadow-lg" onClick={() => { setEditData(null); setShowForm(true); }}>
                        <Plus size={18} /> New Purchase
                    </button>
                </div>
            </div>

            <div className="card flex items-center justify-between p-4 py-3 bg-white border border-gray-100 shadow-sm">
                <div className="search-bar w-96 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-primary transition-colors flex items-center px-3 gap-2">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search PO Number or Vendor..."
                        className="bg-transparent border-none outline-none py-2 w-full text-sm text-gray-800 placeholder:text-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn bg-white border text-gray-600 border-gray-200 text-sm hover:bg-gray-50">
                    <Filter size={16} /> Filters
                </button>
            </div>

            <div className="card p-0 flex-1 overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm">
                <div className="overflow-x-auto flex-1 h-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                            <tr className="text-gray-500 uppercase tracking-wider text-xs font-bold">
                                <th className="p-4 py-3">PO Number</th>
                                <th className="p-4 py-3">Vendor</th>
                                <th className="p-4 py-3">Date</th>
                                <th className="p-4 py-3">Items</th>
                                <th className="p-4 py-3">Net Payable</th>
                                <th className="p-4 py-3">Paid/Due</th>
                                <th className="p-4 py-3">Status</th>
                                <th className="p-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-400">Loading purchase orders...</td>
                                </tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                                        <ShoppingCart size={40} className="opacity-20" />
                                        <p>No purchase orders found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((po: any) => (
                                    <tr key={po.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setViewingPo(po)}>
                                        <td className="p-4 font-bold text-gray-900">{po.poNumber}</td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-800">{po.vendor?.vendorName}</div>
                                            <div className="text-xs text-gray-400">{po.vendor?.vendorCode || 'VENDOR'}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{new Date(po.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium text-gray-600">{po._count?.items || 0} items</td>
                                        <td className="p-4 font-extrabold text-secondary">₹{po.netPayable?.toLocaleString('en-IN')}</td>
                                        <td className="p-4">
                                            <div className="font-semibold text-emerald-600">₹{po.amountPaid?.toLocaleString()}</div>
                                            <div className="text-xs text-orange-500 font-bold">Due: ₹{po.amountDue?.toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md ${getStatusStyle(po.status)}`}>
                                                {po.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setViewingPo(po); }}>
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta?.totalPages > 1 && (
                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center shrink-0">
                        <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === meta.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <PurchaseForm initialData={editData} onClose={() => setShowForm(false)} />
            )}
        </div>
    );
}
