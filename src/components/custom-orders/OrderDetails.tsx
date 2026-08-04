'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import {
    ArrowLeft, PenTool, DollarSign, Factory, PackageCheck, Image as ImageIcon, CheckCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetails({ orderId, onBack }: { orderId: string, onBack: () => void }) {
    const queryClient = useQueryClient();

    const { data: qData, isLoading } = useQuery({
        queryKey: ['custom-order', orderId],
        queryFn: async () => (await apiClient.get(`/custom-orders/${orderId}`)).data
    });

    const mutateStatus = useMutation({
        mutationFn: async (status: string) => apiClient.post('/custom-orders/status', { customOrderId: orderId, status }),
        onSuccess: () => {
            toast.success("Workflow stage advanced!");
            queryClient.invalidateQueries({ queryKey: ['custom-order', orderId] });
        }
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Order Tracking Timeline...</div>;
    const order = qData?.data;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    const currentIdx = [
        'DRAFT',
        'QUOTATION',
        'CUSTOMER_APPROVAL',
        'MANUFACTURING',
        'READY',
        'DELIVERED'
    ].indexOf(order.status);

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="card py-3 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <ArrowLeft size={16} /> Back to List
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {order.orderNumber}
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--info-bg)', color: 'var(--info)' }}>{order.priority || 'NORMAL'} Priority</span>
                        </h2>
                        <p className="text-sm text-muted">Customer: <strong className="text-gray-800">{order.customer?.name}</strong> • Expected: {order.targetDate ? new Date(order.targetDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                </div>
                <div className="text-lg font-semibold px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 flex items-center gap-2">
                    <Clock size={20} /> {order.status.replace(/_/g, ' ')}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className="card p-5 col-span-3">
                    <h3 className="font-bold mb-4 border-b pb-2 text-primary uppercase text-sm">Order Fulfillment Workflow</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        <WorkflowStep
                            active={order.status === 'DRAFT'} completed={currentIdx >= 1}
                            title="1. CAD & Design" icon={PenTool}
                            action={() => mutateStatus.mutate('QUOTATION')} actionLabel="Submit Design/Quote"
                        />
                        <WorkflowStep
                            active={order.status === 'QUOTATION' || order.status === 'CUSTOMER_APPROVAL'} completed={currentIdx >= 3}
                            title="2. Quotation / Advance" icon={DollarSign}
                            action={() => mutateStatus.mutate('MANUFACTURING')} actionLabel="Approve & Begin Mfg"
                        />
                        <WorkflowStep
                            active={order.status === 'MANUFACTURING'} completed={currentIdx >= 4}
                            title="3. Manufacturing Log" icon={Factory}
                            action={() => mutateStatus.mutate('READY')} actionLabel="Mark QC Passed"
                        />
                        <WorkflowStep
                            active={order.status === 'READY'} completed={currentIdx >= 5}
                            title="4. Billing & POS Out" icon={PackageCheck}
                            action={() => mutateStatus.mutate('DELIVERED')} actionLabel="Log Delivery/OTP"
                        />
                    </div>
                </div>

                <div className="card p-5 bg-gradient-to-br from-indigo-50 to-white" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className="font-bold mb-4 text-indigo-900 border-b pb-2 border-indigo-100 uppercase text-sm">Customer Ledger</h3>
                    <div className="flex justify-between mb-2">
                        <span className="text-muted text-sm">Final Quotation</span>
                        <span className="font-semibold text-sm">₹{order.estimatedTotal?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-muted text-sm">Advance / Deposit</span>
                        <span className="font-semibold text-success text-sm">₹{(order.advancePaid || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="my-3 border-t border-indigo-100"></div>
                    <div className="flex justify-between text-lg items-center">
                        <span className="font-bold text-sm text-indigo-900">Balance Due</span>
                        <span className="font-bold text-danger">₹{(order.balance || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <button className="btn btn-primary mt-auto shadow-sm" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        Record Payment
                    </button>
                </div>
            </div>

            <div className="flex gap-4 flex-1 h-0 overflow-hidden">
                <div className="card flex-1 overflow-y-auto">
                    <h3 className="font-bold mb-4 border-b pb-2">Requested Specifications</h3>
                    {order.items?.length > 0 ? order.items.map((item: any) => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-lg border mb-3 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <div>
                                <h4 className="font-bold text-sm">{item.itemName} <span className="px-2 py-0.5 rounded text-xs bg-gray-200 ml-2">{item.category}</span></h4>
                                <p className="text-sm text-gray-600 mt-1">{item.description || 'No description provided'}</p>
                                <div className="flex gap-4 mt-2">
                                    <span className="text-xs font-semibold px-2 py-1 bg-white border rounded">Metal: {item.metal || 'N/A'} {item.purity || ''}</span>
                                    <span className="text-xs font-semibold px-2 py-1 bg-white border rounded">Target Wt: {item.expectedWeight || 0}g</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-white border rounded flex items-center justify-center text-gray-400">
                                <ImageIcon size={24} />
                            </div>
                        </div>
                    )) : (
                        <div className="p-6 text-center text-gray-400 italic text-sm">No specific items bound to this order yet.</div>
                    )}
                </div>

                <div className="card flex-1 overflow-y-auto">
                    <h3 className="font-bold mb-4 border-b pb-2">Attachment & CAD History</h3>
                    <div className="flex flex-col gap-3">
                        <div className="p-4 border border-dashed rounded-lg text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50 gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                            <CheckCircle size={24} className="text-gray-300" />
                            <p className="text-sm font-semibold">Upload Render, PDF Quote, or CAD</p>
                            <span className="text-xs">Drag and drop verified customer artifacts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WorkflowStep({ active, completed, title, icon: Icon, action, actionLabel }: any) {
    return (
        <div className={`min-w-[160px] flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${active ? 'border-primary shadow-sm bg-blue-50/20' : completed ? 'border-success bg-green-50/40' : 'border-gray-100 opacity-60 bg-gray-50'}`}>
            <Icon size={28} className={`mb-3 ${completed ? 'text-success' : active ? 'text-primary' : 'text-gray-400'}`} />
            <h4 className="font-bold mb-2 text-xs text-center uppercase tracking-wider">{title}</h4>
            {completed ? (
                <span className="text-xs font-bold text-success block mt-2 text-center bg-white px-2 py-1 rounded shadow-sm border border-green-100">✔ Completed</span>
            ) : active ? (
                <button onClick={action} className="btn btn-primary mt-2" style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 'bold' }}>
                    {actionLabel}
                </button>
            ) : (
                <span className="text-[10px] uppercase font-bold text-gray-400 text-center mt-2 tracking-widest">Pending</span>
            )}
        </div>
    );
}
