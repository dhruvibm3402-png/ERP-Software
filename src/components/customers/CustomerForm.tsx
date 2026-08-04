import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    mobile: z.string().min(10, "Valid mobile required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    aadhaar: z.string().optional(),
    pan: z.string().optional(),
    birthday: z.string().optional(),
    anniversary: z.string().optional(),
    notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof schema>;

export default function CustomerForm({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm<CustomerFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '', mobile: '', email: '', address: '', gstNumber: '',
            aadhaar: '', pan: '', birthday: '', anniversary: '', notes: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                email: initialData.email || '',
                address: initialData.address || '',
                gstNumber: initialData.gstNumber || '',
                aadhaar: initialData.aadhaar || '',
                pan: initialData.pan || '',
                birthday: initialData.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : '',
                anniversary: initialData.anniversary ? new Date(initialData.anniversary).toISOString().split('T')[0] : '',
                notes: initialData.notes || '',
            });
        }
    }, [initialData, reset, setFocus]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const mutation = useMutation({
        mutationFn: async (data: CustomerFormValues) => {
            if (initialData?.id) {
                return apiClient.put(`/customers/${initialData.id}`, data);
            } else {
                return apiClient.post('/customers', data);
            }
        },
        onSuccess: () => {
            toast.success(initialData ? 'Customer updated successfully' : 'Customer added successfully');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            reset();
            onClose();
        },
        onError: () => {
            toast.error('Failed to save customer data');
        }
    });

    const onSubmit = (data: CustomerFormValues) => {
        mutation.mutate(data);
    };

    return (
        <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !mutation.isPending) {
                    onClose();
                }
            }}
        >
            <div className="card" style={{ width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--s-4)', position: 'relative' }}>
                <button
                    onClick={() => { if (!mutation.isPending) onClose(); }}
                    style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    disabled={mutation.isPending}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--secondary)' }}>
                    {initialData ? 'Edit Customer' : 'Create New Customer'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="responsive-grid" style={{ gap: 'var(--s-3)' }}>
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Customer Name *</label>
                        <input type="text" autoFocus {...register('name')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                        {errors.name && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.name.message}</span>}
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Mobile Number *</label>
                        <input type="text" {...register('mobile')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                        {errors.mobile && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.mobile.message}</span>}
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Email</label>
                        <input type="email" {...register('email')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                        {errors.email && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.email.message}</span>}
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>GST Number</label>
                        <input type="text" {...register('gstNumber')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-12">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Address</label>
                        <input type="text" {...register('address')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Aadhaar Number</label>
                        <input type="text" {...register('aadhaar')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>PAN Number</label>
                        <input type="text" {...register('pan')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Birthday</label>
                        <input type="date" {...register('birthday')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Anniversary</label>
                        <input type="date" {...register('anniversary')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-12">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Notes</label>
                        <textarea {...register('notes')} rows={3} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%', resize: 'none' }}></textarea>
                    </div>

                    <div className="col-span-12 flex justify-end gap-3 mt-4">
                        <button type="button" className="btn" onClick={() => { if (!mutation.isPending) onClose(); }} style={{ background: 'var(--bg-primary)' }} disabled={mutation.isPending}>Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save PostgreSQL Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
