const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const storeContent = `
import { create } from 'zustand';

interface SaaSState {
  currentTenantId: string | null;
  setCurrentTenantId: (id: string) => void;
}

export const useSaaSStore = create<SaaSState>((set) => ({
  currentTenantId: null,
  setCurrentTenantId: (id) => set({ currentTenantId: id }),
}));
`;

const hooksContent = `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await fetch('/api/v1/saas/tenants');
      const data = await res.json();
      return data.data;
    }
  });
};

export const usePlans = () => {
    return useQuery({
      queryKey: ['plans'],
      queryFn: async () => {
        const res = await fetch('/api/v1/saas/plans');
        const data = await res.json();
        return data.data;
      }
    });
  };

export const useTenantDashboard = (tenantId: string) => {
    return useQuery({
        queryKey: ['tenantDashboard', tenantId],
        queryFn: async () => {
            const res = await fetch('/api/v1/saas/tenants/' + tenantId + '/dashboard');
            const data = await res.json();
            return data.data;
        },
        enabled: !!tenantId,
    });
};
`;

const typesContent = `
export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    currency: string;
    timezone: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
}
`;

const apiTenantsRoute = `
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET() {
    try {
        const tenants = await prisma.tenant.findMany({
            include: { Subscription: true }
        });
        return NextResponse.json({ data: tenants });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const tenant = await prisma.tenant.create({
            data: {
                name: body.name,
                subdomain: body.subdomain,
            }
        });
        return NextResponse.json({ data: tenant });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
`;

const apiPlansRoute = `
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany();
        return NextResponse.json({ data: plans });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
`;

const apiUsageRoute = `
import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const usage = await prisma.tenantUsage.findMany({
            where: { tenantId: params.id }
        });
        return NextResponse.json({ data: usage });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500});
    }
}
`;

const repoContent = `
import prisma from '../../lib/prisma';

export class TenantRepository {
  async findAll() {
    return prisma.tenant.findMany({ include: { Subscription: { include: { Plan: true } } } });
  }

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: { 
          Settings: true,
          Features: true,
          Domains: true,
          Subscription: { include: { Plan: true } }
      }
    });
  }

  async createTenant(data: any) {
     return prisma.tenant.create({ data });
  }

  async updateTenant(id: string, data: any) {
     return prisma.tenant.update({ where: { id }, data });
  }
}
`;

const setupWizardContent = `
"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function SetupWizard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        subdomain: '',
        currency: 'INR',
        plan: ''
    });

    const nextStep = () => setStep(prev => prev + 1);
    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <Input placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                        <Input placeholder="Subdomain" value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value})} />
                        <Button onClick={nextStep}>Next: Plan Selection</Button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <select className="w-full border p-2 rounded" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                            <option value="">Select Plan</option>
                            <option value="basic">Basic - $10/mo</option>
                            <option value="pro">Pro - $30/mo</option>
                        </select>
                        <Button onClick={nextStep}>Next: Database Setup</Button>
                    </div>
                );
            case 3:
                return (
                   <div className="space-y-4">
                        <p>All set! Let's build your workspace.</p>
                        <Button onClick={() => alert('Provisioning workspace...')}>Finish Setup</Button>
                   </div>
                );
        }
    };

    return (
        <Card className="max-w-2xl mx-auto mt-10">
            <CardHeader><CardTitle>Organization Setup Wizard (Step {step} of 3)</CardTitle></CardHeader>
            <CardContent>
                {renderStep()}
            </CardContent>
        </Card>
    );
}
`;

const tenantDashboardContent = `
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTenants } from '../../hooks/saasHooks';

export default function TenantDashboard() {
    const { data: tenants, isLoading } = useTenants();

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Multi-Tenant SaaS Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader><CardTitle>Total Tenants</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{tenants?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Active Subscriptions</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-green-500">{(tenants || []).filter((t: any) => t.isActive).length}</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader><CardTitle>Tenant Directory</CardTitle></CardHeader>
                <CardContent>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Name</th>
                                <th className="p-2">Subdomain</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(tenants || []).map((t: any) => (
                                <tr key={t.id} className="border-b">
                                    <td className="p-2">{t.name}</td>
                                    <td className="p-2">{t.subdomain}</td>
                                    <td className="p-2">
                                        <span className={t.isActive ? 'text-green-500' : 'text-red-500'}>{t.isActive ? 'Active' : 'Suspended'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
`;

const tenantUsageContent = `
"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function TenantUsage() {
    return (
        <Card>
            <CardHeader><CardTitle>Tenant Usage & Billing</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-100 p-4 rounded dark:bg-gray-800">
                        <span>Storage Usage</span>
                        <span className="font-bold">450 MB / 1 GB</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-100 p-4 rounded dark:bg-gray-800">
                        <span>Active Users</span>
                        <span className="font-bold">12 / 20</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
`

write('store/useSaaSStore.ts', storeContent);
write('hooks/saasHooks.ts', hooksContent);
write('types/saas.ts', typesContent);
write('app/api/v1/saas/tenants/route.ts', apiTenantsRoute);
write('app/api/v1/saas/plans/route.ts', apiPlansRoute);
write('app/api/v1/saas/tenants/[id]/usage/route.ts', apiUsageRoute);
write('repositories/TenantRepository.ts', repoContent);
write('src/components/saas/SetupWizard.tsx', setupWizardContent);
write('src/components/saas/TenantDashboard.tsx', tenantDashboardContent);
write('src/components/saas/TenantUsage.tsx', tenantUsageContent);

console.log('SaaS module files generated.');
