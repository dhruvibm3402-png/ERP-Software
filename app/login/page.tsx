'use client';

import React, { useState } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import apiClient from '../../utils/apiClient';
import { Loader2, ArrowRight, Diamond } from 'lucide-react';
import '../../src/index.css';

const loginSchema = z.object({
    email: z.string().email({ message: 'Valid email is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useRHForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setServerError('');
        try {
            const response = await apiClient.post('/auth/login', data);
            const { user, accessToken } = response.data;
            setAuth(user, accessToken);

            if (user.role === 'ADMIN') router.push('/');
            else if (user.role === 'MANAGER') router.push('/?tab=dashboard');
            else router.push('/?tab=pos');
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'url("https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=2000&auto=format&fit=crop") center/cover no-repeat',
            // Or alternatively a sleek dark gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
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
                        The future of<br />jewellery retail.
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        Aura ERP combines beautiful aesthetics with enterprise-grade management, empowering your business to scale effortlessly.
                    </p>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    © {new Date().getFullYear()} Aura Systems Inc. All rights reserved.
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: '40px' }}>
                <div style={{
                    width: '100%',
                    maxWidth: 440,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Welcome back</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Please enter your credentials to continue.</p>

                    {serverError && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.875rem' }}>
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>Email Address</label>
                            <input
                                type="email"
                                {...register('email')}
                                style={{
                                    width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.2s', fontSize: '1rem'
                                }}
                                placeholder="name@auraerp.com"
                                onFocus={(e) => e.target.style.border = '1px solid #fbbf24'}
                                onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
                            />
                            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.email.message}</span>}
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>Password</label>
                                <a href="#" style={{ fontSize: '0.875rem', color: '#fbbf24', textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                {...register('password')}
                                style={{
                                    width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.2s', fontSize: '1rem'
                                }}
                                placeholder="••••••••"
                                onFocus={(e) => e.target.style.border = '1px solid #fbbf24'}
                                onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
                            />
                            {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.password.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%', padding: '14px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', transition: 'all 0.2s', transform: isLoading ? 'scale(0.98)' : 'scale(1)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Sign In <ArrowRight size={18} /></span>}
                        </button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                        Don't have an account? <a href="/register" style={{ color: '#white', fontWeight: 600, textDecoration: 'none', marginLeft: '4px', borderBottom: '1px solid #fbbf24' }}>Request Access</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
