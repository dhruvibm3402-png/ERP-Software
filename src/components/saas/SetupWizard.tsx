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
