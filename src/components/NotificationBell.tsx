import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '../../hooks/useNotifications';
import { useNotificationStore } from '../../store/notificationStore';
// Use standard Radix UI / Shadcn popover if it exists, otherwise build a simple dropdown.
// Since Shadcn UI is installed, we try to use standard popover. If not found, use a custom div.
// To avoid breaking without checking exactly what is available, I will build a lightweight dropdown tailored to the design.

export default function NotificationBell({ onNavigate }: { onNavigate: () => void }) {
  const { unreadCount, isOpen, setIsOpen } = useNotificationStore();
  const { data } = useNotifications({ take: 5, unreadOnly: true });

  // Fallback to store logic
  const notifications = data?.data || [];

  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();

  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={24} />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '320px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 50,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    background: notif.status === 'UNREAD' ? '#f0f9ff' : 'white',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    markAsRead.mutate(notif.id);
                    setIsOpen(false);
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                    {notif.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {notif.message}
                  </p>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                }}
              >
                No new notifications
              </div>
            )}
          </div>

          <div
            style={{
              padding: '12px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
              background: '#f9fafb',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate();
              }}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#111827',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
