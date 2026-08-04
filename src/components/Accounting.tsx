
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
   Calculator, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, Download, Plus, Search, CheckCircle, ArrowRightLeft, CreditCard
} from 'lucide-react';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';

export default function Accounting() {
   const queryClient = useQueryClient();
   const [activeTab, setActiveTab] = useState<'dashboard' | 'cash' | 'bank' | 'expenses' | 'incomes'>('dashboard');

   const { data: dashRes, isLoading: dLoad } = useQuery({ queryKey: ['acc-dash'], queryFn: async () => (await apiClient.get('/accounting/dashboard')).data });
   const { data: cashRes, isLoading: cLoad } = useQuery({ queryKey: ['acc-cash'], queryFn: async () => (await apiClient.get('/accounting/cash')).data, enabled: activeTab === 'cash' });
   const { data: bankRes, isLoading: bLoad } = useQuery({ queryKey: ['acc-bank'], queryFn: async () => (await apiClient.get('/accounting/bank')).data, enabled: activeTab === 'bank' });
   const { data: expRes, isLoading: eLoad } = useQuery({ queryKey: ['acc-exp'], queryFn: async () => (await apiClient.get('/accounting/expenses')).data, enabled: activeTab === 'expenses' });
   const { data: incRes, isLoading: iLoad } = useQuery({ queryKey: ['acc-inc'], queryFn: async () => (await apiClient.get('/accounting/incomes')).data, enabled: activeTab === 'incomes' });

   const formatCurrency = (val: number) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

   const dash = dashRes?.data || {};

   const [isModalOpen, setModalOpen] = useState(false);
   const [modalType, setModalType] = useState('cash'); // cash | bank | exp | inc
   const [formData, setFormData] = useState<any>({ amount: 0, description: '', type: 'IN', title: '', category: 'MISC', status: 'PENDING' });

   const createMutation = useMutation({
      mutationFn: async (payload: any) => {
         if (modalType === 'cash') return apiClient.post('/accounting/cash', payload);
         if (modalType === 'bank') return apiClient.post('/accounting/bank', payload);
         if (modalType === 'exp') return apiClient.post('/accounting/expenses', payload);
         if (modalType === 'inc') return apiClient.post('/accounting/incomes', payload);
      },
      onSuccess: () => {
         toast.success('Successfully recorded!');
         setModalOpen(false);
         queryClient.invalidateQueries({ queryKey: ['acc-dash'] });
         queryClient.invalidateQueries({ queryKey: ['acc-cash'] });
         queryClient.invalidateQueries({ queryKey: ['acc-bank'] });
         queryClient.invalidateQueries({ queryKey: ['acc-exp'] });
         queryClient.invalidateQueries({ queryKey: ['acc-inc'] });
         setFormData({ amount: 0, description: '', type: 'IN', title: '', category: 'MISC', status: 'PENDING' });
      }
   });

   return (
      <div className="flex flex-col h-full gap-5 relative animate-in fade-in duration-300 bg-gray-50/50 p-2">

         {/* Header */}
         <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
               <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                  <Calculator size={28} className="text-primary" />
                  Financial Accounting
               </h1>
               <p className="text-muted mt-1 text-sm">Comprehensive ledger, cash flows, and analytics.</p>
            </div>
            <div className="flex gap-3">
               <button className="btn bg-white border text-gray-700 shadow-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} /> Export Reports
               </button>
               <div className="dropdown relative group inline-block">
                  <button className="btn btn-primary shadow-lg flex items-center gap-2">
                     <Plus size={18} /> Create Entry
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden">
                     <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-semibold border-b" onClick={() => { setModalType('cash'); setModalOpen(true) }}>Cash Entry</button>
                     <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-semibold border-b" onClick={() => { setModalType('bank'); setModalOpen(true) }}>Bank Entry</button>
                     <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-semibold border-b" onClick={() => { setModalType('exp'); setModalOpen(true) }}>Log Expense</button>
                     <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-semibold" onClick={() => { setModalType('inc'); setModalOpen(true) }}>Record Income</button>
                  </div>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 bg-white p-1.5 rounded-lg border shadow-sm w-fit">
            {['dashboard', 'cash', 'bank', 'expenses', 'incomes'].map(tab => (
               <button
                  key={tab}
                  className={`px-6 py-2 rounded-md font-semibold text-sm capitalize transition-colors ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab(tab as any)}
               >
                  {tab.replace('incomes', 'Income').replace('expenses', 'Expenses')}
               </button>
            ))}
         </div>

         {/* Content */}
         <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-5">

            {activeTab === 'dashboard' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-5">
                     <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 p-5 rounded-xl border border-green-100/50 shadow-sm relative overflow-hidden">
                        <TrendingUp className="absolute right-[-10px] bottom-[-10px] text-green-200/50 w-24 h-24" />
                        <div className="flex items-center gap-2 text-green-700 font-bold mb-2 relative"><TrendingUp size={18} /> Income</div>
                        <span className="text-3xl font-black text-gray-800 relative">{dLoad ? '...' : formatCurrency(dash.totalRevenue)}</span>
                     </div>
                     <div className="bg-gradient-to-br from-red-50 to-rose-100/50 p-5 rounded-xl border border-red-100/50 shadow-sm relative overflow-hidden">
                        <TrendingDown className="absolute right-[-10px] bottom-[-10px] text-red-200/50 w-24 h-24" />
                        <div className="flex items-center gap-2 text-red-700 font-bold mb-2 relative"><TrendingDown size={18} /> Expenses</div>
                        <span className="text-3xl font-black text-gray-800 relative">{dLoad ? '...' : formatCurrency(dash.totalExpenses)}</span>
                     </div>
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 p-5 rounded-xl border border-blue-100/50 shadow-sm relative overflow-hidden">
                        <Wallet className="absolute right-[-10px] bottom-[-10px] text-blue-200/50 w-24 h-24" />
                        <div className="flex items-center gap-2 text-blue-700 font-bold mb-2 relative"><Wallet size={18} /> Cash Balance</div>
                        <span className="text-3xl font-black text-gray-800 relative">{dLoad ? '...' : formatCurrency(dash.cashBalance)}</span>
                     </div>
                     <div className="bg-gradient-to-br from-purple-50 to-fuchsia-100/50 p-5 rounded-xl border border-purple-100/50 shadow-sm relative overflow-hidden">
                        <CreditCard className="absolute right-[-10px] bottom-[-10px] text-purple-200/50 w-24 h-24" />
                        <div className="flex items-center gap-2 text-purple-700 font-bold mb-2 relative"><CreditCard size={18} /> Bank Balance</div>
                        <span className="text-3xl font-black text-gray-800 relative">{dLoad ? '...' : formatCurrency(dash.bankBalance)}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5 mt-4">
                     <div className="border rounded-xl p-5 shadow-sm">
                        <h3 className="font-bold text-gray-800 border-b pb-4 mb-4">Cash Flow Overview</h3>
                        <div className="h-48 flex items-end gap-4 px-4 w-full">
                           {/* Mock Chart */}
                           <div className="flex-1 bg-green-100 rounded-t-md relative group hover:bg-green-200 transition-colors" style={{ height: '80%' }}>
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">IN</span>
                           </div>
                           <div className="flex-1 bg-red-100 rounded-t-md relative group hover:bg-red-200 transition-colors" style={{ height: '40%' }}>
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">OUT</span>
                           </div>
                           <div className="flex-1 bg-green-100 rounded-t-md relative group" style={{ height: '60%' }}></div>
                           <div className="flex-1 bg-red-100 rounded-t-md relative group" style={{ height: '30%' }}></div>
                           <div className="flex-1 bg-green-100 rounded-t-md relative group" style={{ height: '90%' }}></div>
                           <div className="flex-1 bg-red-100 rounded-t-md relative group" style={{ height: '50%' }}></div>
                        </div>
                     </div>
                     <div className="border rounded-xl p-5 shadow-sm bg-gray-50 flex flex-col justify-center items-center text-center">
                        <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4 ${dash.netProfit >= 0 ? 'border-green-400 text-green-600' : 'border-red-400 text-red-600'}`}>
                           <div className="flex flex-col">
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Net Profit</span>
                              <span className="text-xl font-black">{dLoad ? '...' : formatCurrency(dash.netProfit)}</span>
                           </div>
                        </div>
                        <p className="text-sm text-gray-600">Your gross income effectively covers your total booked expenses.</p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'cash' && (
               <div className="flex flex-col h-full">
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Cash Book</h3>
                  <div className="overflow-auto flex-1">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                           <tr>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase">Description</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase">Type</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right">Balance</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {cLoad ? <tr><td colSpan={5} className="p-5 text-center text-gray-400">Loading Cash Book...</td></tr> :
                              cashRes?.data?.map((row: any) => (
                                 <tr key={row.id} className="hover:bg-gray-50/80">
                                    <td className="p-3 text-sm text-gray-500">{new Date(row.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-sm font-medium">{row.description}</td>
                                    <td className="p-3 text-sm"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.type}</span></td>
                                    <td className={`p-3 text-sm font-bold text-right ${row.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(row.amount)}</td>
                                    <td className="p-3 text-sm font-bold text-right text-gray-800">{formatCurrency(row.balance)}</td>
                                 </tr>
                              ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'expenses' && (
               <div className="flex flex-col h-full">
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Expenses Hub</h3>
                  <div className="overflow-auto flex-1">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                           <tr>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase">Title / Category</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {eLoad ? <tr><td colSpan={4} className="p-5 text-center text-gray-400">Loading Expenses...</td></tr> :
                              expRes?.data?.map((row: any) => (
                                 <tr key={row.id} className="hover:bg-gray-50/80">
                                    <td className="p-3 text-sm text-gray-500">{new Date(row.date).toLocaleDateString()}</td>
                                    <td className="p-3">
                                       <div className="font-bold text-gray-800 text-sm">{row.title}</div>
                                       <div className="text-xs text-gray-400">{row.category}</div>
                                    </td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${row.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{row.status}</span></td>
                                    <td className="p-3 text-sm font-bold text-right text-red-500">{formatCurrency(row.amount)}</td>
                                 </tr>
                              ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

         </div>

         {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 border-b bg-gray-50 flex justify-between items-center">
                     <h3 className="font-bold text-gray-800">
                        {modalType === 'cash' ? 'New Cash Entry' : modalType === 'bank' ? 'Bank Transaction' : modalType === 'exp' ? 'Log Expense' : 'Record Income'}
                     </h3>
                     <button className="text-gray-400 hover:text-gray-800 font-bold" onClick={() => setModalOpen(false)}>X</button>
                  </div>
                  <div className="p-5 space-y-4">
                     {(modalType === 'cash' || modalType === 'bank') && (
                        <>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transaction Type</label>
                              <select className="w-full p-2 border rounded-lg bg-gray-50" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                 <option value={modalType === 'cash' ? 'IN' : 'DEPOSIT'}>{modalType === 'cash' ? 'Cash IN' : 'Deposit'}</option>
                                 <option value={modalType === 'cash' ? 'OUT' : 'WITHDRAWAL'}>{modalType === 'cash' ? 'Cash OUT' : 'Withdrawal'}</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                              <input type="text" className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Sale #1234" />
                           </div>
                        </>
                     )}
                     {(modalType === 'exp' || modalType === 'inc') && (
                        <>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                              <input type="text" className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Office Rent" />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                 <input type="text" className="w-full p-2 border rounded-lg bg-gray-50" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                 <select className="w-full p-2 border rounded-lg bg-gray-50" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                 </select>
                              </div>
                           </div>
                        </>
                     )}
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label>
                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary text-lg font-bold outline-none" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                     </div>
                  </div>
                  <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                     <button className="btn bg-white border font-bold text-gray-600" onClick={() => setModalOpen(false)}>Cancel</button>
                     <button className="btn btn-primary shadow font-bold" onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending || !formData.amount}>
                        {createMutation.isPending ? 'Saving...' : 'Save Record'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
