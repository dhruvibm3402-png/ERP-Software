import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { Users, Phone, MapPin, Briefcase } from 'lucide-react';

export default function MfgKarigarList() {
    const { data: karigars, isLoading } = useQuery({
        queryKey: ['karigars'],
        queryFn: async () => {
            const res = await apiClient.get('/manufacturing/karigars');
            return res.data.karigars;
        }
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading Karigars...</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', overflowY: 'auto' }}>
            {karigars?.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No Karigars found.</div>
            ) : (
                karigars?.map((karigar: any) => (
                    <div key={karigar.id} className="card p-0" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                {karigar.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{karigar.name}</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{karigar.karigarId} • {karigar.type}</p>
                            </div>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                <Phone size={14} className="text-gray-400" />
                                <span>{karigar.mobile || 'No Mobile'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                <Briefcase size={14} className="text-gray-400" />
                                <span>{karigar.specialty || 'Generalist'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <MapPin size={14} />
                                <span>{karigar.address || 'No Address'}</span>
                            </div>
                        </div>
                        <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Balance</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: karigar.balance < 0 ? 'var(--danger)' : 'var(--success)' }}>
                                ₹{karigar.balance?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
