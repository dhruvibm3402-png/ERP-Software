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
