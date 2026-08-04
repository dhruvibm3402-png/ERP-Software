'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StockActionModal({ type, onClose }: { type: string, onClose: () => void }) {
    const queryClient = useQueryClient();
    const isOut = type === 'STOCK_OUT';

    const { data: productsData } = useQuery({ queryKey: ['products', 'all'], queryFn: () => apiClient.get('/products?limit=500').then(res => res.data) });
    const { data: branchesData } = useQuery({ queryKey: ['branches', 'all'], queryFn: () => apiClient.get('/branches?limit=100').then(res => res.data) });

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: { productId: '', branchId: '', quantity: 1, weight: 0, reason: '', referenceId: '' }
    });

    const mutation = useMutation({
        mutationFn: (data: any) => apiClient.post(`/inventory/${isOut ? 'stock-out' : 'stock-in'}`, {
            ...data,
            quantity: Number(data.quantity),
            weight: Number(data.weight),
            grossWeight: Number(data.weight), // Simplified for modal
            netWeight: Number(data.weight),
        }),
        onSuccess: () => {
            toast.success(isOut ? 'Stock deducted successfully' : 'Stock added successfully');
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Error processing request');
        }
    });

    const pId = watch('productId');
    const selectedProd = productsData?.find((p: any) => p.id === pId);

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className={`p-4 flex justify-between items-center text-white ${isOut ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-700'}`}>
                    <h2 className="text-lg font-bold">{isOut ? 'Stock Out (Deduct)' : 'Stock In (Add)'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-5">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Product *</label>
                        <select {...register('productId', { required: 'Product is required' })} className="search-input w-full p-2.5 border rounded-lg bg-gray-50 text-sm">
                            <option value="">Select a product...</option>
                            {productsData?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                        {errors.productId && <span className="text-xs text-red-500">{errors.productId.message as string}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
                            <input type="number" min={1} {...register('quantity', { required: true, min: 1 })} className="search-input w-full p-2.5 border rounded-lg bg-gray-50 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Net Weight (g)</label>
                            <input type="number" step="0.01" {...register('weight')} className="search-input w-full p-2.5 border rounded-lg bg-gray-50 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Branch Location</label>
                        <select {...register('branchId')} className="search-input w-full p-2.5 border rounded-lg bg-gray-50 text-sm">
                            <option value="">Main Branch</option>
                            {branchesData?.data?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason / Type</label>
                            <select {...register('reason')} className="search-input w-full p-2.5 border rounded-lg bg-gray-50 text-sm">
                                {isOut ? (
                                    <>
                                        <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
                                        <option value="DAMAGE_LOSS">Damage / Loss</option>
                                        <option value="MANUFACTURING_ISSUE">Manufacturing Issue</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="MANUAL_ENTRY">Manual Entry</option>
                                        <option value="MANUFACTURING_RETURN">Manufacturing Return</option>
                                        <option value="AUDIT_CORRECTION">Audit Correction</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Reference ID</label>
                            <input type="text" placeholder="Optional..." {...register('referenceId')} className="search-input w-full p-2.5 border rounded-lg bg-gray-50 text-sm" />
                        </div>
                    </div>

                    {isOut && selectedProd && (
                        <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-100">
                            <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            <div className="text-xs text-amber-800">
                                <strong>Warning:</strong> You are deducting manual stock. Ensure this matches physical inventory. Current overall stock: {selectedProd.stock} units.
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 px-6">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className={`btn px-6 text-white ${isOut ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                            {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Confirm {isOut ? 'Deduction' : 'Addition'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
