'use client';

import React, { useState } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import apiClient from '../../utils/apiClient';
import { Loader2, ArrowRight, Diamond } from 'lucide-react';
import '../../src/index.css';

const registerSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Valid email is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useRHForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setServerError('');
        setSuccessMsg('');
        try {
            await apiClient.post('/auth/register', data);
            setSuccessMsg('Registration successful! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'url("https://images.unsplash.com/photo-1620666012028-2d7c5dc6e969?q=80&w=2000&auto=format&fit=crop") center/cover no-repeat', // elegant dark jewellery aesthetic
            position: 'relative'
        }}>
            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.95) 100%)', backdropFilter: 'blur(8px)' }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', zIndex: 1, justifyContent: 'space-between', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Diamond size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>AURA ERP</span>
                </div>
                <div style={{ maxWidth: 500 }}>
                    <h1 style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Join the Aura<br />network.
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        Streamline your entire jewellery business with precision, speed, and elegance matching the diamonds you sell.
                    </p>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    © {new Date().getFullYear()} Aura Systems Inc. All rights reserved.
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: '40px' }}>
                <div style={{
                    width: '100%',
                    maxWidth: 480,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '40px 48px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Register a new access node for the system.</p>

                    {serverError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.875rem' }}>{serverError}</div>}
                    {successMsg && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.875rem' }}>{successMsg}</div>}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>Full Name</label>
                            <input type="text" {...register('name')} style={{ width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.2s' }} placeholder="John Doe" onFocus={(e) => e.target.style.border = '1px solid #fbbf24'} onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'} />
                            {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.name.message}</span>}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>Email Address</label>
                            <input type="email" {...register('email')} style={{ width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.2s' }} placeholder="admin@auraerp.com" onFocus={(e) => e.target.style.border = '1px solid #fbbf24'} onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'} />
                            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.email.message}</span>}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>Password</label>
                            <input type="password" {...register('password')} style={{ width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.2s' }} placeholder="••••••••" onFocus={(e) => e.target.style.border = '1px solid #fbbf24'} onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'} />
                            {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.password.message}</span>}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>System Role</label>
                            <select {...register('role')} style={{ width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.2s', appearance: 'none', cursor: 'pointer' }} onFocus={(e) => e.target.style.border = '1px solid #fbbf24'} onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}>
                                <option value="STAFF" style={{ background: '#1e293b' }}>Cashier / Staff</option>
                                <option value="MANAGER" style={{ background: '#1e293b' }}>Store Manager</option>
                                <option value="ADMIN" style={{ background: '#1e293b' }}>Super Admin</option>
                            </select>
                        </div>

                        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', transition: 'all 0.2s', transform: isLoading ? 'scale(0.98)' : 'scale(1)' }}>
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Register Account <ArrowRight size={18} /></span>}
                        </button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                        Already have an account? <a href="/login" style={{ color: 'white', fontWeight: 600, textDecoration: 'none', marginLeft: '4px', borderBottom: '1px solid #fbbf24' }}>Return to Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
