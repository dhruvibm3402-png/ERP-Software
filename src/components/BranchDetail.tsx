import React, { useState } from 'react';
import { useBranch, useBranchAnalytics, useBranchInventory, useBranchEmployees } from '../../hooks/useBranches';
import { ArrowLeft, Box, Users, Activity, Settings, Package, Truck } from 'lucide-react';

export default function BranchDetail({ branchId, onBack }: { branchId: string; onBack: () => void }) {
    const { data: branchData, isLoading } = useBranch(branchId);
    const [activeTab, setActiveTab] = useState('overview');

    if (isLoading) return <div style={{ padding: '24px' }}>Loading branch details...</div>;
    const b = branchData?.data;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ padding: '8px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex' }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{b?.name}</h1>
                    <p style={{ margin: 0, color: '#6b7280' }}>{b?.code} • {b?.location}</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', marginBottom: '32px' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'inventory', label: 'Inventory', icon: Box },
                    { id: 'employees', label: 'Employees', icon: Users },
                    { id: 'transfers', label: 'Transfers', icon: Truck },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : '#6b7280',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && <OverviewTab id={branchId} branch={b} />}
            {activeTab === 'inventory' && <InventoryTab id={branchId} />}
            {activeTab === 'employees' && <EmployeesTab id={branchId} />}
            {activeTab === 'transfers' && <TransfersTab id={branchId} />}
            {activeTab === 'settings' && <SettingsTab branch={b} />}

        </div>
    );
}

function OverviewTab({ id, branch }: { id: string, branch: any }) {
    const { data: analytics, isLoading } = useBranchAnalytics(id);
    const stats = analytics?.data || { totalSales: 0, inventoryStock: 0, employeeCount: 0 };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total Sales</h4>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>${stats.totalSales.toLocaleString()}</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Inventory Units</h4>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.inventoryStock}</p>
            </div>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Staff</h4>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.employeeCount}</p>
            </div>

            <div style={{ gridColumn: 'span 3', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>Branch Contact Info</h3>
                <p style={{ margin: '0 0 8px 0' }}><strong>Address:</strong> {branch?.address || 'Not Provided'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> {branch?.email || 'Not Provided'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Phone:</strong> {branch?.contactNumber || 'Not Provided'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>GST:</strong> {branch?.gstNumber || 'Not Provided'}</p>
            </div>
        </div>
    );
}

function InventoryTab({ id }: { id: string }) {
    const { data: invData, isLoading } = useBranchInventory(id);
    const inventory = invData?.data || [];

    return (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Product</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>SKU</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Available</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Reserved</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Weight (g)</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No inventory found at this branch.</td></tr>
                    ) : inventory.map((i: any) => (
                        <tr key={i.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px' }}>{i.Product?.name}</td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>{i.Product?.sku}</td>
                            <td style={{ padding: '12px 16px' }}>{i.availableStock}</td>
                            <td style={{ padding: '12px 16px' }}>{i.reservedStock}</td>
                            <td style={{ padding: '12px 16px' }}>{i.grossWeight}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmployeesTab({ id }: { id: string }) {
    const { data: empData, isLoading } = useBranchEmployees(id);
    const employees = empData?.data || [];

    return (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Role</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Mobile</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No employees assigned to this branch.</td></tr>
                    ) : employees.map((e: any) => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px' }}>{e.firstName} {e.lastName}</td>
                            <td style={{ padding: '12px 16px' }}>{e.Designation?.title || e.Employee?.role || 'Staff'}</td>
                            <td style={{ padding: '12px 16px' }}>{e.Employee?.mobile}</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Active</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TransfersTab({ id }: { id: string }) {
    return (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #e5e7eb', borderRadius: '12px', background: '#f9fafb' }}>
            <Truck style={{ margin: '0 auto 16px', color: '#9ca3af' }} size={48} />
            <h3 style={{ margin: '0 0 8px 0' }}>Transfer History</h3>
            <p style={{ color: '#6b7280' }}>Stock transfer tracking integrates with the central Inventory {'>'} Transfers module.</p>
            <button style={{ marginTop: '16px', padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Initiate Transfer</button>
        </div>
    );
}

function SettingsTab({ branch }: { branch: any }) {
    const s = branch?.BranchSettings;
    return (
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>Business Hours</h3>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ flex: 1 }}>
                        <span style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Open Time</span>
                        <input type="time" defaultValue={s?.openTime || '09:00'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', boxSizing: 'border-box' }} />
                    </label>
                    <label style={{ flex: 1 }}>
                        <span style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Close Time</span>
                        <input type="time" defaultValue={s?.closeTime || '21:00'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', boxSizing: 'border-box' }} />
                    </label>
                </div>
                <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Working Days (Comma separated)</span>
                    <input type="text" defaultValue={s?.workingDays || 'MON,TUE,WED,THU,FRI,SAT'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', boxSizing: 'border-box' }} />
                </label>
            </div>

            <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>Store Configurations</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <input type="checkbox" defaultChecked /> Enable Walk-in Sales POS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <input type="checkbox" defaultChecked /> Allow automated stock replenishing
                </label>
                <div style={{ marginTop: '24px' }}>
                    <button style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save Settings</button>
                </div>
            </div>
        </div>
    );
}
