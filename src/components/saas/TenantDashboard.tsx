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
