'use client';
import React, { useState } from 'react';
import { Monitor, FileText, BarChart3, Clock } from 'lucide-react';
import POSInterface from './sales/POSInterface';
import SalesList from './sales/SalesList';

export default function SalesPOS() {
  // Determine active layout
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
            <Monitor size={24} className="text-primary" /> Sales & Point of Sale
          </h1>
          <p className="text-muted mt-1 text-sm">Create invoices, accept payments, and exchange old gold.</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 bg-white/50 p-1.5 rounded-lg w-max shadow-sm shrink-0">
        {[
          { id: 'pos', label: 'Point of Sale (POS)', icon: Monitor },
          { id: 'list', label: 'Sales History', icon: FileText },
          { id: 'holds', label: 'Held Invoices', icon: Clock },
          { id: 'reports', label: 'Closing Reports', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === tab.id
                ? 'bg-white shadow-sm text-primary ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-hidden ${activeTab === 'pos' ? 'card p-0 bg-transparent shadow-none border-none' : ''}`}>
        {activeTab === 'pos' && <POSInterface />}
        {activeTab === 'list' && <SalesList />}
        {['holds', 'reports'].includes(activeTab) && (
          <div className="h-full flex items-center justify-center p-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            {activeTab === 'holds' ? 'No Held Invoices found.' : 'Sales Closing Reports module building soon.'}
          </div>
        )}
      </div>
    </div>
  );
}
