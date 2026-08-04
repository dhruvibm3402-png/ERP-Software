import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const vendorSchema = z.object({
    vendorName: z.string().min(2, 'Name is required'),
    mobile: z.string().min(10, 'Valid mobile required'),
    vendorType: z.string().min(1, 'Vendor Type is required'),
    companyName: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    msmeNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export default function VendorForm({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm<VendorFormValues>({
        resolver: zodResolver(vendorSchema),
        defaultValues: {
            vendorName: '', mobile: '', vendorType: '', companyName: '', email: '',
            gstNumber: '', panNumber: '', msmeNumber: '', paymentTerms: '', address: '',
            city: '', state: '', country: 'India', pincode: '', bankName: '', accountHolderName: '',
            accountNumber: '', ifscCode: '', notes: '', status: 'ACTIVE'
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                email: initialData.email || '',
                address: initialData.address || '',
                companyName: initialData.companyName || '',
                gstNumber: initialData.gstNumber || '',
                panNumber: initialData.panNumber || '',
                msmeNumber: initialData.msmeNumber || '',
                paymentTerms: initialData.paymentTerms || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
                bankName: initialData.bankName || '',
                accountHolderName: initialData.accountHolderName || '',
                accountNumber: initialData.accountNumber || '',
                ifscCode: initialData.ifscCode || '',
                notes: initialData.notes || '',
                status: initialData.status || 'ACTIVE',
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
        mutationFn: async (data: VendorFormValues) => {
            if (initialData?.id) {
                return apiClient.put(`/vendors/${initialData.id}`, data);
            } else {
                return apiClient.post('/vendors', data);
            }
        },
        onSuccess: () => {
            toast.success(initialData ? 'Vendor updated successfully' : 'Vendor added successfully');
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            reset();
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save vendor data');
        }
    });

    const onSubmit = (data: VendorFormValues) => {
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
                    {initialData ? 'Edit Vendor' : 'Create New Vendor'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="responsive-grid" style={{ gap: 'var(--s-3)' }}>
                    {/* Row 1 */}
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Vendor Name *</label>
                        <input type="text" autoFocus {...register('vendorName')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                        {errors.vendorName && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.vendorName.message as string}</span>}
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Company Name</label>
                        <input type="text" {...register('companyName')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    {/* Row 2 */}
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Mobile Number *</label>
                        <input type="text" {...register('mobile')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                        {errors.mobile && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.mobile.message as string}</span>}
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Email</label>
                        <input type="email" {...register('email')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                        {errors.email && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.email.message as string}</span>}
                    </div>

                    {/* Row 3 */}
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Vendor Type *</label>
                        <select {...register('vendorType')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }}>
                            <option value="">Select Type</option>
                            <option value="GOLD_SUPPLIER">Gold Supplier</option>
                            <option value="SILVER_SUPPLIER">Silver Supplier</option>
                            <option value="DIAMOND_SUPPLIER">Diamond Supplier</option>
                            <option value="JEWELLERY_MANUFACTURER">Jewellery Manufacturer</option>
                            <option value="PACKAGING_SUPPLIER">Packaging Supplier</option>
                            <option value="ACCESSORIES_SUPPLIER">Accessories Supplier</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {errors.vendorType && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.vendorType.message as string}</span>}
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Payment Terms</label>
                        <select {...register('paymentTerms')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }}>
                            <option value="">Select Terms</option>
                            <option value="IMMEDIATE">Immediate</option>
                            <option value="NET_30">Net 30 Days</option>
                            <option value="NET_60">Net 60 Days</option>
                            <option value="COD">Cash on Delivery</option>
                            <option value="ADVANCE">Advance Required</option>
                        </select>
                    </div>

                    {/* Row 4 */}
                    <div className="col-span-4">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>GST Number</label>
                        <input type="text" {...register('gstNumber')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%', textTransform: 'uppercase' }} />
                    </div>
                    <div className="col-span-4">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>PAN Number</label>
                        <input type="text" {...register('panNumber')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%', textTransform: 'uppercase' }} />
                    </div>
                    <div className="col-span-4">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>MSME Number</label>
                        <input type="text" {...register('msmeNumber')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%', textTransform: 'uppercase' }} />
                    </div>

                    {/* Address Section */}
                    <div className="col-span-12 mt-2">
                        <h3 className="text-sm font-bold border-b pb-1 mb-2" style={{ color: 'var(--secondary)', borderColor: 'var(--border-color)' }}>Address Information</h3>
                    </div>

                    <div className="col-span-12">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Full Address</label>
                        <input type="text" {...register('address')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    <div className="col-span-4">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>City</label>
                        <input type="text" {...register('city')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>
                    <div className="col-span-4">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>State</label>
                        <input type="text" {...register('state')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>
                    <div className="col-span-4">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Pincode</label>
                        <input type="text" {...register('pincode')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>

                    {/* Bank Section */}
                    <div className="col-span-12 mt-2">
                        <h3 className="text-sm font-bold border-b pb-1 mb-2" style={{ color: 'var(--secondary)', borderColor: 'var(--border-color)' }}>Bank Information</h3>
                    </div>

                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Bank Name</label>
                        <input type="text" {...register('bankName')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Account Name</label>
                        <input type="text" {...register('accountHolderName')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Account Number</label>
                        <input type="text" {...register('accountNumber')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                    </div>
                    <div className="col-span-6">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>IFSC Code</label>
                        <input type="text" {...register('ifscCode')} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%', textTransform: 'uppercase' }} />
                    </div>

                    <div className="col-span-12 mt-2">
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Notes</label>
                        <textarea {...register('notes')} rows={3} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%', resize: 'none' }}></textarea>
                    </div>

                    <div className="col-span-12 flex justify-end gap-3 mt-4">
                        <button type="button" className="btn" onClick={() => { if (!mutation.isPending) onClose(); }} style={{ background: 'var(--bg-primary)' }} disabled={mutation.isPending}>Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : (initialData ? 'Update Vendor' : 'Save Vendor')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
