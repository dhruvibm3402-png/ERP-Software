const fs = require('fs');

const code = `"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileBarChart, PieChart, ShoppingCart, Truck, Diamond, History, Clock, TrendingUp, TrendingDown,
  Download, Printer, Filter
} from 'lucide-react';
import apiClient from '../../utils/apiClient';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: res, isLoading } = useQuery({ queryKey: ['reports-dash'], queryFn: async () => (await apiClient.get('/v1/reports')).data });
  const d = res?.data || {};

  const formatC = (val) => \`₹\${Number(val || 0).toLocaleString('en-IN')}\`;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'sales', label: 'Sales & Revenue', icon: ShoppingCart },
    { id: 'purchases', label: 'Procurement', icon: Truck },
    { id: 'inventory', label: 'Inventory / Stk', icon: Diamond },
    { id: 'accounting', label: 'Accounting / GST', icon: FileBarChart },
    { id: 'scheduled', label: 'Scheduled', icon: Clock }
  ];

  return (
    <div className="flex flex-col h-full gap-5 relative animate-in fade-in duration-300 bg-gray-50/50 p-2">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FileBarChart size={28} className="text-primary" /> Analytics Engine
          </h1>
          <p className="text-muted mt-1 text-sm">Deep dive into your ERP financial performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn bg-white border text-gray-700 shadow-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
            <Filter size={18} /> Filters
          </button>
          <button className="btn btn-primary shadow-lg flex items-center gap-2">
            <Download size={18} /> Export Master Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-white p-1.5 rounded-lg border shadow-sm shrink-0 w-fit max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap \${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }\`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
           <div className="flex flex-col gap-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-xl">System KPIs</h2>
              <div className="grid grid-cols-4 gap-4">
                 {[
                   {label: 'Total Revenue', v: d.revenue},
                   {label: 'Net Profit', v: d.profit},
                   {label: 'Expenses', v: d.expenses},
                   {label: 'Bank Balance', v: d.bankBalance}
                 ].map(k => (
                   <div key={k.label} className="p-4 border rounded-lg bg-gray-50 flex flex-col gap-2">
                      <span className="text-sm font-bold text-gray-500 uppercase">{k.label}</span>
                      <span className="text-2xl font-black text-gray-800">{isLoading ? '...' : formatC(k.v)}</span>
                   </div>
                 ))}
              </div>
           </div>
        )}
        
        {activeTab !== 'dashboard' && (
           <div className="flex-1 bg-white rounded-xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
               <History size={64} className="text-gray-300 mb-4" />
               <h4 className="text-2xl font-black text-gray-800 mb-2">{tabs.find(t=>t.id===activeTab)?.label} Loading</h4>
               <p className="text-gray-500 max-w-md">Apply global filters or pick a distinct date range above to load historical {activeTab} logs from PostgreSQL.</p>
           </div>
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/components/Reports.tsx', code);
console.log('Written');
