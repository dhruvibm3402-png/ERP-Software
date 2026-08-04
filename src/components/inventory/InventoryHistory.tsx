'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { RefreshCw } from 'lucide-react';

export default function InventoryHistory() {
    const { data, isLoading } = useQuery({
        queryKey: ['inventory-history'],
        queryFn: async () => (await apiClient.get('/inventory/history')).data.data
    });

    const items = data || [];

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'STOCK_IN':
            case 'PURCHASE':
                return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            case 'STOCK_OUT':
            case 'SALE':
                return 'text-rose-700 bg-rose-50 border border-rose-200';
            case 'TRANSFER':
                return 'text-blue-700 bg-blue-50 border border-blue-200';
            default:
                return 'text-gray-700 bg-gray-50 border border-gray-200';
        }
    };

    return (
        <div className="card p-0 flex-1 overflow-hidden flex flex-col h-full bg-white border border-gray-100 shadow-sm animate-in fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/80">
                <div>
                    <h3 className="font-bold text-gray-800">Movement History</h3>
                    <p className="text-xs text-gray-500">Global audit log of all quantity modifications.</p>
                </div>
            </div>
            <div className="overflow-x-auto flex-1 h-0">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white sticky top-0 border-b border-gray-200">
                        <tr className="text-gray-500 uppercase tracking-wider text-xs font-bold">
                            <th className="p-4 py-3">Date</th>
                            <th className="p-4 py-3">Product Name</th>
                            <th className="p-4 py-3">Action Type</th>
                            <th className="p-4 py-3 text-right">Qty Chg</th>
                            <th className="p-4 py-3 text-right">Prev</th>
                            <th className="p-4 py-3 text-right">New Qty</th>
                            <th className="p-4 py-3">Reason / Ref</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading history...</td></tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-gray-400">
                                    <RefreshCw size={40} className="mx-auto opacity-20 mb-3" />
                                    <p>No inventory movements recorded yet.</p>
                                </td>
                            </tr>
                        ) : (
                            items.map((mov: any) => (
                                <tr key={mov.id} className="hover:bg-gray-50 group transition-colors">
                                    <td className="p-4 text-gray-600">{new Date(mov.createdAt).toLocaleString()}</td>
                                    <td className="p-4 font-bold text-gray-900">{mov.product?.name} <span className="text-xs text-gray-400 ml-2">{mov.product?.sku}</span></td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-lg ${getTypeStyle(mov.type)}`}>
                                            {mov.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right font-black ${mov.quantity > 0 ? 'text-emerald-600' : mov.quantity < 0 ? 'text-rose-600' : 'text-gray-600'}`}>
                                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                                    </td>
                                    <td className="p-4 text-right text-gray-500">{mov.previousStock}</td>
                                    <td className="p-4 text-right font-bold text-gray-900">{mov.currentStock}</td>
                                    <td className="p-4 text-xs text-gray-600">{mov.reason} {mov.referenceId && `| Ref: ${mov.referenceId}`}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
