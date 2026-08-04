'use client';
import React, { useState } from 'react';
import { Gem, FileText, BarChart3, PlusCircle } from 'lucide-react';
import ExchangeDashboard from './gold-exchange/ExchangeDashboard';
import ExchangeList from './gold-exchange/ExchangeList';
import NewExchangeModal from './gold-exchange/NewExchangeModal';

export default function GoldExchange() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNewModal, setShowNewModal] = useState(false);

    return (
        <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
                        <Gem size={24} className="text-primary" /> Gold Exchange
                    </h1>
                    <p className="text-muted mt-1 text-sm">Manage old gold melting, valuation testing, and sales offsets.</p>
                </div>
                <button onClick={() => setShowNewModal(true)} className="btn btn-primary shadow-lg px-5">
                    <PlusCircle size={18} /> Process New Exchange
                </button>
            </div>

            <div className="flex gap-1 border-b border-gray-200 bg-white/50 p-1.5 rounded-lg w-max shadow-sm shrink-0">
                {[
                    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
                    { id: 'list', label: 'Exchange Records', icon: FileText }
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
                {activeTab === 'dashboard' && <ExchangeDashboard />}
                {activeTab === 'list' && <ExchangeList />}
            </div>

            {showNewModal && <NewExchangeModal onClose={() => setShowNewModal(false)} />}
        </div>
    );
}
