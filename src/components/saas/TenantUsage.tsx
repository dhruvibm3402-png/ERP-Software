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
