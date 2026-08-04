'use client';
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../../utils/apiClient';

const purchaseItemSchema = z.object({
    productId: z.string().min(1, 'Required'),
    quantity: z.preprocess(v => Number(v) || 0, z.number().min(1)),
    grossWeight: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    netWeight: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    stoneWeight: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    rate: z.preprocess(v => Number(v) || 0, z.number().min(0)),
    makingCharges: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    wastage: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    gst: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    discount: z.preprocess(v => Number(v) || 0, z.number().default(0)),
    amount: z.preprocess(v => Number(v) || 0, z.number().min(0)),
    remarks: z.string().optional()
});

const purchaseSchema = z.object({
    vendorId: z.string().min(1, 'Vendor Required'),
    poDate: z.string().optional(),
    expectedDeliveryDate: z.string().optional().nullable(),
    branchId: z.string().optional().nullable(),
    subTotal: z.number().default(0),
    makingChargesTotal: z.number().default(0),
    wastageTotal: z.number().default(0),
    discountTotal: z.number().default(0),
    gstTotal: z.number().default(0),
    grandTotal: z.number().default(0),
    roundOff: z.number().default(0),
    netPayable: z.number().default(0),
    remarks: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'Add at least one item')
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function PurchaseForm({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const queryClient = useQueryClient();

    // Fetch Vendors & Products
    const { data: vendorsData } = useQuery({ queryKey: ['vendors', 'all'], queryFn: () => apiClient.get('/vendors?limit=100').then(res => res.data.data) });
    const { data: productsData } = useQuery({ queryKey: ['products', 'all'], queryFn: () => apiClient.get('/products?limit=100').then(res => res.data) });
    const { data: branchesData } = useQuery({ queryKey: ['branches', 'all'], queryFn: () => apiClient.get('/branches?limit=100').then(res => res.data) });

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: initialData || {
            vendorId: '', poDate: new Date().toISOString().split('T')[0], branchId: '', items: [],
            subTotal: 0, makingChargesTotal: 0, wastageTotal: 0, discountTotal: 0, gstTotal: 0, grandTotal: 0, roundOff: 0, netPayable: 0
        }
    });

    const { fields, append, remove, insert } = useFieldArray({ control, name: 'items' });

    const watchItems = watch('items') || [];

    // Trigger calculation updates when items change
    useEffect(() => {
        let subTotal = 0;
        let makingChargesTotal = 0;
        let wastageTotal = 0;
        let gstTotal = 0;
        let discountTotal = 0;

        watchItems.forEach((item, index) => {
            const qty = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const making = Number(item.makingCharges) || 0;
            const discount = Number(item.discount) || 0;

            const prod = productsData?.find((p: any) => p.id === item.productId);
            const wastagePercent = Number(item.wastage) || 0;
            const gstPercent = Number(item.gst) || 0;

            // Basic amount calculation
            const baseAmount = (qty * rate) + making;
            const wastageAmount = (baseAmount * wastagePercent) / 100;
            let itemTotalBeforeGst = baseAmount + wastageAmount - discount;
            itemTotalBeforeGst = Math.max(itemTotalBeforeGst, 0);

            const gstAmount = (itemTotalBeforeGst * gstPercent) / 100;
            const lineAmount = itemTotalBeforeGst + gstAmount;

            // We set the calculated amount silently without causing infinite re-renders. 
            // Better handled via onChange or blur but keeping it reactive is smooth for grids.
            if (item.amount !== parseFloat(lineAmount.toFixed(2))) {
                setValue(`items.${index}.amount`, parseFloat(lineAmount.toFixed(2)));
            }

            subTotal += (qty * rate);
            makingChargesTotal += making;
            wastageTotal += wastageAmount;
            gstTotal += gstAmount;
            discountTotal += discount;
        });

        const grand = subTotal + makingChargesTotal + wastageTotal + gstTotal - discountTotal;
        const rounded = Math.round(grand);
        const roundOff = rounded - grand;

        setValue('subTotal', parseFloat(subTotal.toFixed(2)));
        setValue('makingChargesTotal', parseFloat(makingChargesTotal.toFixed(2)));
        setValue('wastageTotal', parseFloat(wastageTotal.toFixed(2)));
        setValue('gstTotal', parseFloat(gstTotal.toFixed(2)));
        setValue('discountTotal', parseFloat(discountTotal.toFixed(2)));
        setValue('grandTotal', parseFloat(grand.toFixed(2)));
        setValue('roundOff', parseFloat(roundOff.toFixed(2)));
        setValue('netPayable', rounded);
    }, [JSON.stringify(watchItems), productsData, setValue]);

    const handleProductSelect = (index: number, productId: string) => {
        const product = productsData?.find((p: any) => p.id === productId);
        if (product) {
            setValue(`items.${index}.rate`, product.price || 0);
            setValue(`items.${index}.gst`, product.gst || 3);
            setValue(`items.${index}.grossWeight`, product.grossWeight || 0);
            setValue(`items.${index}.netWeight`, product.netWeight || 0);
            setValue(`items.${index}.stoneWeight`, product.stoneWeight || 0);
            setValue(`items.${index}.makingCharges`, product.makingCharges || 0);
            setValue(`items.${index}.wastage`, product.wastage || 0);
        }
    };

    const mutation = useMutation({
        mutationFn: (data: PurchaseFormValues) => {
            if (initialData?.id) return apiClient.put(`/purchases/${initialData.id}`, data);
            return apiClient.post('/purchases', data);
        },
        onSuccess: () => {
            toast.success('Purchase Order saved');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            onClose();
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || err.response?.data?.error || 'Error saving PO';
            toast.error(message);
        }
    });

    const watchTotals = watch(['subTotal', 'gstTotal', 'discountTotal', 'roundOff', 'netPayable']);

    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><ArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-xl font-bold text-secondary">{initialData ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
                        <p className="text-sm text-muted">Provide vendor details and add inventory items</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
                <form id="po-form" onSubmit={handleSubmit((d) => mutation.mutate(d as any))} className="max-w-7xl mx-auto space-y-6">
                    {/* Header Info */}
                    <div className="card p-5">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">Vendor & Delivery Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                                <select {...register('vendorId')} className="search-input w-full p-2 border rounded-lg bg-white">
                                    <option value="">Select Vendor...</option>
                                    {vendorsData?.map((v: any) => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                                </select>
                                {errors.vendorId && <span className="text-xs text-red-500">{errors.vendorId.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
                                <input type="date" {...register('poDate')} className="search-input w-full p-2 border rounded-lg bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                                <input type="date" {...register('expectedDeliveryDate')} className="search-input w-full p-2 border rounded-lg bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                <select {...register('branchId')} className="search-input w-full p-2 border rounded-lg bg-white">
                                    <option value="">Select Branch...</option>
                                    {branchesData?.data?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="card p-0 overflow-hidden border border-gray-200">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Purchase Items</h3>
                            <button type="button" onClick={() => append({ productId: '', quantity: 1, rate: 0, amount: 0, gst: 0 })} className="btn bg-white border text-primary text-sm shadow-sm">
                                <Plus size={16} /> Add Row
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-100/50">
                                    <tr className="text-muted tracking-wider text-xs uppercase border-b">
                                        <th className="p-3 font-semibold w-64 min-w-[200px]">Product</th>
                                        <th className="p-3 font-semibold w-24">Category</th>
                                        <th className="p-3 font-semibold w-24">HSN</th>
                                        <th className="p-3 font-semibold w-20">Qty</th>
                                        <th className="p-3 font-semibold w-24">Net Wt.</th>
                                        <th className="p-3 font-semibold w-24">Rate</th>
                                        <th className="p-3 font-semibold w-24">Mak/Chg</th>
                                        <th className="p-3 font-semibold w-20">Wastage%</th>
                                        <th className="p-3 font-semibold w-20">Discount</th>
                                        <th className="p-3 font-semibold w-20">GST %</th>
                                        <th className="p-3 font-semibold w-32">Amount</th>
                                        <th className="p-3 font-semibold w-16 text-center">Act</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.length === 0 && (
                                        <tr><td colSpan={12} className="p-8 text-center text-gray-400">No items added to this PO yet. Click "Add Row".</td></tr>
                                    )}
                                    {fields.map((field, idx) => {
                                        const pId = watch(`items.${idx}.productId`);
                                        const prod = productsData?.find((p: any) => p.id === pId);
                                        return (
                                            <tr key={field.id} className="border-b bg-white hover:bg-gray-50/20 group">
                                                <td className="p-2">
                                                    <select {...register(`items.${idx}.productId`)} onChange={(e) => { register(`items.${idx}.productId`).onChange(e); handleProductSelect(idx, e.target.value); }} className="w-full p-1.5 border rounded text-sm bg-gray-50">
                                                        <option value="">Select...</option>
                                                        {productsData?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-2 text-gray-600 truncate max-w-[100px]" title={prod?.category}>{prod?.category || '-'}</td>
                                                <td className="p-2 text-gray-600">{prod?.hsnCode || '-'}</td>
                                                <td className="p-2"><input type="number" min={1} {...register(`items.${idx}.quantity`)} className="w-full p-1.5 border rounded text-sm text-center" /></td>
                                                <td className="p-2"><input type="number" step="0.01" {...register(`items.${idx}.netWeight`)} className="w-full p-1.5 border rounded text-sm text-right" /></td>
                                                <td className="p-2"><input type="number" step="0.01" {...register(`items.${idx}.rate`)} className="w-full p-1.5 border rounded text-sm text-right" /></td>
                                                <td className="p-2"><input type="number" step="0.01" {...register(`items.${idx}.makingCharges`)} className="w-full p-1.5 border rounded text-sm text-right" /></td>
                                                <td className="p-2"><input type="number" step="0.01" {...register(`items.${idx}.wastage`)} className="w-full p-1.5 border rounded text-sm text-right" /></td>
                                                <td className="p-2"><input type="number" step="0.01" {...register(`items.${idx}.discount`)} className="w-full p-1.5 border rounded text-sm text-right" /></td>
                                                <td className="p-2"><input type="number" step="0.01" {...register(`items.${idx}.gst`)} className="w-full p-1.5 border rounded text-sm text-right" /></td>
                                                <td className="p-2"><input type="number" readOnly {...register(`items.${idx}.amount`)} className="w-full p-1.5 bg-gray-100 border-transparent rounded text-sm font-bold text-right" /></td>
                                                <td className="p-2">
                                                    <div className="flex gap-1 justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={() => insert(idx + 1, watchItems[idx])} className="p-1 hover:bg-blue-50 text-blue-600 rounded"><Copy size={14} /></button>
                                                        <button type="button" onClick={() => remove(idx)} className="p-1 hover:bg-red-50 text-red-600 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Calculations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-5">
                            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Remarks / Instructions</h3>
                            <textarea {...register('remarks')} rows={4} className="w-full p-3 border rounded-lg bg-gray-50 text-sm resize-none"></textarea>
                        </div>
                        <div className="card p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-semibold">₹{watchTotals[0] || 0}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Discount</span><span className="font-semibold text-green-600">-₹{watchTotals[2] || 0}</span></div>
                                <div className="flex justify-between text-gray-600"><span>GST Tax</span><span className="font-semibold">₹{watchTotals[1] || 0}</span></div>
                                <div className="flex justify-between text-gray-500 text-xs border-t pt-2"><span>Round Off</span><span>₹{watchTotals[3] || 0}</span></div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2">
                                    <span>Net Payable</span>
                                    <span>₹{watchTotals[4] || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0">
                <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent">Cancel</button>
                <button type="submit" form="po-form" disabled={mutation.isPending} className="btn btn-primary px-8">
                    {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Purchase Order
                </button>
            </div>
        </div>
    );
}
