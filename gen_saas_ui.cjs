const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const featureUI = `
"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export default function FeatureManagement() {
    return (
        <Card className="max-w-xl mx-auto mt-6">
            <CardHeader><CardTitle>Feature toggles</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="font-bold">POS Module</Label>
                            <p className="text-sm text-gray-500">Enable Point of Sale system</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="font-bold">Advanced Analytics</Label>
                            <p className="text-sm text-gray-500">Only available on Pro plan</p>
                        </div>
                        <Switch disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="font-bold">Gold Exchange</Label>
                            <p className="text-sm text-gray-500">Enable old gold exchange workflow</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
`;

const importExportUI = `
"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export default function DataImportExport() {
    return (
        <Card className="max-w-2xl mx-auto mt-6">
            <CardHeader><CardTitle>Data Sync</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border rounded shadow-sm dark:border-gray-800">
                        <h3 className="font-bold mb-2">Import Data</h3>
                        <p className="text-sm text-gray-500 mb-4">Upload CSV/Excel to bulk insert inventory, customers or sales.</p>
                        <input type="file" className="block w-full text-sm mb-4" />
                        <Button className="w-full">Upload & Import</Button>
                    </div>
                    <div className="p-4 border rounded shadow-sm dark:border-gray-800">
                        <h3 className="font-bold mb-2">Export Backup</h3>
                        <p className="text-sm text-gray-500 mb-4">Download your tenant's complete dataset in JSON or tabular format.</p>
                        <select className="w-full mb-4 p-2 border rounded">
                            <option>Export Inventory</option>
                            <option>Export Customers</option>
                            <option>Full Database Backup</option>
                        </select>
                        <Button variant="secondary" className="w-full">Start Export</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
`;

write('src/components/saas/FeatureManagement.tsx', featureUI);
write('src/components/saas/DataImportExport.tsx', importExportUI);
write('src/components/saas/index.ts', `
export { default as SetupWizard } from './SetupWizard';
export { default as TenantDashboard } from './TenantDashboard';
export { default as TenantUsage } from './TenantUsage';
export { default as Billing } from './Billing';
export { default as DomainManagement } from './DomainManagement';
export { default as FeatureManagement } from './FeatureManagement';
export { default as DataImportExport } from './DataImportExport';
`);

console.log('Final UI components generated.');
