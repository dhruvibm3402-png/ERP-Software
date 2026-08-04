'use client';
import React, { useState } from 'react';
import {
    ChevronLeft, Edit, Phone, Mail, MapPin, CreditCard, Award, Star,
    Package, Wrench, Gem, DollarSign, FileText, StickyNote, Clock,
    Loader2, ShoppingBag, User, Calendar, AlertCircle, CheckCircle,
    XCircle, TrendingUp, RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';

/* ── helpers ─────────────────────────────────────────────── */
const fmt = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d: any) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function Badge({ label, color }: { label: string; color: 'gold' | 'green' | 'blue' | 'red' | 'gray' | 'purple' }) {
    const map = {
        gold:   { bg: 'rgba(212,175,55,0.15)',  color: '#B8860B' },
        green:  { bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
        blue:   { bg: 'rgba(59,130,246,0.12)',  color: '#2563EB' },
        red:    { bg: 'rgba(239,68,68,0.12)',   color: '#DC2626' },
        gray:   { bg: 'rgba(107,114,128,0.12)', color: '#4B5563' },
        purple: { bg: 'rgba(168,85,247,0.12)',  color: '#7C3AED' },
    };
    const s = map[color];
    return (
        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = status?.toUpperCase();
    if (['PAID', 'DELIVERED', 'COMPLETED', 'EXCHANGED', 'INVOICED'].includes(s))   return <Badge label={status} color="green" />;
    if (['UNDER_REPAIR', 'IN_PROGRESS', 'VALUED', 'READY'].includes(s))             return <Badge label={status} color="blue" />;
    if (['CANCELLED', 'FAILED', 'REFUNDED'].includes(s))                            return <Badge label={status} color="red" />;
    if (['DRAFT', 'INITIATED', 'RECEIVED', 'PENDING'].includes(s))                  return <Badge label={status} color="gray" />;
    return <Badge label={status} color="purple" />;
}

function TierBadge({ tier }: { tier: string }) {
    if (tier === 'Platinum') return <Badge label="Platinum" color="purple" />;
    if (tier === 'Gold')     return <Badge label="Gold"     color="gold"   />;
    return                          <Badge label="Silver"   color="gray"   />;
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center" style={{ padding: 64, opacity: 0.45 }}>
            <Icon size={48} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>No {label} found</p>
        </div>
    );
}

/* ── Left profile card ────────────────────────────────────── */
function ProfileCard({ c, onEdit }: { c: any; onEdit: () => void }) {
    const initials = c.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div className="card flex flex-col gap-4" style={{ padding: 24, minWidth: 260, width: 280 }}>
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%', fontSize: 28, fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--primary) 0%, #8B6914 100%)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
                }}>{initials}</div>
                <div className="flex flex-col items-center gap-1">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--secondary)', textAlign: 'center' }}>{c.name}</h2>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{c.customerId}</span>
                    <TierBadge tier={c.tier} />
                </div>
                <button onClick={onEdit} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 6 }}>
                    <Edit size={14} /> Edit Customer
                </button>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</h4>
                <div className="flex items-center gap-2">
                    <Phone size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13 }}>{c.mobile}</span>
                </div>
                {c.email && <div className="flex items-center gap-2">
                    <Mail size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, wordBreak: 'break-all' }}>{c.email}</span>
                </div>}
                {c.address && <div className="flex items-start gap-2">
                    <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13 }}>{c.address}</span>
                </div>}
            </div>

            {/* Identity */}
            <div className="flex flex-col gap-3" style={{ paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Identity</h4>
                {[['Aadhaar', c.aadhaar], ['PAN', c.pan], ['GST', c.gstNumber]].map(([k, v]) => v ? (
                    <div key={k} className="flex justify-between">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
                    </div>
                ) : null)}
                {c.birthday && <div className="flex justify-between">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Birthday</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{fmtDate(c.birthday)}</span>
                </div>}
                {c.anniversary && <div className="flex justify-between">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Anniversary</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{fmtDate(c.anniversary)}</span>
                </div>}
            </div>

            {/* Loyalty */}
            <div className="flex flex-col gap-2" style={{ paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Loyalty & Finance</h4>
                <div style={{ background: 'rgba(212,175,55,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Points</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{(c.loyaltyPoints || 0).toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div style={{ background: 'var(--danger-bg)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Outstanding</span>
                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{fmt(c.outstandingBalance)}</span>
                    </div>
                </div>
                <div className="flex justify-between" style={{ fontSize: 12, marginTop: 2 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Spent</span>
                    <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{fmt(c.totalSpent)}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Last Visit</span>
                    <span style={{ fontWeight: 600 }}>{fmtDate(c.lastVisit)}</span>
                </div>
            </div>

            {/* Notes */}
            {c.notes && (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</h4>
                    <p style={{ fontSize: 13, color: 'var(--secondary)', lineHeight: 1.6 }}>{c.notes}</p>
                </div>
            )}
        </div>
    );
}

/* ── Stats bar ───────────────────────────────────────────── */
function StatsBar({ stats }: { stats: any }) {
    if (!stats) return null;
    const items = [
        { label: 'Total Purchases',    value: stats.totalSales,              icon: ShoppingBag,  color: 'var(--primary)'  },
        { label: 'Purchase Value',     value: fmt(stats.totalSaleValue),     icon: TrendingUp,   color: 'var(--success)'  },
        { label: 'Repair Jobs',        value: stats.totalRepairs,            icon: Wrench,       color: 'var(--info)'     },
        { label: 'Gold Exchanges',     value: stats.totalGoldExchanges,      icon: Gem,          color: '#9333EA'         },
        { label: 'Exchange Value',     value: fmt(stats.totalGoldExchangeValue), icon: RefreshCw, color: '#D97706'       },
        { label: 'Total Payments',     value: fmt(stats.totalPayments),      icon: CreditCard,   color: 'var(--accent)'   },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {items.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--secondary)' }}>{value}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Tab panels ─────────────────────────────────────────── */
function OverviewTab({ c, stats }: { c: any; stats: any }) {
    const fields = [
        ['Customer ID', c.customerId], ['Tier', c.tier], ['Mobile', c.mobile],
        ['Email', c.email || '—'], ['Address', c.address || '—'], ['GST Number', c.gstNumber || '—'],
        ['Aadhaar', c.aadhaar || '—'], ['PAN', c.pan || '—'],
        ['Birthday', fmtDate(c.birthday)], ['Anniversary', fmtDate(c.anniversary)],
        ['Loyalty Points', (c.loyaltyPoints || 0).toLocaleString('en-IN')],
        ['Total Spent', fmt(c.totalSpent)], ['Outstanding Balance', fmt(c.outstandingBalance)],
        ['Last Visit', fmtDate(c.lastVisit)], ['Member Since', fmtDate(c.createdAt)],
    ];
    return (
        <div className="flex flex-col gap-4">
            <StatsBar stats={stats} />
            <div className="card" style={{ padding: 24 }}>
                <h3 className="font-bold mb-4" style={{ color: 'var(--secondary)' }}>Customer Profile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                    {fields.map(([k, v]) => (
                        <div key={k}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>{k}</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--secondary)' }}>{v}</span>
                        </div>
                    ))}
                </div>
                {c.notes && (
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Notes</span>
                        <p style={{ fontSize: 14, color: 'var(--secondary)', lineHeight: 1.7 }}>{c.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PurchaseHistoryTab({ sales }: { sales: any[] }) {
    if (!sales?.length) return <EmptyState icon={Package} label="purchase history" />;
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                        {['Invoice #', 'Date', 'Items', 'Subtotal', 'Discount', 'GST', 'Grand Total', 'Paid', 'Status'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: h === 'Grand Total' || h === 'Paid' ? 'right' : 'left' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sales.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(inv.createdAt)}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13 }}>{inv.items?.length ?? 0}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13 }}>{fmt(inv.subTotal)}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--success)' }}>{fmt(inv.discount)}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13 }}>{fmt(inv.gstTotal)}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{fmt(inv.grandTotal)}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{fmt(inv.paidAmount)}</td>
                            <td style={{ padding: '12px 16px' }}><StatusBadge status={inv.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PaymentHistoryTab({ payments }: { payments: any[] }) {
    if (!payments?.length) return <EmptyState icon={CreditCard} label="payments" />;
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                        {['Date', 'Invoice #', 'Method', 'Reference', 'Amount'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(p.createdAt)}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{p.invoiceNumber}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13 }}>
                                <Badge label={p.method} color={p.method === 'CASH' ? 'green' : p.method === 'CARD' ? 'blue' : 'gold'} />
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{p.reference || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, textAlign: 'right', color: 'var(--success)' }}>{fmt(p.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function GoldExchangeTab({ exchanges }: { exchanges: any[] }) {
    if (!exchanges?.length) return <EmptyState icon={Gem} label="gold exchange records" />;
    return (
        <div className="flex flex-col gap-3">
            {exchanges.map(ex => (
                <div key={ex.id} className="card" style={{ padding: 20 }}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--secondary)' }}>{ex.exchangeNumber}</span>
                            <span style={{ marginLeft: 10 }}><StatusBadge status={ex.status} /></span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(ex.createdAt)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 20px', fontSize: 13 }}>
                        {[
                            ['Purity', ex.purityLabel || '—'],
                            ['Final Weight', ex.finalWeight ? `${ex.finalWeight}g` : '—'],
                            ['Gold Rate', ex.goldRatePerGram ? `${fmt(ex.goldRatePerGram)}/g` : '—'],
                            ['Net Value', ex.netExchangeValue ? fmt(ex.netExchangeValue) : '—'],
                            ['Exchange Mode', ex.exchangeMode || '—'],
                            ['Cash Payout', fmt(ex.cashPayout)],
                            ['Balance Due', fmt(ex.balanceDue)],
                            ['Items', ex.items?.length ?? 0],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>{k}</span>
                                <span style={{ fontWeight: 600 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function RepairHistoryTab({ repairs }: { repairs: any[] }) {
    if (!repairs?.length) return <EmptyState icon={Wrench} label="repair records" />;
    return (
        <div className="flex flex-col gap-3">
            {repairs.map(r => (
                <div key={r.id} className="card" style={{ padding: 20 }}>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--secondary)' }}>{r.jobNumber}</span>
                            <StatusBadge status={r.status} />
                            <Badge label={r.priority} color={r.priority === 'URGENT' ? 'red' : r.priority === 'HIGH' ? 'gold' : 'gray'} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(r.createdAt)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 20px', fontSize: 13 }}>
                        {[
                            ['Product', r.productType],
                            ['Repair Type', r.repairType?.replace(/_/g, ' ')],
                            ['Assigned To', r.employee?.name || '—'],
                            ['Est. Cost', fmt(r.estimatedCost)],
                            ['Final Cost', fmt(r.finalCost)],
                            ['Advance Paid', fmt(r.advancePaid)],
                            ['Balance Due', fmt(r.balanceDue)],
                            ['Est. Date', fmtDate(r.estimatedDate)],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>{k}</span>
                                <span style={{ fontWeight: 600 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    {r.issueDescription && (
                        <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                            <strong>Issue:</strong> {r.issueDescription}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

function NotesTab({ c }: { c: any }) {
    return (
        <div className="card" style={{ padding: 24 }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--secondary)' }}>Customer Notes</h3>
            {c.notes ? (
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--secondary)', background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>{c.notes}</p>
            ) : (
                <EmptyState icon={StickyNote} label="notes" />
            )}
        </div>
    );
}

function DocumentsTab({ c }: { c: any }) {
    const docs = [
        { label: 'Aadhaar Card', value: c.aadhaar, icon: CreditCard },
        { label: 'PAN Card',     value: c.pan,     icon: FileText    },
        { label: 'GST Number',   value: c.gstNumber, icon: FileText  },
    ].filter(d => d.value);
    if (!docs.length) return <EmptyState icon={FileText} label="documents" />;
    return (
        <div className="card" style={{ padding: 24 }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--secondary)' }}>Identity Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {docs.map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 20, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="flex items-center gap-2">
                            <Icon size={18} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em' }}>{value}</span>
                        <Badge label="Verified" color="green" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function ActivityTimelineTab({ timeline }: { timeline: any[] }) {
    if (!timeline?.length) return <EmptyState icon={Clock} label="activity" />;
    const iconMap: Record<string, any> = {
        SALE: ShoppingBag, REPAIR: Wrench, GOLD_EXCHANGE: Gem,
        AUDIT: Clock, CUSTOM_ORDER: Star,
    };
    const colorMap: Record<string, string> = {
        SALE: 'var(--success)', REPAIR: 'var(--info)', GOLD_EXCHANGE: 'var(--primary)',
        AUDIT: 'var(--text-muted)', CUSTOM_ORDER: '#9333EA',
    };
    return (
        <div className="card" style={{ padding: 24 }}>
            <h3 className="font-bold mb-6" style={{ color: 'var(--secondary)' }}>Activity Timeline</h3>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 17, top: 0, bottom: 0, width: 2, background: 'var(--border-color)' }} />
                <div className="flex flex-col gap-4">
                    {timeline.slice(0, 60).map((item, i) => {
                        const Icon = iconMap[item.type] || Clock;
                        const color = colorMap[item.type] || 'var(--text-muted)';
                        return (
                            <div key={item.id || i} className="flex gap-4" style={{ position: 'relative' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                    <Icon size={14} style={{ color }} />
                                </div>
                                <div style={{ flex: 1, paddingTop: 6 }}>
                                    <div className="flex justify-between items-start">
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)' }}>{item.action}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>{fmtDateTime(item.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.details}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ── Main component ─────────────────────────────────────── */
const TABS = [
    { id: 'overview',   label: 'Overview',             icon: User         },
    { id: 'purchase',   label: 'Purchase History',     icon: Package      },
    { id: 'payment',    label: 'Payment History',      icon: CreditCard   },
    { id: 'exchange',   label: 'Gold Exchange',        icon: Gem          },
    { id: 'repair',     label: 'Repair History',       icon: Wrench       },
    { id: 'documents',  label: 'Documents',            icon: FileText     },
    { id: 'notes',      label: 'Notes',                icon: StickyNote   },
    { id: 'timeline',   label: 'Activity Timeline',   icon: Clock        },
];

export default function CustomerProfile({
    customer,
    onBack,
    onEdit,
}: {
    customer: any;
    onBack: () => void;
    onEdit?: (c: any) => void;
}) {
    const [activeTab, setActiveTab] = useState('overview');

    const { data, isLoading } = useQuery({
        queryKey: ['customer-full', customer.id],
        queryFn: async () => {
            const res = await apiClient.get(`/customers/${customer.id}?include=full`);
            return res.data;
        },
    });

    const c = data ?? customer;

    return (
        <div className="flex flex-col h-full gap-4">
            {/* ── Topbar ── */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="icon-btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Customer Details</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{c.name} · {c.customerId}</p>
                </div>
                {isLoading && <Loader2 size={18} className="animate-spin" style={{ color: 'var(--primary)', marginLeft: 8 }} />}
            </div>

            {/* ── Layout: left card + right content ── */}
            <div className="flex gap-4 flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>
                {/* Left profile card — fixed width, scrollable */}
                <div style={{ overflowY: 'auto', flexShrink: 0 }}>
                    <ProfileCard c={c} onEdit={() => onEdit?.(c)} />
                </div>

                {/* Right content */}
                <div className="flex flex-col flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                    {/* Tab bar */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 16, overflowX: 'auto', flexShrink: 0 }}>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '10px 16px', fontSize: 13, fontWeight: 600,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    whiteSpace: 'nowrap', transition: 'color 0.2s',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                    marginBottom: -1,
                                }}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content — scrollable */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {isLoading && !data ? (
                            <div className="flex items-center justify-center" style={{ height: 200 }}>
                                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview'  && <OverviewTab c={c} stats={data?.stats} />}
                                {activeTab === 'purchase'  && <PurchaseHistoryTab sales={data?.sales ?? []} />}
                                {activeTab === 'payment'   && <PaymentHistoryTab payments={data?.ExchangePayment ?? []} />}
                                {activeTab === 'exchange'  && <GoldExchangeTab exchanges={data?.goldExchanges ?? []} />}
                                {activeTab === 'repair'    && <RepairHistoryTab repairs={data?.repairs ?? []} />}
                                {activeTab === 'documents' && <DocumentsTab c={c} />}
                                {activeTab === 'notes'     && <NotesTab c={c} />}
                                {activeTab === 'timeline'  && <ActivityTimelineTab timeline={data?.activityTimeline ?? []} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
