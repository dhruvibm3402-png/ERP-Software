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
