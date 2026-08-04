const fs = require('fs');
const path = require('path');

const pageLayout = `import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { Gift, Users, Coins, Percent, Wallet, Link as LinkIcon, BarChart3, TrendingUp, Award } from 'lucide-react';

export default function LoyaltyDashboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Loyalty & Rewards Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer loyalty, points, rewards, and wallets</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
             <Coins size={16} /> Issue Points
           </button>
           <button className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
             <Gift size={16} /> Add Reward
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Members</p>
              <h3 className="text-3xl font-bold mt-1">4,289</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Users size={24} className="text-white" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Points Issued</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">1,204,500</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Coins size={24} className="text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Points Redeemed</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">942,100</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Active Coupons</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">124</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Percent size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <div className="bg-white p-2 rounded-xl border shadow-sm mb-6 inline-flex w-full md:w-auto overflow-x-auto">
          <TabsList className="bg-transparent h-auto gap-2">
            <TabsTrigger value="members" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-lg px-4 py-2">
              <Users size={16} className="mr-2" /> Members
            </TabsTrigger>
            <TabsTrigger value="tiers" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-lg px-4 py-2">
              <Award size={16} className="mr-2" /> Tiers
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-lg px-4 py-2">
              <Gift size={16} className="mr-2" /> Rewards
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-lg px-4 py-2">
              <Percent size={16} className="mr-2" /> Coupons
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-lg px-4 py-2">
              <Wallet size={16} className="mr-2" /> Wallet
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-lg px-4 py-2">
              <LinkIcon size={16} className="mr-2" /> Referrals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg font-semibold">Loyalty Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b flex gap-4">
                <input type="text" placeholder="Search members by name or ID..." className="search-input w-full max-w-md p-2 border rounded-lg" />
                <select className="border rounded-lg p-2 bg-white"><option>All Tiers</option><option>Diamond</option><option>Gold</option></select>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Tier</th>
                    <th className="p-4 font-medium">Points Balance</th>
                    <th className="p-4 font-medium">Total Earned</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4">
                       <div className="font-semibold text-gray-900">Anjali Sharma</div>
                       <div className="text-xs text-gray-500">+91 98765 43210</div>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Gold</span></td>
                    <td className="p-4 font-medium text-emerald-600">12,500</td>
                    <td className="p-4">45,000</td>
                    <td className="p-4">Oct 12, 2025</td>
                    <td className="p-4 text-right">
                       <button className="text-primary text-sm font-medium hover:underline">View History</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4">
                       <div className="font-semibold text-gray-900">Rahul Desai</div>
                       <div className="text-xs text-gray-500">+91 91234 56780</div>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Diamond</span></td>
                    <td className="p-4 font-medium text-emerald-600">85,200</td>
                    <td className="p-4">120,500</td>
                    <td className="p-4">Jan 05, 2024</td>
                    <td className="p-4 text-right">
                       <button className="text-primary text-sm font-medium hover:underline">View History</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}`;

fs.writeFileSync('app/dashboard/loyalty/page.tsx', pageLayout);
