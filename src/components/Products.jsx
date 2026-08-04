import React, { useState } from 'react';
import { Search, Filter, Plus, List, Grid, ArrowDownToLine, Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm as useRHForm } from 'react-hook-form';
import apiClient from '../../utils/apiClient';

export default function Products() {
    const [view, setView] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', search],
        queryFn: async () => {
            const res = await apiClient.get(`/products?search=${search}`);
            return res.data;
        }
    });

    const { register, handleSubmit, reset, formState: { errors } } = useRHForm();

    const createProductMutation = useMutation({
        mutationFn: async (data) => {
            // transform weight fields
            const payload = {
                ...data,
                grossWeight: Number(data.grossWeight),
                netWeight: Number(data.netWeight),
                stoneWeight: Number(data.stoneWeight) || 0,
                wastage: Number(data.wastage) || 0,
                makingCharges: Number(data.makingCharges),
                price: Number(data.price),
                stock: Number(data.stock) || 0,
            };
            const res = await apiClient.post('/products', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setIsModalOpen(false);
            reset();
        },
        onError: (err) => {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to add product. Please check console.');
        }
    });

    const onSubmit = (data) => {
        createProductMutation.mutate(data);
    };

    return (
        <div className="flex flex-col h-full gap-4 relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Jewellery Products</h1>
                    <p className="text-muted mt-1">Live Database integration with Prisma.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <ArrowDownToLine size={18} /> Export Data
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary shadow-lg">
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="card flex items-center justify-between p-4 py-3" style={{ padding: '12px 16px' }}>
                <div className="search-bar" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', margin: 0 }}>
                    <Search size={18} className="text-muted" />
                    <input type="text" placeholder="Search product name, SKU, category..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-3 items-center">
                    <button className="btn" style={{ background: 'var(--bg-primary)', color: 'var(--secondary)' }}>
                        <Filter size={18} /> Filters
                    </button>
                    <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 8, padding: 4 }}>
                        <button onClick={() => setView('grid')} style={{ padding: 6, borderRadius: 6, border: 'none', background: view === 'grid' ? 'white' : 'transparent', color: view === 'grid' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: view === 'grid' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}>
                            <Grid size={18} />
                        </button>
                        <button onClick={() => setView('table')} style={{ padding: 6, borderRadius: 6, border: 'none', background: view === 'table' ? 'white' : 'transparent', color: view === 'table' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: view === 'table' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}>
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-primary" size={48} /></div>
            ) : view === 'grid' ? (
                <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {products.map((product) => (
                        <div key={product.id} className="card p-0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#f0f0f0' }}>
                                {product.images ? (
                                    <img src={Array.isArray(product.images) ? product.images[0] : product.images} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div className="w-full h-full flex justify-center items-center" style={{ color: '#7a869a', fontSize: '15px' }}>No Image</div>
                                )}
                                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                                    {product.status === 'Available' ? <span className="text-success">Available</span> : <span className="text-danger">{product.status}</span>}
                                </div>
                                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(57, 57, 57, 0.85)', padding: '5px 10px', borderRadius: 4, fontSize: 11, fontWeight: 'bold', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {product.sku}
                                </div>
                            </div>
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                <div>
                                    <h3 className="font-semibold text-lg" style={{ color: '#000', marginBottom: '2px' }}>{product.name}</h3>
                                    <p className="text-sm text-muted">{product.category} • {product.metal} {product.purity}</p>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Gross Wt: <strong style={{ color: '#000' }}>{product.grossWeight}g</strong></span>
                                    <span className="text-gray-500">Stock: <strong style={{ color: '#000' }}>{product.stock || 0}</strong></span>
                                </div>
                                <div className="mt-auto pt-3 border-none flex justify-between items-center bg-transparent">
                                    <span className="font-bold text-lg" style={{ color: '#d4af37' }}>₹{product.price.toLocaleString('en-IN')}</span>
                                    <button className="text-primary hover:bg-yellow-50 p-2 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <line x1="9" y1="9" x2="17" y2="9" />
                                            <line x1="9" y1="13" x2="17" y2="13" />
                                            <line x1="9" y1="17" x2="17" y2="17" />
                                            <circle cx="6" cy="9" r="1" fill="currentColor" stroke="none" />
                                            <circle cx="6" cy="13" r="1" fill="currentColor" stroke="none" />
                                            <circle cx="6" cy="17" r="1" fill="currentColor" stroke="none" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card flex-1 p-0 flex flex-col justify-center items-center text-muted">
                    <List size={48} className="mb-4 text-gray-300" />
                    <p>Live Inventory Data-Table mode logic handles here.</p>
                    <button className="btn mt-4 shadow" onClick={() => setView('grid')}>Switch back to Grid</button>
                </div>
            )}

            {/* Add Product Modal exactly matching Aesthetic */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--s-4)', position: 'relative' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>

                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--secondary)' }}>Create New Asset</h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="responsive-grid" style={{ gap: 'var(--s-3)' }}>
                            <div className="col-span-12">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Product Name</label>
                                <input type="text" {...register('name', { required: true })} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>
                            <div className="col-span-6">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Category</label>
                                <input type="text" {...register('category', { required: true })} placeholder="Ring, Necklace..." className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>
                            <div className="col-span-6">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Metal / Purity</label>
                                <div className="flex gap-2">
                                    <input type="text" {...register('metal', { required: true })} placeholder="Gold" className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                                    <input type="text" {...register('purity', { required: true })} placeholder="22K" className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Gross Weight (g)</label>
                                <input type="number" step="0.01" {...register('grossWeight', { required: true })} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>
                            <div className="col-span-4">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Net Weight (g)</label>
                                <input type="number" step="0.01" {...register('netWeight', { required: true })} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>
                            <div className="col-span-4">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Wastage (%)</label>
                                <input type="number" step="0.01" {...register('wastage')} defaultValue={0} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>
                            <div className="col-span-6">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Making Charges (₹)</label>
                                <input type="number" {...register('makingCharges', { required: true })} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>
                            <div className="col-span-6">
                                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--secondary)' }}>Total Price (₹)</label>
                                <input type="number" {...register('price', { required: true })} className="search-input" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: 8, width: '100%' }} />
                            </div>

                            <div className="col-span-12 flex justify-end gap-3 mt-4">
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-primary)' }}>Cancel</button>
                                <button type="submit" disabled={createProductMutation.isPending} className="btn btn-primary">
                                    {createProductMutation.isPending ? <Loader2 className="animate-spin" /> : 'Save PostgreSQL Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
