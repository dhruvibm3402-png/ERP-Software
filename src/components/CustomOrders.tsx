'use client';
import React, { useState } from 'react';
import { Sparkles, LayoutDashboard, List, Plus } from 'lucide-react';
import Dashboard from './custom-orders/Dashboard';
import OrderList from './custom-orders/OrderList';
import NewOrderModal from './custom-orders/NewOrderModal';

export default function CustomOrders() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
            <Sparkles size={24} className="text-primary" /> Custom Orders
          </h1>
          <p className="text-muted mt-1 text-sm">Manage bespoke jewellery designs, approvals, and manufacturing.</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary shadow-lg px-5">
          <Plus size={18} /> New Custom Order
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 bg-white/50 p-1.5 rounded-lg w-max shadow-sm shrink-0">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: 'Order List', icon: List }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === tab.id
                ? 'bg-white shadow-sm ring-1 ring-gray-200'
                : 'hover:bg-gray-100'
              }`}
            style={{ border: 'none', background: activeTab === tab.id ? 'white' : 'transparent', boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col pt-2">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'orders' && <OrderList />}
      </div>

      {showNewModal && <NewOrderModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}
