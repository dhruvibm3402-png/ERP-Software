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
