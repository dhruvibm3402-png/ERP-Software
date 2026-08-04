'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { ArrowRight, Box } from 'lucide-react';

export default function StockTransfer() {
    const { data, isLoading } = useQuery({
        queryKey: ['inventory-transfers'],
        queryFn: async () => (await apiClient.get('/inventory/transfer')).data.data
    });

    const transfers = data || [];

    return (
        <div className="card p-0 flex-1 overflow-hidden flex flex-col h-full bg-white border border-gray-100 shadow-sm animate-in fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/80">
                <div>
                    <h3 className="font-bold text-gray-800">Branch Transfers</h3>
                    <p className="text-xs text-gray-500">Track and manage inventory moving between branches.</p>
                </div>
                <button className="btn btn-primary shadow-sm text-sm" onClick={() => alert('New Transfer map logic here.')}>New Transfer</button>
            </div>
            <div className="overflow-x-auto flex-1 h-0">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white sticky top-0 border-b border-gray-200">
                        <tr className="text-gray-500 uppercase tracking-wider text-xs font-bold">
                            <th className="p-4 py-3">Transfer No</th>
                            <th className="p-4 py-3">Date</th>
                            <th className="p-4 py-3">Source Branch</th>
                            <th className="p-4 py-3">Destination Branch</th>
                            <th className="p-4 py-3">Items</th>
                            <th className="p-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading transfers...</td></tr>
                        ) : transfers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400">
                                    <ArrowRight size={40} className="mx-auto opacity-20 mb-3" />
                                    <p>No branch transfers found.</p>
                                </td>
                            </tr>
                        ) : (
                            transfers.map((trf: any) => (
                                <tr key={trf.id} className="hover:bg-gray-50 group cursor-pointer transition-colors">
                                    <td className="p-4 font-bold text-gray-900">{trf.transferNumber}</td>
                                    <td className="p-4 text-gray-600">{new Date(trf.transferDate).toLocaleDateString()}</td>
                                    <td className="p-4 font-semibold text-gray-700">{trf.sourceBranch?.name || 'Main Branch'}</td>
                                    <td className="p-4 font-semibold text-gray-700 flex items-center gap-2">
                                        <ArrowRight size={14} className="text-gray-400" /> {trf.destBranch?.name || 'Unknown'}
                                    </td>
                                    <td className="p-4 text-gray-600">{trf.items?.length || 0} Products</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg ${trf.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                            {trf.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
