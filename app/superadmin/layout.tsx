
import React from 'react';
import { Shield, Settings, Users, Database, Server, CreditCard, Bell, Terminal, RefreshCw, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Super Admin - Platform Console'
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 font-sans text-gray-100 dark">
      {/* Platform Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col">
         <div className="p-6 border-b border-gray-800 flex items-center gap-3 text-emerald-400">
           <Shield size={24} />
           <span className="font-bold text-lg tracking-wider uppercase">Console</span>
         </div>
         <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {[
              { id: '', icon: BarChart2, label: 'Dashboard' },
              { id: '?tab=tenants', icon: Database, label: 'Tenants' },
              { id: '?tab=infrastructure', icon: Server, label: 'Infrastructure & System' },
              { id: '?tab=billing', icon: CreditCard, label: 'Billing & Plans' },
              { id: '?tab=platform-users', icon: Users, label: 'Platform Users' },
              { id: '?tab=notifications', icon: Bell, label: 'Global Notifications' },
              { id: '?tab=audit', icon: Terminal, label: 'Audit Logs' },
              { id: '?tab=settings', icon: Settings, label: 'Platform Settings' },
            ].map(nav => (
              <a key={nav.label} href={`/superadmin${nav.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors duration-200">
                 <nav.icon size={18} />
                 <span className="text-sm font-medium">{nav.label}</span>
              </a>
            ))}
         </nav>
      </aside>
      
      {/* Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col bg-gray-900 border-l border-gray-800/50 shadow-2xl relative">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] pointer-events-none" />
        
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800/50 flex items-center justify-between px-8 bg-gray-900/50 backdrop-blur-md relative z-10">
          <div className="flex gap-4 items-center">
            <span className="text-gray-400 text-sm font-medium border border-gray-800 rounded-full px-3 py-1 bg-gray-950 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Output Stable
            </span>
          </div>
          <div className="flex items-center gap-4">
             <button className="text-gray-400 hover:text-white"><RefreshCw size={18} /></button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">SA</div>
          </div>
        </header>

        {/* Dashboard Content Inject */}
        <div className="flex-1 overflow-auto p-8 relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
}
