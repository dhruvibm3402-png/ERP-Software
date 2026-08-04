'use client';
import React, { useState } from 'react';
import {
    Gift, Users, Coins, Percent, Wallet, TrendingUp, Award,
    Link as LinkIcon, Search, BarChart3, Star,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────── */
const fmtNum = (n: number) => n.toLocaleString('en-IN');

/* ── KPI stat card ───────────────────────────────────────── */
function StatCard({
    label,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    gradient,
}: {
    label: string;
    value: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    gradient?: string;
}) {
    return (
        <div
            className="card"
            style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: gradient || 'var(--bg-card)',
            }}
        >
            <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: gradient ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {label}
                </p>
                <h3 style={{ fontSize: 26, fontWeight: 700, color: gradient ? '#fff' : 'var(--secondary)' }}>
                    {value}
                </h3>
            </div>
            <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={22} style={{ color: iconColor }} />
            </div>
        </div>
    );
}

/* ── Tier badge ──────────────────────────────────────────── */
function TierBadge({ tier }: { tier: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        Diamond: { bg: 'rgba(59,130,246,0.12)', color: '#2563EB' },
        Gold:    { bg: 'rgba(212,175,55,0.15)',  color: '#B8860B' },
        Silver:  { bg: 'rgba(107,114,128,0.12)', color: '#4B5563' },
        Bronze:  { bg: 'rgba(180,83,9,0.12)',    color: '#92400E' },
    };
    const s = map[tier] ?? map.Silver;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {tier}
        </span>
    );
}

/* ── Tab definitions ─────────────────────────────────────── */
const TABS = [
    { id: 'members',   label: 'Members',   icon: Users    },
    { id: 'tiers',     label: 'Tiers',     icon: Award    },
    { id: 'rewards',   label: 'Rewards',   icon: Gift     },
    { id: 'coupons',   label: 'Coupons',   icon: Percent  },
    { id: 'wallet',    label: 'Wallet',    icon: Wallet   },
    { id: 'referrals', label: 'Referrals', icon: LinkIcon },
];

/* ── Sample data ─────────────────────────────────────────── */
const SAMPLE_MEMBERS = [
    { id: '1', name: 'Anjali Sharma',  mobile: '+91 98765 43210', tier: 'Gold',    balance: 12500, totalEarned: 45000,  joined: 'Oct 12, 2025' },
    { id: '2', name: 'Rahul Desai',    mobile: '+91 91234 56780', tier: 'Diamond', balance: 85200, totalEarned: 120500, joined: 'Jan 05, 2024' },
    { id: '3', name: 'Priya Nair',     mobile: '+91 99887 76655', tier: 'Silver',  balance: 3800,  totalEarned: 12400,  joined: 'Mar 22, 2025' },
    { id: '4', name: 'Suresh Mehta',   mobile: '+91 93456 12344', tier: 'Bronze',  balance: 1200,  totalEarned: 4200,   joined: 'Jun 01, 2025' },
];

const TIER_CONFIG = [
    { tier: 'Bronze',  minSpend: '₹0',      pointsRate: '1 pt / ₹100',    discount: '0%',   color: '#92400E', bg: 'rgba(180,83,9,0.08)' },
    { tier: 'Silver',  minSpend: '₹25,000', pointsRate: '1.5 pt / ₹100',  discount: '2%',   color: '#4B5563', bg: 'rgba(107,114,128,0.08)' },
    { tier: 'Gold',    minSpend: '₹1,00,000',pointsRate: '2 pt / ₹100',   discount: '5%',   color: '#B8860B', bg: 'rgba(212,175,55,0.1)' },
    { tier: 'Diamond', minSpend: '₹5,00,000',pointsRate: '3 pt / ₹100',   discount: '10%',  color: '#2563EB', bg: 'rgba(59,130,246,0.08)' },
];

const SAMPLE_REWARDS = [
    { id: '1', name: 'Free Polishing',        points: 500,   expiry: '31 Dec 2025', status: 'ACTIVE' },
    { id: '2', name: '10% Off Next Purchase', points: 2000,  expiry: '28 Feb 2026', status: 'ACTIVE' },
    { id: '3', name: 'Free Chain Repair',     points: 1500,  expiry: '31 Jan 2026', status: 'ACTIVE' },
    { id: '4', name: 'Birthday Gift Voucher', points: 0,     expiry: 'Birthday',    status: 'SPECIAL' },
];

const SAMPLE_COUPONS = [
    { id: '1', code: 'DIWALI25',  discount: '25% off',  minOrder: '₹10,000', uses: 142, maxUses: 500, expiry: '25 Oct 2025', status: 'ACTIVE'   },
    { id: '2', code: 'GOLD500',   discount: '₹500 off', minOrder: '₹25,000', uses: 500, maxUses: 500, expiry: '31 Dec 2025', status: 'EXHAUSTED' },
    { id: '3', code: 'NEWMEMBER', discount: '5% off',   minOrder: '₹0',      uses: 89,  maxUses: 999, expiry: '31 Mar 2026', status: 'ACTIVE'   },
];

/* ── Tab panels ─────────────────────────────────────────── */
function MembersTab() {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('');
    const filtered = SAMPLE_MEMBERS.filter(m =>
        (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.mobile.includes(search)) &&
        (!tierFilter || m.tier === tierFilter)
    );
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="search-bar" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', margin: 0 }}>
                    <Search size={16} className="text-muted" />
                    <input
                        type="text" placeholder="Search by name or mobile…"
                        className="search-input" value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                    className="btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--secondary)', outline: 'none' }}
                >
                    <option value="">All Tiers</option>
                    {['Bronze','Silver','Gold','Diamond'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                            {['Customer', 'Tier', 'Points Balance', 'Total Earned', 'Joined', 'Actions'].map((h, i) => (
                                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No members found.</td></tr>
                        ) : filtered.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--secondary)' }}>{m.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.mobile}</div>
                                </td>
                                <td style={{ padding: '14px 16px' }}><TierBadge tier={m.tier} /></td>
                                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>{fmtNum(m.balance)}</td>
                                <td style={{ padding: '14px 16px', fontSize: 14 }}>{fmtNum(m.totalEarned)}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{m.joined}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                    <button className="btn" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary)', border: 'none', fontSize: 12, padding: '6px 12px' }}>
                                        View History
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TiersTab() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {TIER_CONFIG.map(t => (
                <div key={t.tier} className="card" style={{ padding: 24, borderLeft: `4px solid ${t.color}`, background: t.bg }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Star size={22} style={{ color: t.color }} />
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--secondary)' }}>{t.tier}</h3>
                        </div>
                        <TierBadge tier={t.tier} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                        {[['Min Spend', t.minSpend], ['Points Rate', t.pointsRate], ['Discount', t.discount]].map(([k, v]) => (
                            <div key={k}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 3 }}>{k}</span>
                                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--secondary)' }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function RewardsTab() {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="font-bold" style={{ color: 'var(--secondary)' }}>Active Rewards</h3>
                <button className="btn btn-primary" style={{ fontSize: 13 }}><Gift size={14} /> Add Reward</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                            {['Reward Name', 'Points Required', 'Expiry', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SAMPLE_REWARDS.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: 'var(--secondary)' }}>{r.name}</td>
                                <td style={{ padding: '14px 16px', fontSize: 14 }}>{r.points === 0 ? '—' : fmtNum(r.points) + ' pts'}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{r.expiry}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{ background: r.status === 'SPECIAL' ? 'rgba(212,175,55,0.15)' : 'rgba(34,197,94,0.12)', color: r.status === 'SPECIAL' ? '#B8860B' : 'var(--success)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                        {r.status}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <button className="icon-btn" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CouponsTab() {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="font-bold" style={{ color: 'var(--secondary)' }}>Coupon Codes</h3>
                <button className="btn btn-primary" style={{ fontSize: 13 }}><Percent size={14} /> Create Coupon</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                            {['Code', 'Discount', 'Min Order', 'Usage', 'Expiry', 'Status'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SAMPLE_COUPONS.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: 6, letterSpacing: '0.1em' }}>{c.code}</span>
                                </td>
                                <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: 'var(--success)' }}>{c.discount}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13 }}>{c.minOrder}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ flex: 1, maxWidth: 80, height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'var(--primary)', width: `${Math.min(100, (c.uses / c.maxUses) * 100)}%` }} />
                                        </div>
                                        <span style={{ color: 'var(--text-muted)' }}>{c.uses}/{c.maxUses}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{c.expiry}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{
                                        background: c.status === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                        color: c.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)',
                                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                                    }}>{c.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WalletTab() {
    return (
        <div className="card" style={{ padding: 24 }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--secondary)' }}>Store Wallet Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Wallet Balance', value: '₹4,82,500', color: 'var(--primary)', bg: 'rgba(212,175,55,0.08)' },
                    { label: 'Credited This Month',  value: '₹28,400',  color: 'var(--success)', bg: 'rgba(34,197,94,0.08)' },
                    { label: 'Redeemed This Month',  value: '₹12,100',  color: 'var(--info)',    bg: 'rgba(59,130,246,0.08)' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: 12, padding: 20, border: `1px solid ${color}22` }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color }}>{value}</p>
                    </div>
                ))}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                Detailed wallet transaction history will appear here once live data is connected.
            </p>
        </div>
    );
}

function ReferralsTab() {
    return (
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
            <LinkIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
            <h3 className="font-bold" style={{ color: 'var(--secondary)', marginBottom: 6 }}>Referral Program</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 380 }}>
                Configure referral bonuses and track customer referrals. Connect with the customer API to enable live data.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 20 }}>
                <BarChart3 size={14} /> Configure Program
            </button>
        </div>
    );
}

/* ── Main component ─────────────────────────────────────── */
export default function Loyalty() {
    const [activeTab, setActiveTab] = useState('members');

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Loyalty & Rewards</h1>
                    <p className="text-muted mt-1">Manage customer loyalty programmes, tiers, rewards and coupons.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                        <BarChart3 size={16} /> Reports
                    </button>
                    <button className="btn btn-primary">
                        <Coins size={16} /> Issue Points
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <StatCard label="Total Members"   value={fmtNum(4289)}        icon={Users}      iconBg="rgba(255,255,255,0.25)" iconColor="#fff"          gradient="linear-gradient(135deg,#6366f1,#7c3aed)" />
                <StatCard label="Points Issued"   value={fmtNum(1204500)}     icon={Coins}      iconBg="rgba(245,158,11,0.12)"  iconColor="#d97706" />
                <StatCard label="Points Redeemed" value={fmtNum(942100)}      icon={TrendingUp} iconBg="rgba(34,197,94,0.12)"   iconColor="var(--success)" />
                <StatCard label="Active Coupons"  value={fmtNum(124)}         icon={Percent}    iconBg="rgba(59,130,246,0.12)"  iconColor="var(--info)" />
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', flexShrink: 0 }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 18px', fontSize: 13, fontWeight: 600,
                            background: 'none', border: 'none', cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            marginBottom: -1,
                            transition: 'color 0.15s',
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 'members'   && <MembersTab />}
                {activeTab === 'tiers'     && <TiersTab />}
                {activeTab === 'rewards'   && <RewardsTab />}
                {activeTab === 'coupons'   && <CouponsTab />}
                {activeTab === 'wallet'    && <WalletTab />}
                {activeTab === 'referrals' && <ReferralsTab />}
            </div>
        </div>
    );
}
