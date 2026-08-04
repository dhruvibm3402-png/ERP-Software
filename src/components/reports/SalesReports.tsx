'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Filter, Download, FileText, Printer, FileDown } from 'lucide-react';

export default function SalesReports() {
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['reports', 'sales', search, startDate, endDate, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (status) params.append('status', status);
            return (await apiClient.get(`/reports/sales?${params.toString()}`)).data;
        }
    });

    const data = reportData?.data || [];
    const meta = reportData?.meta || {};

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in">
            {/* ADVANCED FILTERS */}
            <div className="card p-4 bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Customer / Invoice</label>
                    <div className="search-bar border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-primary flex items-center px-3">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Type to search..."
                            className="bg-transparent border-none outline-none py-2 w-full text-sm font-semibold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Range</label>
                    <div className="flex items-center gap-2">
                        <input type="date" className="p-2 text-sm border rounded-lg outline-none focus:border-primary font-semibold text-gray-700" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <span className="text-gray-400 font-bold">-</span>
                        <input type="date" className="p-2 text-sm border rounded-lg outline-none focus:border-primary font-semibold text-gray-700" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select className="p-2 px-4 text-sm border rounded-lg outline-none focus:border-primary font-semibold text-gray-700 bg-white" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="HOLD">Hold / Pending</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button className="btn bg-gray-900 hover:bg-black text-white shadow-lg"><Download size={16} /> Excel</button>
                    <button className="btn bg-rose-600 hover:bg-rose-700 text-white shadow-lg"><FileDown size={16} /> PDF</button>
                </div>
            </div>

            {/* METRICS SUMMARY */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className="card p-4 bg-primary/5 border border-primary/20 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-primary uppercase">Total Records</div>
                    <div className="text-xl font-black text-primary">{meta.count || 0} Invoices</div>
                </div>
                <div className="card p-4 bg-blue-50 border border-blue-100 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-blue-600 uppercase">Gross Sales Value</div>
                    <div className="text-xl font-black text-blue-900">₹{meta.totalSalesValue?.toLocaleString() || 0}</div>
                </div>
                <div className="card p-4 bg-emerald-50 border border-emerald-100 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-emerald-600 uppercase">Received Collections</div>
                    <div className="text-xl font-black text-emerald-900">₹{meta.totalPaid?.toLocaleString() || 0}</div>
                </div>
                <div className="card p-4 bg-rose-50 border border-rose-100 shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-rose-600 uppercase">Pending / Due</div>
                    <div className="text-xl font-black text-rose-900">₹{meta.totalDue?.toLocaleString() || 0}</div>
                </div>
            </div>

            {/* DATA GRID */}
            <div className="card p-0 flex-1 overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm">
                <div className="overflow-x-auto flex-1 h-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/90 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                            <tr className="text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                <th className="p-3">Invoice No</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Total Items</th>
                                <th className="p-3 text-right">Gross Total (₹)</th>
                                <th className="p-3 text-right">Discount (₹)</th>
                                <th className="p-3 text-right">Net Value (₹)</th>
                                <th className="p-3 text-right">Balance Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-400">Loading dataset...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={8} className="p-12 text-center text-gray-400">No matching sales data found based on filters.</td></tr>
                            ) : (
                                data.map((row: any) => (
                                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="p-3 font-mono font-bold text-primary">{row.invoiceNumber}</td>
                                        <td className="p-3 text-gray-600 text-xs">{new Date(row.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 font-semibold text-gray-800">{row.customer?.name || 'Walk-in'}</td>
                                        <td className="p-3 text-gray-700">{row.items?.length || 0}</td>
                                        <td className="p-3 text-right font-semibold text-gray-600">{(row.grandTotal + row.discount).toLocaleString()}</td>
                                        <td className="p-3 text-right text-rose-500">{row.discount > 0 ? `-${row.discount.toLocaleString()}` : '0'}</td>
                                        <td className="p-3 text-right font-black text-gray-900">{row.grandTotal.toLocaleString()}</td>
                                        <td className="p-3 text-right">
                                            {row.balanceAmount > 0
                                                ? <span className="font-bold text-rose-600">{row.balanceAmount.toLocaleString()}</span>
                                                : <span className="text-emerald-500 text-xs font-bold uppercase">PAID</span>}
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
