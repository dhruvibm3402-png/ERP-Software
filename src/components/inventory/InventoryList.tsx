'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Filter, Download, Plus, ChevronRight, Barcode, Box } from 'lucide-react';

export default function InventoryList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['inventory', search, page],
        queryFn: async () => (await apiClient.get(`/inventory?search=${search}&page=${page}&limit=15`)).data
    });

    const items = inventoryData?.data || [];
    const meta = inventoryData?.meta;

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in">
            <div className="card flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-2 w-full max-w-2xl">
                    <div className="search-bar flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-primary transition-colors flex items-center px-3 gap-2">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by SKU, Product Name, Category..."
                            className="bg-transparent border-none outline-none py-2.5 w-full text-sm text-gray-800 placeholder:text-gray-400"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn bg-white border text-gray-600 border-gray-200 hover:bg-gray-50 px-4">
                        <Barcode size={18} />
                    </button>
                    <button className="btn bg-white border text-gray-600 border-gray-200 hover:bg-gray-50 px-4">
                        <Filter size={18} /> Filters
                    </button>
                </div>
                <button className="btn bg-white border text-gray-700 hover:bg-gray-50"><Download size={16} /> Export Excel</button>
            </div>

            <div className="card p-0 flex-1 overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm">
                <div className="overflow-x-auto flex-1 h-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                            <tr className="text-gray-500 uppercase tracking-wider text-xs font-bold">
                                <th className="p-4 py-3">Product Name</th>
                                <th className="p-4 py-3">SKU / Code</th>
                                <th className="p-4 py-3">Category</th>
                                <th className="p-4 py-3">Net Wt</th>
                                <th className="p-4 py-3 font-semibold text-emerald-600">Available</th>
                                <th className="p-4 py-3 font-semibold text-orange-600">Reserved</th>
                                <th className="p-4 py-3 font-semibold text-gray-900">Total Qty</th>
                                <th className="p-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-400">Loading inventory list...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                                        <Box size={40} className="opacity-20" />
                                        <p>No inventory records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                items.map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{inv.product?.name}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-[200px]">{inv.product?.description || 'No description'}</div>
                                        </td>
                                        <td className="p-4 font-mono text-gray-600">{inv.product?.sku}</td>
                                        <td className="p-4">
                                            <div className="text-gray-800">{inv.product?.category}</div>
                                        </td>
                                        <td className="p-4 text-gray-700">{inv.netWeight} g</td>
                                        <td className="p-4 font-black text-emerald-600 text-base">{inv.availableStock}</td>
                                        <td className="p-4 font-bold text-orange-500">{inv.reservedStock}</td>
                                        <td className="p-4 font-black text-gray-900 text-base">{inv.quantity}</td>
                                        <td className="p-4">
                                            {inv.availableStock <= 0 ? (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-red-50 text-red-700 border border-red-200">Out of Stock</span>
                                            ) : inv.availableStock <= inv.minimumStock ? (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200">Low Stock</span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">In Stock</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
        </div>
    );
}
