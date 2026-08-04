import React, { useState } from 'react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useUpdateNotificationPreferences,
  useNotificationPreferences,
} from '../../hooks/useNotifications';
import { Settings, Inbox, LayoutTemplate, Trash2, Check, Search, Filter } from 'lucide-react';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'templates' | 'settings'>('inbox');

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Notification Center
        </h1>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('inbox')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'inbox' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'inbox' ? 'var(--primary)' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500,
            }}
          >
            <Inbox size={18} /> Inbox
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'templates' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'templates' ? 'var(--primary)' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500,
            }}
          >
            <LayoutTemplate size={18} /> Templates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'settings' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'settings' ? 'var(--primary)' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500,
            }}
          >
            <Settings size={18} /> Preferences
          </button>
        </div>
      </div>

      {activeTab === 'inbox' && <InboxView />}
      {activeTab === 'templates' && <TemplatesView />}
      {activeTab === 'settings' && <SettingsView />}
    </div>
  );
}

function InboxView() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ

  // Pass undefined instead of false so it doesn't break if backend expects empty
  const { data, isLoading } = useNotifications({
    skip: page * 20,
    take: 20,
    unreadOnly: filter === 'UNREAD' ? true : undefined,
  });

  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = data?.data || [];
  const total = data?.total || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: 'absolute', top: '10px', left: '10px' }}
            />
            <input
              type="text"
              placeholder="Search..."
              style={{
                padding: '8px 12px 8px 32px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                width: '250px',
              }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
            }}
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => markAllAsRead.mutate()}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
            }}
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #e5e7eb',
          }}
        >
          <Inbox style={{ margin: '0 auto 16px auto', color: '#d1d5db' }} size={48} />
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 500 }}>All caught up!</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem' }}>
            No notifications found for this filter.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          {notifications.map((n: any) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                background: n.status === 'UNREAD' ? '#f0f9ff' : 'white',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
                >
                  <h4
                    style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}
                  >
                    {n.title}
                  </h4>
                  {n.priority === 'HIGH' && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      High Priority
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem' }}>{n.message}</p>
                <span
                  style={{
                    display: 'block',
                    margin: '8px 0 0 0',
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                  }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {n.status === 'UNREAD' && (
                  <button
                    onClick={() => markAsRead.mutate(n.id)}
                    title="Mark as Read"
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--primary)',
                    }}
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotif.mutate(n.id)}
                  title="Delete"
                  style={{
                    padding: '6px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f9fafb',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {page * 20 + 1} to {Math.min((page + 1) * 20, total)} of {total}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * 20 >= total}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  cursor: (page + 1) * 20 >= total ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  const { data, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  // Fallback local state until form validation is needed
  const prefs = data?.data || {
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: false,
    inAppEnabled: true,
    quietHoursStart: '',
    quietHoursEnd: '',
  };

  const handleChange = (key: string, value: any) => {
    updatePrefs.mutate({ [key]: value });
  };

  if (isLoading) return <div>Loading preferences...</div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>
        Delivery Channels
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ display: 'block', fontWeight: 600 }}>In-App Notifications</span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Receive alerts inside the platform
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.inAppEnabled}
            onChange={(e) => handleChange('inAppEnabled', e.target.checked)}
            style={{ width: '20px', height: '20px' }}
          />
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ display: 'block', fontWeight: 600 }}>Email Notifications</span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Receive detailed alerts via email
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.emailEnabled}
            onChange={(e) => handleChange('emailEnabled', e.target.checked)}
            style={{ width: '20px', height: '20px' }}
          />
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ display: 'block', fontWeight: 600 }}>SMS Notifications</span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Receive critical alerts on mobile
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.smsEnabled}
            onChange={(e) => handleChange('smsEnabled', e.target.checked)}
            style={{ width: '20px', height: '20px' }}
          />
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ display: 'block', fontWeight: 600 }}>WhatsApp Notifications</span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Receive interactive reports on WhatsApp
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.whatsappEnabled}
            onChange={(e) => handleChange('whatsappEnabled', e.target.checked)}
            style={{ width: '20px', height: '20px' }}
          />
        </label>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '32px 0 24px 0' }}>Quiet Hours</h3>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input
          type="time"
          value={prefs.quietHoursStart || ''}
          onChange={(e) => handleChange('quietHoursStart', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
        <span>to</span>
        <input
          type="time"
          value={prefs.quietHoursEnd || ''}
          onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        />
      </div>
      <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
        All non-critical notifications will be paused during quiet hours.
      </p>
    </div>
  );
}

function TemplatesView() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Notification Templates</h3>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Create Template
        </button>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Customize the message format for different channels. Use placeholders like{' '}
        {'{{customerName}}'} or {'{{invoiceNumber}}'}.
      </p>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        {['New Registration', 'Invoice Generated', 'Payment Received', 'Low Stock Alert'].map(
          (tpl, i) => (
            <div
              key={tpl}
              style={{
                padding: '16px',
                borderBottom: i < 3 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{tpl}</h4>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    padding: '2px 8px',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    marginRight: '8px',
                  }}
                >
                  Email
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    padding: '2px 8px',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                  }}
                >
                  SMS
                </span>
              </div>
              <button
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
