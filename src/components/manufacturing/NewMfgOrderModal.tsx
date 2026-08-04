'use client';
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewMfgOrderModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            expectedDate: '',
            priority: 'NORMAL',
            designNumber: '',
            notes: '',
            items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 0, netWeight: 0, stoneQuantity: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const mutation = useMutation({
        mutationFn: (data: any) => {
            return apiClient.post('/manufacturing', {
                ...data,
                items: data.items.map((i: any) => ({
                    ...i,
                    grossWeight: Number(i.grossWeight),
                    netWeight: Number(i.netWeight),
                    stoneQuantity: Number(i.stoneQuantity)
                }))
            });
        },
        onSuccess: () => {
            toast.success('Production Order Draft Generated!');
            queryClient.invalidateQueries({ queryKey: ['manufacturing'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Error creating order');
        }
    });

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }} onClick={(e) => { if (e.target === e.currentTarget && !mutation.isPending) onClose(); }}>
            <div className="card" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--primary)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Create Manufacturing Order</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h3 className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 'bold' }}>1. Job Specs & Planning</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Design / Catalogue #</label>
                                <input {...register('designNumber', { required: 'Design required' })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="DSGN-001" />
                                {errors.designNumber && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.designNumber.message as string}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Priority</label>
                                <select {...register('priority')} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}>
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Target Completion</label>
                                <input type="date" {...register('expectedDate', { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>2. Composition Targets</h3>
                            <button type="button" onClick={() => append({ metalType: 'GOLD', purity: '22K', grossWeight: 0, netWeight: 0, stoneQuantity: 0 })} className="text-primary text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add Component</button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {fields.map((field, index) => (
                                <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr auto', gap: '8px', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Material</label>
                                        <select {...register(`items.${index}.metalType` as const)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                                            <option value="GOLD">GOLD</option>
                                            <option value="SILVER">SILVER</option>
                                            <option value="DIAMOND">DIAMOND / STONE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Purity</label>
                                        <input {...register(`items.${index}.purity` as const)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }} placeholder="e.g. 22K" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gross Wt(g)</label>
                                        <input type="number" step="0.01" {...register(`items.${index}.grossWeight` as const)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Net Wt(g)</label>
                                        <input type="number" step="0.01" {...register(`items.${index}.netWeight` as const)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Stones</label>
                                        <input type="number" {...register(`items.${index}.stoneQuantity` as const)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }} />
                                    </div>
                                    {index > 0 && (
                                        <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Production Notes / Instruction</label>
                            <textarea {...register('notes')} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }} rows={2} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: 'white', border: '1px solid var(--border-color)' }}>Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ minWidth: '180px' }}>
                            {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Create Manufacturing Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
