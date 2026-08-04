import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import '../src/index.css';

export default function NotFound() {
    return (
        <div className="app-layout justify-center items-center" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, #E8EBEF 100%)', minHeight: '100vh', display: 'flex' }}>
            <div className="card text-center" style={{ maxWidth: 480, padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'linear-gradient(135deg, var(--primary), transparent)', opacity: 0.1, borderRadius: '50%' }}></div>

                <div className="flex flex-col items-center mb-6">
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}
                    >
                        <ShieldAlert size={40} className="text-danger" style={{ color: 'var(--danger)' }} />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-2" style={{ color: 'var(--secondary)' }}>404</h1>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>Page Not Found</h2>
                    <p className="text-muted text-sm px-4">
                        The page you are looking for does not exist or has been moved.
                        If you expected to see the dashboard, please return to the main entry point.
                    </p>
                </div>

                <Link href="/" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary w-full" style={{ height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}
