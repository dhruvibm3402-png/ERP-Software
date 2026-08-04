import React, { useState } from 'react';
import { Store, MapPin, Users, Package, Settings, BarChart, ArrowRightLeft, Plus } from 'lucide-react';
import { useBranches, useCreateBranch } from '../../hooks/useBranches';
import BranchDetail from './BranchDetail';

export default function BranchManagement() {
  const { data, isLoading } = useBranches();
  const branches = data?.data || [];

  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (selectedBranch) {
    return <BranchDetail branchId={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={28} className="text-primary" /> Branch Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>Manage store locations, inventory, and employees.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
          <Plus size={18} /> Add Branch
        </button>
      </div>

      {/* Dashboard Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#6b7280' }}>Total Branches</h3>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{branches.length}</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#6b7280' }}>Active Branches</h3>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>{branches.filter((b: any) => b.status !== 'INACTIVE').length}</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#6b7280' }}>Total Revenue (MTD)</h3>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>$124,500</p>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#6b7280' }}>Pending Transfers</h3>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: '#ea580c' }}>5</p>
        </div>
      </div>

      {isLoading ? <div>Loading branches...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {branches.map((b: any) => (
            <div key={b.id} style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onClick={() => setSelectedBranch(b.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.125rem', fontWeight: 'bold' }}>{b.name}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: b.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6', color: b.status === 'ACTIVE' ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
                    {b.status || 'ACTIVE'}
                  </span>
                  {b.isDefault && <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', fontWeight: 600 }}>Default</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
                  <MapPin size={16} /> <span>{b.location || 'Location not set'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
                  <Users size={16} /> <span>Staff managed internally</span>
                </div>
              </div>

              <button style={{ width: '100%', padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#111827', cursor: 'pointer', fontWeight: 500 }}>
                Manage Branch
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateBranchModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateBranchModal({ onClose }: { onClose: () => void }) {
  const createBranch = useCreateBranch();
  const [formData, setFormData] = useState({ name: '', location: '', isDefault: false });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '400px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.25rem', fontWeight: 600 }}>Add New Branch</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <label>
            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Branch Name</span>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', boxSizing: 'border-box' }} />
          </label>
          <label>
            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Location/City</span>
            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', boxSizing: 'border-box' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} />
            <span>Set as Default Branch</span>
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => {
              createBranch.mutate(formData);
              onClose();
            }}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Save Branch</button>
        </div>
      </div>
    </div>
  );
}
