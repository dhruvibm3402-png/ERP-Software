'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Search, UserPlus, ScanLine, Tag, Trash2, Printer, CheckCircle, Save, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function POSInterface() {
    const queryClient = useQueryClient();

    // Customer Selection
    const [customerId, setCustomerId] = useState('');
    const { data: customers } = useQuery({ queryKey: ['customers', 'all'], queryFn: () => apiClient.get('/customers').then(res => res.data.data) });

    // Product Search
    const [productSearch, setProductSearch] = useState('');
    const { data: productsData } = useQuery({ queryKey: ['products', productSearch], queryFn: () => apiClient.get(`/products?search=${productSearch}`).then(res => res.data.data) });

    // CART STATE
    const [cart, setCart] = useState<any[]>([]);

    // Financial State mapping closely to request
    const [discountOverall, setDiscountOverall] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [oldGoldValue, setOldGoldValue] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const addToCart = (product: any) => {
        const exist = cart.find(i => i.productId === product.id);
        if (exist) {
            setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                category: product.category,
                quantity: 1,
                grossWeight: product.grossWeight || 0,
                netWeight: product.netWeight || 0,
                stoneWeight: product.stoneWeight || 0,
                metalRate: product.price || 0,
                makingCharge: product.makingCharges || 0,
                wastageCharge: product.wastage || 0,
                stoneCharge: 0,
                discount: 0,
                gstRate: product.gst || 3,
            }]);
        }
        setProductSearch('');
    };

    const removeFromCart = (pId: string) => setCart(cart.filter(i => i.productId !== pId));

    // Calculate totals dynamically
    let subTotal = 0;
    let totalMaking = 0;
    let totalWastage = 0;
    let gstTotal = 0;

    const cartCalculated = cart.map(item => {
        // Simple jewellery calculation baseline
        const metalValue = (item.metalRate * item.netWeight) * item.quantity;
        const makingValue = item.makingCharge * item.quantity;
        const wastageValue = (metalValue * (item.wastageCharge / 100)) || 0;
        const baseItemTotal = metalValue + makingValue + wastageValue + item.stoneCharge - item.discount;

        const gst = (baseItemTotal * item.gstRate) / 100;
        const lineTotal = baseItemTotal + gst;

        subTotal += (metalValue * item.quantity);
        totalMaking += makingValue;
        totalWastage += wastageValue;
        gstTotal += gst;

        return { ...item, amount: parseFloat(lineTotal.toFixed(2)) };
    });

    const sumDiscount = cart.reduce((acc, i) => acc + i.discount, 0) + discountOverall;
    const baseGrand = cartCalculated.reduce((acc, i) => acc + i.amount, 0) - discountOverall - oldGoldValue;
    const roundedGrand = Math.round(baseGrand);
    const roundOff = roundedGrand - baseGrand;

    const checkoutMutation = useMutation({
        mutationFn: () => {
            if (cart.length === 0) throw new Error("Cart is empty");
            return apiClient.post('/sales', {
                customerId: customerId || null,
                status: 'COMPLETED',
                subTotal: parseFloat(subTotal.toFixed(2)),
                totalMaking: parseFloat(totalMaking.toFixed(2)),
                totalWastage: parseFloat(totalWastage.toFixed(2)),
                discount: sumDiscount,
                gstTotal: parseFloat(gstTotal.toFixed(2)),
                oldGoldValue: parseFloat(oldGoldValue.toFixed(2)),
                roundOff: parseFloat(roundOff.toFixed(2)),
                grandTotal: roundedGrand,
                paidAmount: paidAmount || roundedGrand,
                items: cartCalculated,
                payments: [{ amount: paidAmount || roundedGrand, method: paymentMethod }]
            });
        },
        onSuccess: (res) => {
            toast.success(`Invoice ${res.data.data.invoiceNumber} generated!`);
            setCart([]);
            setCustomerId('');
            setDiscountOverall(0);
            setOldGoldValue(0);
            setPaidAmount(0);
            queryClient.invalidateQueries({ queryKey: ['inventory'] }); // refresh stock
        },
        onError: (e: any) => toast.error(e.message || "Failed to checkout")
    });

    return (
        <div className="flex h-full gap-4 animate-in fade-in bg-gray-50/50 rounded-xl">
            {/* LEFT: Customer Selection */}
            <div className="w-1/4 flex flex-col gap-4">
                <div className="card p-4 bg-white border border-gray-100 shadow-sm h-full flex flex-col">
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4 border-b flex items-center justify-between pb-2">
                        Customer <UserPlus size={16} className="text-primary cursor-pointer" />
                    </h3>
                    <div className="search-bar border rounded-lg focus-within:border-primary mb-3">
                        <select
                            className="bg-transparent border-none w-full p-2 outline-none text-sm text-gray-800"
                            value={customerId}
                            onChange={e => setCustomerId(e.target.value)}
                        >
                            <option value="">Walk-in Customer (Unknown)</option>
                            {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                        </select>
                    </div>

                    {customerId ? (
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-2 space-y-2">
                            {customers?.filter((c: any) => c.id === customerId).map((c: any) => (
                                <React.Fragment key={c.id}>
                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Points</span><strong className="text-blue-700">{c.loyaltyPoints}</strong></div>
                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Last Visit</span><strong>{new Date(c.updatedAt).toLocaleDateString()}</strong></div>
                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">City</span><strong>{c.city || 'N/A'}</strong></div>
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className="opacity-50 text-center py-10 text-xs text-gray-500 border-2 border-dashed rounded-xl mt-2">
                            Select a customer to view loyalty points and history.
                        </div>
                    )}

                    <div className="mt-auto pt-4">
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Old Gold Exchange</h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="₹ Value..."
                                className="border w-full p-2 rounded text-sm outline-none focus:border-amber-500 bg-amber-50/30"
                                value={oldGoldValue}
                                onChange={e => setOldGoldValue(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CENTER: Product Search & Grid */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="card p-0 h-full flex flex-col bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex gap-2">
                        <div className="search-bar flex-1 border border-primary/30 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/20 flex items-center px-3 gap-2">
                            <ScanLine size={18} className="text-primary font-bold animate-pulse" />
                            <input
                                type="text"
                                placeholder="Scan Barcode or Search Products..."
                                className="bg-transparent border-none outline-none py-2.5 w-full text-base font-semibold text-gray-800"
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 bg-gray-50/50">
                        {productsData?.map((p: any) => (
                            <div key={p.id} onClick={() => addToCart(p)} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 group flex flex-col">
                                <div className="h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                    [Image]
                                </div>
                                <div className="p-3 text-sm flex-1 flex flex-col">
                                    <div className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{p.name}</div>
                                    <div className="text-xs text-gray-500 flex justify-between mt-1"><span>{p.category}</span> <span>{p.netWeight}g</span></div>
                                    <div className="mt-auto pt-2 flex justify-between items-end border-t border-gray-50 mt-2">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {p.stock} in stock
                                        </span>
                                        <span className="font-bold text-secondary">₹{p.price?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart & Checkout */}
            <div className="w-[420px] flex flex-col gap-4">
                <div className="card p-0 flex flex-col h-full bg-white border border-gray-100 shadow-lg overflow-hidden relative">
                    <div className="p-4 border-b bg-gray-900 text-white flex justify-between items-center">
                        <h3 className="font-bold tracking-tight">Shopping Cart</h3>
                        <div className="px-2 py-0.5 bg-white/20 rounded font-mono text-xs">{cart.length} items</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0 border-b">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 p-8 text-center space-y-4">
                                <ScanLine size={48} />
                                <p>Scan barcode or search products to begin billing</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {cartCalculated.map(item => (
                                    <li key={item.productId} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest">{item.category}</div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"><Trash2 size={14} /></button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                            <div><span className="text-gray-400">Net</span><br /><span className="font-semibold">{item.netWeight}g</span></div>
                                            <div><span className="text-gray-400">Rate</span><br /><span className="font-semibold">₹{item.metalRate}</span></div>
                                            <div><span className="text-gray-400">Making</span><br /><span className="font-semibold">₹{item.makingCharge}</span></div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed">
                                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border">
                                                <button className="px-2.5 py-1 hover:bg-gray-200 text-gray-600 font-bold" onClick={() => setCart(cart.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}>-</button>
                                                <span className="px-2 font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                                <button className="px-2.5 py-1 hover:bg-gray-200 text-gray-600 font-bold" onClick={() => setCart(cart.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))}>+</button>
                                            </div>
                                            <div className="font-black text-secondary text-base">₹{item.amount.toLocaleString()}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="p-5 bg-gray-50 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 shrink-0">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-bold text-gray-900">₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Old Gold Deduct</span>
                            <span className="font-bold text-amber-600">-₹{oldGoldValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Overall Discount</span>
                            <div className="flex gap-1 relative w-24">
                                <Tag size={12} className="absolute left-2 top-2 text-gray-400" />
                                <input type="number" className="pl-6 p-1 border rounded w-full text-right text-xs bg-white focus:border-primary outline-none" value={discountOverall} onChange={e => setDiscountOverall(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>GST Tax</span>
                            <span className="font-bold text-gray-900">₹{gstTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-3xl font-black text-secondary border-t border-gray-200 pt-3 mt-1">
                            <span className="text-lg">Total</span>
                            <span>₹{roundedGrand.toLocaleString()}</span>
                        </div>

                        <div className="pt-3">
                            <select className="w-full p-2 border rounded-lg bg-white mb-2 text-sm font-semibold text-gray-700 outline-none focus:border-primary" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="CASH">Cash Payment</option>
                                <option value="CARD">Credit/Debit Card</option>
                                <option value="UPI">UPI</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="flex gap-2 pb-1">
                            <button className="flex-1 btn bg-white border text-gray-700 hover:bg-gray-100 py-3" onClick={() => { setCart([]); toast('Bill cleared'); }}><Save size={18} /> Hold</button>
                            <button disabled={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate()} className="w-2/3 btn btn-primary py-3 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                {checkoutMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : <><CheckCircle size={20} /> Checkout</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
