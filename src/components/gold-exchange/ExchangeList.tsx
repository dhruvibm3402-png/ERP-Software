'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, Filter, Printer, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExchangeList() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: exchanges, isLoading } = useQuery({
        queryKey: ['gold-exchange-list', search],
        queryFn: async () => (await apiClient.get(`/gold-exchange?search=${search}`)).data.data
    });

    // Mock quick approve for simplicity, actual would use a detailed testing modal
    const approveMutation = useMutation({
        mutationFn: (id: string) => apiClient.post(`/gold-exchange/${id}/approve`, {
            currentGoldRate: 6000,
            meltingLossPct: 2,
            deductionPct: 1,
            stoneDeduction: 0,
            labourDeduction: 0,
            finalGoldWeight: 10,
            finalExchangeValue: 60000,
            purityPercent: 91.6,
            karat: '22K',
            testMethod: 'TOUCH_TEST',
            testedBy: 'SYS_ADMIN',
            notes: 'Quick approve from list'
        }),
        onSuccess: () => {
            toast.success("Exchange Valuated & Approved successfully!");
            queryClient.invalidateQueries({ queryKey: ['gold-exchange-list'] });
            queryClient.invalidateQueries({ queryKey: ['gold-exchange', 'dashboard'] });
        },
        onError: (e: any) => toast.error(e.response?.data?.message || "Error approving exchange")
    });

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in">
            <div className="card flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-2 w-full max-w-2xl">
                    <div className="search-bar flex-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-primary transition-colors flex items-center px-3 gap-2">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or Customer..."
                            className="bg-transparent border-none outline-none py-2.5 w-full text-sm text-gray-800 placeholder:text-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card p-0 flex-1 overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm">
                <div className="overflow-x-auto flex-1 h-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                            <tr className="text-gray-500 uppercase tracking-wider text-xs font-bold">
                                <th className="p-4 py-3">Exchange No</th>
                                <th className="p-4 py-3">Customer</th>
                                <th className="p-4 py-3">Date</th>
                                <th className="p-4 py-3">Total Gross Wt</th>
                                <th className="p-4 py-3 font-semibold text-emerald-600">Final Value</th>
                                <th className="p-4 py-3">Status</th>
                                <th className="p-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading records...</td></tr>
                            ) : exchanges?.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-gray-400">No exchange records found.</td></tr>
                            ) : (
                                exchanges?.map((ex: any) => (
                                    <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 font-bold text-gray-900 font-mono">{ex.exchangeNumber}</td>
                                        <td className="p-4 text-gray-800 font-medium">{ex.customer?.name}</td>
                                        <td className="p-4 text-gray-500 text-xs">{new Date(ex.createdAt).toLocaleString()}</td>
                                        <td className="p-4 text-gray-700">{ex.totalGrossWeight} g</td>
                                        <td className="p-4 font-bold text-emerald-600">{ex.totalExchangeValue > 0 ? `₹${ex.totalExchangeValue.toLocaleString()}` : '--'}</td>
                                        <td className="p-4">
                                            {ex.status === 'APPROVED' ? (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200">Draft</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg"><Eye size={16} /></button>
                                                {ex.status === 'DRAFT' && (
                                                    <button onClick={() => approveMutation.mutate(ex.id)} className="p-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Quick Approve (MOCK)">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"><Printer size={16} /></button>
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
