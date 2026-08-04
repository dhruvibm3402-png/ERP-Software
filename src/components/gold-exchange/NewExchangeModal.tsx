'use client';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { X, Save, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewExchangeModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();

    const { data: customers } = useQuery({ queryKey: ['customers', 'all'], queryFn: () => apiClient.get('/customers').then(res => res.data.data) });

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            customerId: '',
            remarks: '',
            items: [{ itemName: '', category: 'GOLD', metalType: '22K', grossWeight: 0, netWeight: 0, purity: '91.6' }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    const mutation = useMutation({
        mutationFn: (data: any) => apiClient.post('/gold-exchange', {
            ...data,
            items: data.items.map((i: any) => ({ ...i, grossWeight: Number(i.grossWeight), netWeight: Number(i.netWeight) }))
        }),
        onSuccess: () => {
            toast.success('Gold Exchange Draft created successfully!');
            queryClient.invalidateQueries({ queryKey: ['gold-exchange-list'] });
            queryClient.invalidateQueries({ queryKey: ['gold-exchange', 'dashboard'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Error processing request');
        }
    });

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(30,30,30,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 100,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !mutation.isPending) {
                    onClose();
                }
            }}
        >
            <div className="card" style={{ width: '90%', maxWidth: 850, maxHeight: '90vh', overflowY: 'auto', padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--primary)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Process New Gold Exchange</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                    ><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* CUSTOMER SECTION */}
                    <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h3 className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 'bold' }}>1. Customer Selection</h3>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Select Customer *</label>
                            <select
                                {...register('customerId', { required: 'Customer is required' })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                            >
                                <option value="">-- Choose existing customer --</option>
                                {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                            </select>
                            {errors.customerId && <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.customerId.message as string}</span>}
                        </div>
                    </div>

                    {/* ITEMS SECTION */}
                    <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>2. Old Jewellery Details</h3>
                            <button
                                type="button"
                                onClick={() => append({ itemName: '', category: 'GOLD', metalType: '22K', grossWeight: 0, netWeight: 0, purity: '' })}
                                className="btn"
                                style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--warning-bg)', color: 'var(--warning)', border: 'none' }}
                            >
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {fields.map((field, index) => (
                                <div key={field.id} style={{ display: 'flex', gap: '12px', padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div className="grid grid-cols-2" style={{ flex: 1, gap: '12px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-muted)' }}>Item Name *</label>
                                            <input {...register(`items.${index}.itemName` as const, { required: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="e.g. Old Gold Chain" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-muted)' }}>Category</label>
                                            <select {...register(`items.${index}.category` as const)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                                <option value="GOLD">Gold</option>
                                                <option value="SILVER">Silver</option>
                                                <option value="PLATINUM">Platinum</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-muted)' }}>Karat/Purity</label>
                                            <input {...register(`items.${index}.metalType` as const)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} placeholder="22K" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-muted)' }}>Gross Wt (g) *</label>
                                            <input type="number" step="0.01" {...register(`items.${index}.grossWeight` as const, { required: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-muted)' }}>Net Wt (g) *</label>
                                            <input type="number" step="0.01" {...register(`items.${index}.netWeight` as const, { required: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                        </div>
                                    </div>
                                    {fields.length > 1 && (
                                        <button type="button" onClick={() => remove(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px' }}><Trash2 size={16} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OVERVIEW */}
                    <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Remarks / Notes</label>
                        <textarea {...register('remarks')} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Provide any visual inspection notes..." />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ minWidth: '220px' }}>
                            {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <>Generate Exchange Draft <ArrowRight size={18} /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
