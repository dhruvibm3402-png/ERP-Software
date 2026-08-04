import React, { useState } from 'react';
import { useSettings, useUpdateSettings, useBackupSystem } from '../../hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Store,
  Users,
  FileText,
  Percent,
  Bell,
  Printer,
  Link as LinkIcon,
  Shield,
  Database,
  Palette,
  Save,
} from 'lucide-react';

const TABS = [
  { id: 'COMPANY', label: 'Company Profile', icon: Building2 },
  { id: 'USER_ROLE', label: 'Users & Roles', icon: Users },
  { id: 'INVOICE', label: 'Invoice & Billing', icon: FileText },
  { id: 'TAX', label: 'Tax & GST', icon: Percent },
  { id: 'PRINTER', label: 'Printer & Barcode', icon: Printer },
  { id: 'NOTIFICATION', label: 'Notifications', icon: Bell },
  { id: 'SECURITY', label: 'Security', icon: Shield },
  { id: 'INTEGRATION', label: 'Integrations', icon: LinkIcon },
  { id: 'BACKUP', label: 'Backup & Restore', icon: Database },
];

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('COMPANY');
  const { data, isLoading } = useSettings(activeTab);
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState<Record<string, any>>({});

  // Sync formData when data is loaded
  React.useEffect(() => {
    if (data?.data) {
      setFormData(data.data);
    }
  }, [data?.data, activeTab]);

  const handleSave = () => {
    updateSettings.mutate({ category: activeTab, data: formData });
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        gap: '24px',
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Sidebar Navigation */}
      <div
        style={{
          width: '250px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#111827',
          }}
        >
          System Settings
        </h2>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: activeTab === tab.id ? '#f0f9ff' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : '#4b5563',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 500,
              textAlign: 'left',
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
            {TABS.find((t) => t.id === activeTab)?.label}
          </h3>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Save size={18} /> {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div>Loading settings...</div>
          ) : (
            <SettingsContent tab={activeTab} formData={formData} setFormData={setFormData} />
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsContent({
  tab,
  formData,
  setFormData,
}: {
  tab: string;
  formData: any;
  setFormData: (data: any) => void;
}) {
  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  if (tab === 'COMPANY') {
    return (
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <Input
          label="Company Name"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <Input
          label="Legal Address"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        <Input
          label="Email Address"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        <Input
          label="Phone Number"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input
            label="GST Number"
            value={formData.gst || ''}
            onChange={(e) => handleChange('gst', e.target.value)}
          />
          <Input
            label="PAN Number"
            value={formData.pan || ''}
            onChange={(e) => handleChange('pan', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input
            label="Currency"
            value={formData.currency || 'INR'}
            onChange={(e) => handleChange('currency', e.target.value)}
          />
          <Input
            label="Financial Year"
            value={formData.financialYear || 'Apr-Mar'}
            onChange={(e) => handleChange('financialYear', e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (tab === 'INVOICE') {
    return (
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <Input
          label="Invoice Prefix"
          value={formData.prefix || 'INV-'}
          onChange={(e) => handleChange('prefix', e.target.value)}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={formData.showQR || false}
            onChange={(e) => handleChange('showQR', e.target.checked)}
          />
          Show Payment QR on Invoice
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Terms and Conditions</label>
          <textarea
            rows={5}
            value={formData.terms || ''}
            onChange={(e) => handleChange('terms', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
            }}
          />
        </div>
      </div>
    );
  }

  if (tab === 'TAX') {
    return (
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <Input
          label="Default GST Rate (%)"
          value={formData.defaultGst || '3'}
          onChange={(e) => handleChange('defaultGst', e.target.value)}
        />
        <Input
          label="Default Making Charges Tax (%)"
          value={formData.makingTax || '18'}
          onChange={(e) => handleChange('makingTax', e.target.value)}
        />
        <Input
          label="Company State (for CGST/SGST/IGST splitting)"
          value={formData.state || 'Maharashtra'}
          onChange={(e) => handleChange('state', e.target.value)}
        />
      </div>
    );
  }

  if (tab === 'BACKUP') {
    const backupSys = useBackupSystem();
    return (
      <div>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Configure automated backups or trigger a manual database dump.
        </p>
        <button
          onClick={() => backupSys.mutate()}
          style={{
            padding: '8px 16px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {backupSys.isPending ? 'Backing up...' : 'Create Manual Backup'}
        </button>
        {backupSys.isSuccess && (
          <p style={{ color: '#16a34a', marginTop: '16px' }}>Backup successful! File generated.</p>
        )}
      </div>
    );
  }

  if (tab === 'PRINTER') {
    return (
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <Input
          label="Barcode Format"
          value={formData.barcodeFormat || 'CODE128'}
          onChange={(e) => handleChange('barcodeFormat', e.target.value)}
        />
        <Input
          label="Label Size (W x H mm)"
          value={formData.labelSize || '50x25'}
          onChange={(e) => handleChange('labelSize', e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Fields to Print on Tags</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" defaultChecked /> Gross Weight
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" defaultChecked /> Net Weight
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" defaultChecked /> SKU Code
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" defaultChecked /> Purity
          </label>
        </div>
      </div>
    );
  }

  if (tab === 'SECURITY') {
    return (
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={formData.forceMfa || false}
            onChange={(e) => handleChange('forceMfa', e.target.checked)}
          />
          Force Two-Factor Authentication for all admins
        </label>
        <Input
          label="Session Timeout (minutes)"
          value={formData.timeout || '60'}
          onChange={(e) => handleChange('timeout', e.target.value)}
        />
        <Input
          label="Allowed IP Ranges (Comma separated)"
          value={formData.allowedIps || ''}
          onChange={(e) => handleChange('allowedIps', e.target.value)}
        />
      </div>
    );
  }

  if (tab === 'USER_ROLE') {
    return <UserRolesTab />;
  }

  return (
    <div>
      <p style={{ color: '#6b7280' }}>Configure generic {tab.toLowerCase()} settings here.</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: any) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function UserRolesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetch('/api/v1/roles').then((r) => r.json()),
  });
  const roles = data?.data || [];

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem' }}>Role Management</h3>
      {isLoading ? (
        <p>Loading roles...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {roles.map((r: any) => (
            <div
              key={r.id}
              style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
              >
                <h4 style={{ margin: 0 }}>
                  {r.name}{' '}
                  {r.isSystem && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      System
                    </span>
                  )}
                </h4>
                <button
                  style={{
                    padding: '4px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    background: 'white',
                  }}
                >
                  Edit Permissions
                </button>
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.875rem' }}>
                {r.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {r.Permissions.map((p: any) => (
                  <span
                    key={p.id}
                    style={{
                      fontSize: '0.75rem',
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {p.Permission.module}:{p.Permission.action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
