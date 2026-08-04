'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Box,
  Barcode,
  ShoppingCart,
  Monitor,
  Gem,
  Wrench,
  Sparkles,
  Factory,
  UserCircle,
  Calculator,
  FileBarChart,
  Bell,
  Store,
  Settings,
  History,
  HelpCircle,
  LogOut,
  Search,
  Menu,
  Truck,
} from 'lucide-react';

/* We map components dynamically so we can keep this file clean. */
import Overview from '../src/components/Overview';
import Customers from '../src/components/Customers';
import Products from '../src/components/Products';
import Vendors from '../src/components/Vendors';
import Purchases from '../src/components/Purchases';
import SalesPOS from '../src/components/SalesPOS';
import Inventory from '../src/components/Inventory';
import BarcodeMenu from '../src/components/BarcodeMenu';
import Manufacturing from '../src/components/Manufacturing';
import GoldExchange from '../src/components/GoldExchange';
import Repairs from '../src/components/Repairs';
import CustomOrders from '../src/components/CustomOrders';
import Employees from '../src/components/Employees';
import Accounting from '../src/components/Accounting';
import Reports from '../src/components/Reports';
import Notifications from '../src/components/Notifications';
import NotificationBell from '../src/components/NotificationBell';
import Branch from '../src/components/Branch';
import SettingsComponent from '../src/components/Settings'; // alias to avoid conflict with Settings from lucide-react
import AuditLogs from '../src/components/AuditLogs';
import Help from '../src/components/Help';
import Loyalty from '../src/components/Loyalty';
import { Award } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Customers', icon: Users, id: 'customers' },
  { name: 'Products', icon: Package, id: 'products' },
  { name: 'Inventory', icon: Box, id: 'inventory' },
  { name: 'Barcode', icon: Barcode, id: 'barcode' },
  { name: 'Purchases', icon: ShoppingCart, id: 'purchases' },
  { name: 'Vendors', icon: Truck, id: 'vendors' },
  { name: 'Sales POS', icon: Monitor, id: 'pos' },
  { name: 'Gold Exchange', icon: Gem, id: 'exchange' },
  { name: 'Repairs', icon: Wrench, id: 'repairs' },
  { name: 'Custom Orders', icon: Sparkles, id: 'custom' },
  { name: 'Manufacturing', icon: Factory, id: 'manufacturing' },
  { name: 'Employees', icon: UserCircle, id: 'employees' },
  { name: 'Accounting', icon: Calculator, id: 'accounting' },
  { name: 'Reports', icon: FileBarChart, id: 'reports' },
  { name: 'Loyalty Program', icon: Award, id: 'loyalty' },
  { name: 'Notifications', icon: Bell, id: 'notifications' },
  { name: 'Branch', icon: Store, id: 'branch' },
  { name: 'Settings', icon: Settings, id: 'settings' },
  { name: 'Audit Logs', icon: History, id: 'logs' },
  { name: 'Help', icon: HelpCircle, id: 'help' },
];

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialTab = params.get('tab');
      if (initialTab) setActiveTab(initialTab);
    }
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) return null; // Avoid flicker during hydration

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${!sidebarOpen ? 'w-0 overflow-hidden' : ''}`}
        style={{ width: sidebarOpen ? '260px' : '0px', padding: sidebarOpen ? '' : '0' }}
      >
        <div className="sidebar-header" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
          <div className="brand-logo">J</div>
          <div className="brand-title">Aura ERP</div>
        </div>
        <nav className="sidebar-nav" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
          {navItems.map((item) => (
            <a
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.name}</span>
            </a>
          ))}
          <div style={{ marginTop: 'auto' }}>
            <a onClick={handleLogout} className="nav-item text-danger border-none cursor-pointer">
              <LogOut size={20} strokeWidth={2} />
              <span>Logout</span>
            </a>
          </div>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search products, customers or orders..."
                className="search-input"
              />
            </div>
          </div>
          <div className="topbar-actions">
            <NotificationBell onNavigate={() => setActiveTab('notifications')} />
            <button className="icon-btn">
              <Settings size={22} />
            </button>
            <div className="profile-menu">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="avatar"
              />
              <div style={{ marginLeft: 8, display: 'flex', flexDirection: 'column' }}>
                <span className="font-semibold text-sm">{user?.name || 'User'}</span>
                <span className="text-xs text-muted">
                  {user?.role === 'ADMIN'
                    ? 'Super Admin'
                    : user?.role === 'MANAGER'
                      ? 'Store Manager'
                      : 'Staff'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {activeTab === 'dashboard' ? (
            <Overview />
          ) : activeTab === 'customers' ? (
            <Customers />
          ) : activeTab === 'products' ? (
            <Products />
          ) : activeTab === 'inventory' ? (
            <Inventory />
          ) : activeTab === 'barcode' ? (
            <BarcodeMenu />
          ) : activeTab === 'purchases' ? (
            <Purchases />
          ) : activeTab === 'vendors' ? (
            <Vendors />
          ) : activeTab === 'pos' ? (
            <SalesPOS />
          ) : activeTab === 'manufacturing' ? (
            <Manufacturing />
          ) : activeTab === 'exchange' ? (
            <GoldExchange />
          ) : activeTab === 'repairs' ? (
            <Repairs />
          ) : activeTab === 'custom' ? (
            <CustomOrders />
          ) : activeTab === 'employees' ? (
            <Employees />
          ) : activeTab === 'accounting' ? (
            <Accounting />
          ) : activeTab === 'reports' ? (
            <Reports />
          ) : activeTab === 'loyalty' ? (
            <Loyalty />
          ) : activeTab === 'notifications' ? (
            <Notifications />
          ) : activeTab === 'branch' ? (
            <Branch />
          ) : activeTab === 'settings' ? (
            <SettingsComponent />
          ) : activeTab === 'logs' ? (
            <AuditLogs />
          ) : activeTab === 'help' ? (
            <Help />
          ) : (
            <div className="flex flex-col items-center justify-center pt-20">
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: 'var(--primary)',
                  opacity: 0.1,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.createElement(navItems.find((i) => i.id === activeTab)?.icon || Package, {
                  size: 48,
                  color: 'var(--primary)',
                })}
              </div>
              <h2 className="text-2xl font-bold mt-4" style={{ color: 'var(--secondary)' }}>
                {navItems.find((i) => i.id === activeTab)?.name} Module
              </h2>
              <p className="text-muted mt-2">
                This module is connected to backend APIs (Coming Soon).
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
