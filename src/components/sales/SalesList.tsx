'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Filter, Download, Printer, Eye, RotateCcw } from 'lucide-react';

export default function SalesList() {
    const [search, setSearch] = useState('');

    const { data: sales, isLoading } = useQuery({
        queryKey: ['sales', search],
        queryFn: async () => (await apiClient.get(`/sales?search=${search}`)).data.data
    });

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in">
            <div className="card flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-2 w-full max-w-2xl">
                    <div className="search-bar flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-primary transition-colors flex items-center px-3 gap-2">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Invoice # or Customer..."
                            className="bg-transparent border-none outline-none py-2.5 w-full text-sm text-gray-800 placeholder:text-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
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
                                <th className="p-4 py-3">Invoice No</th>
                                <th className="p-4 py-3">Customer</th>
                                <th className="p-4 py-3">Date</th>
                                <th className="p-4 py-3">Items</th>
                                <th className="p-4 py-3">Total Amount</th>
                                <th className="p-4 py-3 font-semibold text-emerald-600">Paid</th>
                                <th className="p-4 py-3 font-semibold text-rose-600">Due</th>
                                <th className="p-4 py-3">Status</th>
                                <th className="p-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={9} className="p-8 text-center text-gray-400">Loading sales invoices...</td></tr>
                            ) : sales?.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-gray-400">
                                        No sales records found.
                                    </td>
                                </tr>
                            ) : (
                                sales?.map((sale: any) => (
                                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 font-bold text-gray-900 font-mono">{sale.invoiceNumber}</td>
                                        <td className="p-4 text-gray-800 font-medium">{sale.customer?.name || 'Walk-in Customer'}</td>
                                        <td className="p-4 text-gray-500 text-xs">{new Date(sale.createdAt).toLocaleString()}</td>
                                        <td className="p-4 text-gray-700 font-semibold">{sale.items?.length || 0} Products</td>
                                        <td className="p-4 font-bold text-gray-900">₹{sale.grandTotal.toLocaleString()}</td>
                                        <td className="p-4 font-bold text-emerald-600">₹{sale.paidAmount.toLocaleString()}</td>
                                        <td className="p-4 font-bold text-rose-500">₹{sale.balanceAmount.toLocaleString()}</td>
                                        <td className="p-4">
                                            {sale.paymentStatus === 'PAID' ? (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>
                                            ) : sale.paymentStatus === 'PARTIAL' ? (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200">Partial</span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-red-50 text-red-700 border border-red-200">Unpaid</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16} /></button>
                                                <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Printer size={16} /></button>
                                                <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><RotateCcw size={16} /></button>
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
