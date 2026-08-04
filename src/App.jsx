import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Package, Box, Barcode, ShoppingCart,
  Monitor, Gem, Wrench, Sparkles, Factory, UserCircle,
  Calculator, FileBarChart, Bell, Store, Settings,
  History, HelpCircle, LogOut, Search, Menu
} from 'lucide-react';
import Manufacturing from './components/Manufacturing';
import Overview from './components/Overview';
import Customers from './components/Customers';
import Products from './components/Products';
import './index.css';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Customers', icon: Users, id: 'customers' },
  { name: 'Products', icon: Package, id: 'products' },
  { name: 'Inventory', icon: Box, id: 'inventory' },
  { name: 'Barcode', icon: Barcode, id: 'barcode' },
  { name: 'Purchases', icon: ShoppingCart, id: 'purchases' },
  { name: 'Sales POS', icon: Monitor, id: 'pos' },
  { name: 'Gold Exchange', icon: Gem, id: 'exchange' },
  { name: 'Repairs', icon: Wrench, id: 'repairs' },
  { name: 'Custom Orders', icon: Sparkles, id: 'custom' },
  { name: 'Manufacturing', icon: Factory, id: 'manufacturing' },
  { name: 'Employees', icon: UserCircle, id: 'employees' },
  { name: 'Accounting', icon: Calculator, id: 'accounting' },
  { name: 'Reports', icon: FileBarChart, id: 'reports' },
  { name: 'Notifications', icon: Bell, id: 'notifications' },
  { name: 'Branch', icon: Store, id: 'branch' },
  { name: 'Settings', icon: Settings, id: 'settings' },
  { name: 'Audit Logs', icon: History, id: 'logs' },
  { name: 'Help', icon: HelpCircle, id: 'help' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${!sidebarOpen ? 'w-0 overflow-hidden' : ''}`} style={{ width: sidebarOpen ? '260px' : '0px', padding: sidebarOpen ? '' : '0' }}>
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
            <a className="nav-item text-danger">
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
              <input type="text" placeholder="Search products, customers or orders..." className="search-input" />
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={24} />
              <span className="badge">3</span>
            </button>
            <button className="icon-btn">
              <Settings size={22} />
            </button>
            <div className="profile-menu">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="avatar" />
              <div style={{ marginLeft: 8, display: 'flex', flexDirection: 'column' }}>
                <span className="font-semibold text-sm">Maya Sharma</span>
                <span className="text-xs text-muted">Store Manager</span>
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
          ) : activeTab === 'manufacturing' ? (
            <Manufacturing />
          ) : (
            <div className="flex flex-col items-center justify-center pt-20">
              <div style={{ width: 120, height: 120, background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.createElement(navItems.find(i => i.id === activeTab)?.icon || Package, { size: 48, color: 'var(--primary)' })}
              </div>
              <h2 className="text-2xl font-bold mt-4" style={{ color: 'var(--secondary)' }}>{navItems.find(i => i.id === activeTab)?.name} Module</h2>
              <p className="text-muted mt-2">This module is part of the premium SaaS package.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
