'use client';
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, FileText, Download, Printer, Banknote, Undo, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import toast from 'react-hot-toast';

export default function PurchaseDetails({ poId, onBack }: { poId: string, onBack: () => void }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');

    const { data: po, isLoading } = useQuery({
        queryKey: ['purchases', poId],
        queryFn: async () => (await apiClient.get(`/purchases/${poId}`)).data
    });

    const approveMutation = useMutation({
        mutationFn: () => apiClient.post(`/purchases/${poId}/approve`),
        onSuccess: () => {
            toast.success('Purchase Order Approved');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
        }
    });

    const receiveMutation = useMutation({
        mutationFn: (items: any) => apiClient.post(`/purchases/${poId}/receive`, { items }),
        onSuccess: () => {
            toast.success('Stock Received from PO');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
        }
    });

    const handleReceiveAll = () => {
        if (!po) return;
        const unreceived = po.items.filter((i: any) => i.quantity > i.receivedQty)
            .map((i: any) => ({ itemId: i.id, receivedQty: i.quantity - i.receivedQty }));

        if (unreceived.length === 0) return toast.error('All items already received');
        receiveMutation.mutate(unreceived);
    };

    if (isLoading) return <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    if (!po) return <div className="p-8 text-center text-red-500">Purchase Order not found</div>;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700';
            case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-700';
            case 'APPROVED': return 'bg-blue-100 text-blue-700';
            case 'PARTIALLY_RECEIVED': return 'bg-orange-100 text-orange-700';
            case 'RECEIVED': return 'bg-emerald-100 text-emerald-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="btn bg-white border shadow-sm px-3"><ArrowLeft size={16} /> Back</button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{po.poNumber}</h1>
                        <p className="text-muted text-sm">{po.vendor?.vendorName} | {new Date(po.poDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(po.status)}`}>
                        {po.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button className="btn bg-white border shadow-sm"><Printer size={16} /> Print</button>
                    <button className="btn bg-white border shadow-sm"><Download size={16} /> Export</button>
                    {po.status === 'DRAFT' && (
                        <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="btn bg-blue-50 text-blue-700 border border-blue-200">
                            {approveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Approve PO
                        </button>
                    )}
                    {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && (
                        <button onClick={handleReceiveAll} disabled={receiveMutation.isPending} className="btn bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {receiveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Receive Full Stock'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content layout similar to VendorProfile */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="card p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl">
                        <div className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">Net Payable</div>
                        <div className="text-3xl font-black mb-4">₹{po.netPayable?.toLocaleString('en-IN')}</div>

                        <div className="space-y-2 border-t border-gray-700 pt-4">
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Paid:</span> <span className="font-semibold text-green-400">₹{po.amountPaid?.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Due:</span> <span className="font-semibold text-orange-400">₹{po.amountDue?.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="card p-5 bg-white border border-gray-100 space-y-4">
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Expected Delivery</div>
                            <div className="text-sm font-semibold text-gray-800">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'Not set'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Branch</div>
                            <div className="text-sm font-semibold text-gray-800">{po.branch?.name || 'Main Branch'}</div>
                        </div>
                        {po.remarks && (
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">Remarks</div>
                                <div className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded border border-gray-100">{po.remarks}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 card p-0 overflow-hidden flex flex-col bg-white border border-gray-100">
                    <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0">
                        {['overview', 'items', 'payments', 'invoices', 'returns', 'documents'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3.5 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {activeTab === 'overview' && (
                            <div className="animate-in fade-in space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Financial Breakdown</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border"><div className="text-xs text-gray-500 font-bold uppercase">Subtotal</div><div className="text-lg font-bold text-gray-900 mt-1">₹{po.subTotal?.toLocaleString()}</div></div>
                                    <div className="p-4 bg-gray-50 rounded-xl border"><div className="text-xs text-gray-500 font-bold uppercase">Making Charges</div><div className="text-lg font-bold text-gray-900 mt-1">₹{po.makingChargesTotal?.toLocaleString()}</div></div>
                                    <div className="p-4 bg-gray-50 rounded-xl border"><div className="text-xs text-gray-500 font-bold uppercase">Wastage Total</div><div className="text-lg font-bold text-gray-900 mt-1">₹{po.wastageTotal?.toLocaleString()}</div></div>
                                    <div className="p-4 bg-gray-50 rounded-xl border"><div className="text-xs text-gray-500 font-bold uppercase">GST Total</div><div className="text-lg font-bold text-gray-900 mt-1">₹{po.gstTotal?.toLocaleString()}</div></div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'items' && (
                            <div className="overflow-x-auto animate-in fade-in">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-y text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="p-3 font-semibold">Product</th>
                                            <th className="p-3 font-semibold">Qty</th>
                                            <th className="p-3 font-semibold text-emerald-600">Recvd</th>
                                            <th className="p-3 font-semibold">Net Wt</th>
                                            <th className="p-3 font-semibold">Rate</th>
                                            <th className="p-3 font-semibold right text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {po.items?.map((item: any) => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                                <td className="p-3 font-medium text-gray-900">{item.product?.name || 'Unknown Item'}</td>
                                                <td className="p-3">{item.quantity}</td>
                                                <td className="p-3 font-bold text-emerald-600">{item.receivedQty}</td>
                                                <td className="p-3">{item.netWeight} g</td>
                                                <td className="p-3">₹{item.rate}</td>
                                                <td className="p-3 text-right font-bold text-secondary">₹{item.amount?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Placeholders for other tabs for brevity */}
                        {['payments', 'invoices', 'returns', 'documents'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in opacity-50">
                                <FileText size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-600">No {activeTab} available</h3>
                                <p className="text-sm text-gray-400 max-w-sm mt-1">We can auto-generate these modules natively by calling respective POST endpoints in this enterprise build.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
