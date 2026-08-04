'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Download, FileDown, Layers, Package, TrendingDown } from 'lucide-react';

export default function InventoryReports() {
    const [search, setSearch] = useState('');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['reports', 'inventory', search],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            return (await apiClient.get(`/reports/inventory?${params.toString()}`)).data;
        }
    });

    const data = reportData?.data || [];
    const meta = reportData?.meta || {};

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in">
            {/* ADVANCED FILTERS */}
            <div className="card p-4 bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full max-w-lg">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Products / SKU</label>
                    <div className="search-bar border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-primary flex items-center px-3">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by SKU or Barcode..."
                            className="bg-transparent border-none outline-none py-2 w-full text-sm font-semibold text-gray-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Status</label>
                    <select className="p-2 px-4 text-sm border rounded-lg outline-none focus:border-primary font-semibold text-gray-700 bg-white">
                        <option value="ALL">All Stock</option>
                        <option value="LOW">Low Stock</option>
                        <option value="OUT">Out Of Stock</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select className="p-2 px-4 text-sm border rounded-lg outline-none focus:border-primary font-semibold text-gray-700 bg-white">
                        <option value="ALL">All Categories</option>
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                        <option value="DIAMOND">Diamond</option>
                    </select>
                </div>

                <div className="flex gap-2 shrink-0 ml-auto">
                    <button className="btn bg-gray-900 hover:bg-black text-white shadow-lg"><Download size={16} /> Excel</button>
                    <button className="btn bg-rose-600 hover:bg-rose-700 text-white shadow-lg"><FileDown size={16} /> PDF</button>
                </div>
            </div>

            {/* METRICS SUMMARY */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className="card p-4 bg-primary/5 border border-primary/20 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-primary uppercase">Total Unique SKUs</div>
                    <div className="text-xl font-black text-primary">{meta.count || 0}</div>
                </div>
                <div className="card p-4 bg-amber-50 border border-amber-100 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-amber-600 uppercase">Gross Weight Embedded</div>
                    <div className="flex items-baseline gap-1">
                        <div className="text-xl font-black text-amber-900">{meta.totalWeight?.toLocaleString() || 0}</div>
                        <span className="text-sm font-semibold text-amber-700">g</span>
                    </div>
                </div>
                <div className="card p-4 bg-purple-50 border border-purple-100 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-purple-600 uppercase">Total Unit Quantity</div>
                    <div className="flex items-baseline gap-1">
                        <div className="text-xl font-black text-purple-900">{meta.totalQuantity?.toLocaleString() || 0}</div>
                    </div>
                </div>
            </div>

            {/* DATA GRID */}
            <div className="card p-0 flex-1 overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm">
                <div className="overflow-x-auto flex-1 h-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/90 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                            <tr className="text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                <th className="p-3">SKU / Product Info</th>
                                <th className="p-3">Category</th>
                                <th className="p-3 text-right">Physical Quantity</th>
                                <th className="p-3 text-right">Avail Stock</th>
                                <th className="p-3 text-right">Gross Weight (g)</th>
                                <th className="p-3 text-right">Net Weight (g)</th>
                                <th className="p-3 text-right">Reserved/Allocated</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-400">Loading dataset...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={8} className="p-12 text-center text-gray-400">No matching inventory data found based on filters.</td></tr>
                            ) : (
                                data.map((row: any) => {
                                    const prod = row.Product;
                                    const reserved = row.quantity - row.availableStock;
                                    const isLow = row.availableStock <= 5;
                                    return (
                                        <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-3">
                                                <div className="font-bold text-gray-900">{prod.name}</div>
                                                <div className="text-xs font-mono text-gray-400">{prod.barcode}</div>
                                            </td>
                                            <td className="p-3 text-gray-600 font-semibold">{prod.category}</td>
                                            <td className="p-3 text-right font-black text-primary">{row.quantity}</td>
                                            <td className="p-3 text-right font-semibold text-gray-700">{row.availableStock}</td>
                                            <td className="p-3 text-right font-medium">{row.grossWeight} g</td>
                                            <td className="p-3 text-right font-medium text-amber-700">{row.netWeight} g</td>
                                            <td className="p-3 text-right">
                                                {reserved > 0 ? <span className="text-orange-500 font-bold">{reserved} qty</span> : <span className="text-gray-400 text-xs">0</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                {row.availableStock === 0 ? (
                                                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-red-50 text-red-700 border border-red-200">Out of Stock</span>
                                                ) : isLow ? (
                                                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200">Re-order</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Healthy</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
