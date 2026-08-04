const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const serviceContent = `
import { TenantRepository } from '../repositories/TenantRepository';

const repo = new TenantRepository();

export class TenantService {
    async getAllTenants() {
        return repo.findAll();
    }

    async getTenant(id: string) {
        return repo.findById(id);
    }

    async registerTenant(data: any) {
        // Business logic: check limits, provision, etc.
        return repo.createTenant({
            name: data.name,
            subdomain: data.subdomain,
            currency: data.currency || 'USD',
            timezone: data.timezone || 'UTC'
        });
    }
}
`;

const seedDataContent = `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const plan1 = await prisma.subscriptionPlan.create({
        data: {
            name: 'Basic',
            priceMonthly: 49,
            priceYearly: 490,
            userLimit: 5,
            branchLimit: 1,
            features: JSON.stringify(['POS', 'INVENTORY']),
        }
    });

    const tenant1 = await prisma.tenant.create({
        data: {
            name: 'Acme Jewellers',
            subdomain: 'acme',
            Subscription: {
                create: { planId: plan1.id, status: 'ACTIVE' }
            }
        }
    });

    console.log('Seeded tenant:', tenant1);
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

const validationSchemaContent = `
import { z } from 'zod';

export const createTenantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/, "Invalid subdomain"),
    currency: z.string().optional(),
    timezone: z.string().optional()
});

export const updateTenantSchema = createTenantSchema.partial();
`;

const middlewareContent = `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const hostname = req.headers.get('host') || '';
    
    // Custom domain extraction
    const currentHost = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace(\`.$\{process.env.NEXT_PUBLIC_ROOT_DOMAIN}\`, '')
      : hostname.replace(\`.localhost:3000\`, '');

    // Skip middleware for API and static files
    if (req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/_next')) {
        // Here we could inject standard tenant resolution based on hostname or API key for APIs
        return NextResponse.next();
    }

    if (currentHost !== 'localhost:3000' && currentHost !== process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
       console.log('Resolving tenant for subdomain:', currentHost);
       // Rewrite logic could go here
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
`;

const billingUIContent = `
"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export default function Billing() {
    return (
        <Card className="w-full max-w-4xl mx-auto mt-6">
            <CardHeader><CardTitle>Billing & Invoices</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-green-50 p-4 border border-green-200 rounded text-green-900 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                        <div>
                            <p className="font-bold">Pro Plan (Active)</p>
                            <p className="text-sm">Next billing date: Oct 1, 2026</p>
                        </div>
                        <Button variant="outline">Manage Plan</Button>
                    </div>

                    <h3 className="font-bold text-lg mt-6">Invoice History</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Date</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">Sep 1, 2026</td>
                                <td className="p-2">$99.00</td>
                                <td className="p-2 text-green-600">Paid</td>
                                <td className="p-2"><Button size="sm" variant="ghost">PDF</Button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
`;

const domainUIContent = `
"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function DomainManagement() {
    return (
        <Card className="max-w-xl">
            <CardHeader><CardTitle>Custom Domain Settings</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Connect your custom domain (e.g., erp.myjewellers.com)</p>
                    <div className="flex gap-2">
                        <Input placeholder="erp.mycompany.com" />
                        <Button>Connect</Button>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-bold mb-2">DNS Records to configure:</h4>
                        <pre className="bg-gray-100 p-2 rounded text-sm dark:bg-gray-800">CNAME  |  cname.jewelleryerp.com</pre>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
`;

write('services/TenantService.ts', serviceContent);
write('prisma/seed_saas.cjs', seedDataContent.replace(/import { PrismaClient }/g, 'const { PrismaClient } = require').replace(/'@prisma\/client';/g, "('@prisma/client');\n"));
write('schemas/saas.schema.ts', validationSchemaContent);
write('middleware.ts', middlewareContent);
write('src/components/saas/Billing.tsx', billingUIContent);
write('src/components/saas/DomainManagement.tsx', domainUIContent);

console.log('Rest of Saas architecture generated.');
