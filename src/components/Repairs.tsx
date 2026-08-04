'use client';
import React, { useState } from 'react';
import { Wrench, ListTodo, PlusCircle, CheckCircle, BarChart3 } from 'lucide-react';
import RepairDashboard from './repairs/RepairDashboard';
import RepairList from './repairs/RepairList';
import NewRepairModal from './repairs/NewRepairModal';

export default function Repairs() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNewModal, setShowNewModal] = useState(false);

    return (
        <div className="flex flex-col h-full gap-4 relative animate-in fade-in duration-300">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
                        <Wrench size={24} className="text-primary" /> Repair Management
                    </h1>
                    <p className="text-muted mt-1 text-sm">Comprehensive lifecycle tracking for jewelry repairs and service jobs.</p>
                </div>
                <button onClick={() => setShowNewModal(true)} className="btn btn-primary shadow-lg px-5">
                    <PlusCircle size={18} /> New Repair Job
                </button>
            </div>

            <div className="flex gap-1 border-b border-gray-200 bg-white/50 p-1.5 rounded-lg w-max shadow-sm shrink-0">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'list', label: 'Active Repairs', icon: ListTodo }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === tab.id
                                ? 'bg-white shadow-sm text-primary ring-1 ring-gray-200'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                        style={{ border: 'none', background: activeTab === tab.id ? 'white' : 'transparent', boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'dashboard' && <RepairDashboard />}
                {activeTab === 'list' && <RepairList />}
            </div>

            {showNewModal && <NewRepairModal onClose={() => setShowNewModal(false)} />}
        </div>
    );
}
