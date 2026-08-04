const fs = require('fs');

fs.writeFileSync('app/superadmin/page.tsx', `
'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Server, Database, Activity, Cpu, HardDrive } from 'lucide-react';

export default function SuperAdminPage() {
    const searchParams = useSearchParams();
    const activeTab = searchParams?.get('tab') || 'dashboard';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {activeTab === 'dashboard' && (
             <>
               <div className="flex justify-between items-end">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
                    <p className="text-gray-400">Holistic metrics across all ERP tenants.</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Tenants', v: '142', c: '+12% m/m', icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-900/20', border: 'border-indigo-500/20' },
                   { label: 'Active Users', v: '4,289', c: '+8.1% m/m', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-500/20' },
                   { label: 'Platform MRR', v: '₹842,500', c: '+18% m/m', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-500/20' },
                   { label: 'Redis BullMQ Load', v: '8.4 ops/s', c: 'Normal', icon: Server, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500/20' },
                 ].map((stat) => (
                    <div key={stat.label} className={\`p-6 rounded-2xl border \${stat.border} bg-gray-900 shadow-xl\`} >
                       <div className="flex justify-between items-start mb-4">
                           <div className={\`p-3 rounded-lg \${stat.bg}\`}><stat.icon className={stat.color} size={24} /></div>
                           <span className="text-xs font-semibold px-2 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-full">{stat.c}</span>
                       </div>
                       <h3 className="text-2xl font-bold text-white tracking-tight">{stat.v}</h3>
                       <p className="text-sm text-gray-400 font-medium mt-1">{stat.label}</p>
                    </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 border border-gray-800 bg-gray-900/50 rounded-2xl p-6 h-96 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                      <h2 className="text-lg font-bold text-white relative z-10">Revenue & Subscriptions Growth</h2>
                      <div className="flex-1 w-full flex items-end gap-2 mt-4 relative z-10 opacity-70">
                         {/* Mock Bar Chart */}
                         {[30, 40, 25, 50, 45, 60, 55, 75, 65, 80, 95, 100].map((v, i) => (
                             <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-900/50 to-emerald-500" style={{ height: \`\${v}%\` }}></div>
                         ))}
                      </div>
                   </div>

                   <div className="border border-gray-800 bg-gray-900/50 rounded-2xl p-6 h-96 relative overflow-hidden">
                      <h2 className="text-lg font-bold text-white mb-6">Recent Tenant Signups</h2>
                      <div className="space-y-4">
                          {[
                            { name: 'Aura Jewels', domain: 'aura.erp.com', type: 'Enterprise' },
                            { name: 'Kalyan Traders', domain: 'kalyan.erp.com', type: 'Professional' },
                            { name: 'Malabar Ops', domain: 'malabar.erp.com', type: 'Enterprise' },
                            { name: 'Sparkle Retail', domain: 'sparkle.erp.com', type: 'Basic' },
                          ].map((t) => (
                             <div key={t.name} className="flex justify-between items-center bg-gray-900 border border-gray-800 p-3 rounded-xl hover:border-gray-700 cursor-pointer transition-colors">
                                <div>
                                   <p className="text-sm font-semibold text-gray-200">{t.name}</p>
                                   <p className="text-xs text-gray-500">{t.domain}</p>
                                </div>
                                <span className={\`text-xs px-2 py-1 rounded-full \${t.type === 'Enterprise' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-300'}\`}>{t.type}</span>
                             </div>
                          ))}
                      </div>
                   </div>
               </div>
             </>
           )}

           {activeTab === 'infrastructure' && (
             <div className="space-y-6">
                 <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Systems & Infrastructure</h1>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex gap-4 items-center">
                       <Cpu className="text-teal-400" size={32} />
                       <div><p className="text-sm font-medium text-gray-500">Node Cluster Heap</p><p className="text-xl font-bold text-white">4.12 GB / 16 GB</p></div>
                    </div>
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex gap-4 items-center">
                       <Database className="text-purple-400" size={32} />
                       <div><p className="text-sm font-medium text-gray-500">PostgreSQL Pool</p><p className="text-xl font-bold text-white">45 / 100 Connections</p></div>
                    </div>
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex gap-4 items-center">
                       <HardDrive className="text-rose-400" size={32} />
                       <div><p className="text-sm font-medium text-gray-500">EBS Volume Storage</p><p className="text-xl font-bold text-white">840 GB / 2 TB</p></div>
                    </div>
                 </div>
                 
                 <div className="p-6 border border-gray-800 bg-gray-900 rounded-2xl">
                     <h3 className="text-lg font-bold text-white mb-4">BullMQ Active Jobs</h3>
                     <table className="w-full text-left">
                        <thead className="border-b border-gray-800 text-sm text-gray-500">
                          <tr><th className="pb-3">Queue Name</th><th className="pb-3">Processing</th><th className="pb-3">Waiting</th><th className="pb-3">Failed</th></tr>
                        </thead>
                        <tbody className="text-sm text-gray-300">
                          <tr className="border-b border-gray-800/50">
                             <td className="py-4 font-mono">Invoice_Email_Queue</td>
                             <td className="py-4">12</td>
                             <td className="py-4 text-emerald-400">0</td>
                             <td className="py-4 text-gray-600">0</td>
                          </tr>
                          <tr className="border-b border-gray-800/50">
                             <td className="py-4 font-mono">Report_Aggregation</td>
                             <td className="py-4">3</td>
                             <td className="py-4 text-amber-500">45</td>
                             <td className="py-4 text-rose-500">1</td>
                          </tr>
                        </tbody>
                     </table>
                 </div>
             </div>
           )}

           {/* Placeholder for other tabs */}
           {['tenants', 'billing', 'platform-users', 'notifications', 'audit', 'settings'].includes(activeTab) && (
              <div className="p-16 text-center text-gray-500 border border-gray-800 border-dashed rounded-2xl">
                 <Server size={48} className="mx-auto mb-4 opacity-50" />
                 <h2 className="text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')} Module</h2>
                 <p className="mt-2 text-sm">Protected API architecture established. Data bindings are ready.</p>
              </div>
           )}

        </div>
    );
}
`);
