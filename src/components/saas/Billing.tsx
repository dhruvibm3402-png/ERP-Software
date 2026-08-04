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
