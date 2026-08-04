'use client';
import React, { useState } from 'react';
import { PackageSearch, ArrowRightLeft, TrendingDown, ClipboardList, PlusCircle, MinusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';

import InventoryDashboard from './inventory/InventoryDashboard';
import InventoryList from './inventory/InventoryList';
import StockTransfer from './inventory/StockTransfer';
import InventoryHistory from './inventory/InventoryHistory';
import StockActionModal from './inventory/StockActionModal';

export default function Inventory() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [actionModal, setActionModal] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
                        <PackageSearch size={24} className="text-primary" /> Inventory Management
                    </h1>
                    <p className="text-muted mt-1 text-sm">Real-time stock tracking, branch transfers, and automated audits.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActionModal('STOCK_OUT')} className="btn bg-white border text-red-600 border-red-200 hover:bg-red-50">
                        <MinusCircle size={16} /> Stock Out
                    </button>
                    <button onClick={() => setActionModal('STOCK_IN')} className="btn btn-primary shadow-lg">
                        <PlusCircle size={18} /> Stock In
                    </button>
                </div>
            </div>

            <div className="flex gap-1 border-b border-gray-200 bg-white/50 p-1.5 rounded-lg w-max shadow-sm">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: PackageSearch },
                    { id: 'list', label: 'Inventory List', icon: ClipboardList },
                    { id: 'transfer', label: 'Branch Transfers', icon: ArrowRightLeft },
                    { id: 'history', label: 'Movement History', icon: RefreshCw },
                    { id: 'alerts', label: 'Low Stock Alerts', icon: AlertCircle }
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

            <div className="flex-1 overflow-hidden">
                {activeTab === 'dashboard' && <InventoryDashboard />}
                {activeTab === 'list' && <InventoryList />}
                {activeTab === 'transfer' && <StockTransfer />}
                {activeTab === 'history' && <InventoryHistory />}
                {activeTab === 'alerts' && <div className="p-8 text-center text-gray-500">Low Stock Alert configurations coming soon to this view...</div>}
            </div>

            {actionModal && (
                <StockActionModal
                    type={actionModal}
                    onClose={() => setActionModal(null)}
                />
            )}
        </div>
    );
}
