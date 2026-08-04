import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Box,
  Gem,
  AlertCircle,
  Calendar,
} from 'lucide-react';

const KPICard = ({ title, value, change, isPositive, icon: Icon, colorClass, gradient }) => (
  <div
    className="card"
    style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
  >
    <div
      style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        background: gradient,
        opacity: 0.1,
        borderRadius: '50%',
      }}
    ></div>
    <div className="flex justify-between items-center">
      <span className="text-muted font-medium text-sm">{title}</span>
      <div
        style={{ padding: 8, borderRadius: 8, background: 'var(--bg-primary)' }}
        className={colorClass}
      >
        <Icon size={18} />
      </div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="flex items-center gap-2 mt-1">
      <span className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? (
          <TrendingUp size={14} className="mr-1" />
        ) : (
          <TrendingDown size={14} className="mr-1" />
        )}
        {change}
      </span>
      <span className="text-xs text-muted">vs last month</span>
    </div>
  </div>
);

const BarChartMock = () => {
  const bars = [40, 70, 45, 90, 65, 80, 55, 95, 60, 110, 85, 120];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const max = Math.max(...bars);
  return (
    <div className="chart-container">
      {bars.map((val, idx) => (
        <div key={idx} className="bar-wrap">
          <div className="bar" style={{ height: `${(val / max) * 100}%` }}></div>
          <span className="bar-label">{months[idx]}</span>
        </div>
      ))}
    </div>
  );
};

const AreaChartMock = () => {
  return (
    <div
      className="chart-container"
      style={{ position: 'relative', overflow: 'hidden', paddingBottom: 30 }}
    >
      <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="svg-curve">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--bg-card)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M0,150 Q100,50 200,100 T400,80 T600,120 T800,40 L800,200 L0,200 Z"
          fill="url(#areaGradient)"
        />
        <path
          d="M0,150 Q100,50 200,100 T400,80 T600,120 T800,40"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
        />
      </svg>
      {/* points */}
      <div className="line-point" style={{ left: '0%', top: '75%' }}></div>
      <div className="line-point" style={{ left: '25%', top: '50%' }}></div>
      <div className="line-point" style={{ left: '50%', top: '40%' }}></div>
      <div className="line-point" style={{ left: '75%', top: '60%' }}></div>
      <div className="line-point" style={{ left: '100%', top: '20%' }}></div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span className="bar-label">Week 1</span>
        <span className="bar-label">Week 2</span>
        <span className="bar-label">Week 3</span>
        <span className="bar-label">Week 4</span>
      </div>
    </div>
  );
};

export default function Overview() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin text-primary">
          <Calendar size={32} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
            Executive Dashboard
          </h1>
          <p className="text-muted mt-1">Welcome back, here's your business overview for today.</p>
        </div>
        <div className="flex gap-3">
          <div
            className="search-bar"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              width: 'auto',
            }}
          >
            <Calendar size={18} className="text-muted" />
            <select
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                paddingLeft: 8,
                fontSize: 14,
              }}
              onChange={(e) => toast.success(`Timeframe updated to ${e.target.value}`)}
            >
              <option>Today: Jul 23, 2026</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 1500)), {
                loading: 'Generating Report...',
                success: 'Report exported to Downloads!',
                error: 'Failed',
              })
            }
          >
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="responsive-grid">
        <div className="col-span-3">
          <KPICard
            title="Today's Sales"
            value={`₹${(dashboard?.todaysSales || 0).toLocaleString('en-IN')}`}
            change="+12.5%"
            isPositive={true}
            icon={DollarSign}
            colorClass="text-primary"
            gradient="linear-gradient(135deg, var(--primary), transparent)"
          />
        </div>
        <div className="col-span-3">
          <KPICard
            title="Inventory Value"
            value={`₹${(dashboard?.inventoryValue || 0).toLocaleString('en-IN')}`}
            change="-2.1%"
            isPositive={false}
            icon={Box}
            colorClass="text-info"
            gradient="linear-gradient(135deg, var(--info), transparent)"
          />
        </div>
        <div className="col-span-3">
          <KPICard
            title="Total Customers"
            value={(dashboard?.totalCustomers || 0).toLocaleString('en-IN')}
            change="+8.4%"
            isPositive={true}
            icon={Users}
            colorClass="text-success"
            gradient="linear-gradient(135deg, var(--success), transparent)"
          />
        </div>
        <div className="col-span-3">
          <KPICard
            title="Pending Repairs"
            value={dashboard?.pendingRepairsCount || 0}
            change="+12%"
            isPositive={false}
            icon={AlertCircle}
            colorClass="text-warning"
            gradient="linear-gradient(135deg, var(--warning), transparent)"
          />
        </div>
      </div>

      {/* Live Market Rates (Luxury Touch) */}
      <div
        className="card flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%)',
          color: 'white',
          border: '1px solid #333',
        }}
      >
        <div className="flex items-center gap-4">
          <div style={{ background: 'rgba(212, 175, 55, 0.2)', padding: 12, borderRadius: 12 }}>
            <Gem className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Live Market Rates</h3>
            <p className="text-xs text-gray-400">Updated 2 mins ago</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Gold 24K (10g)</div>
            <div className="font-bold text-xl">
              ₹72,450 <span className="text-success text-sm text-xs">▲</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Gold 22K (10g)</div>
            <div className="font-bold text-xl">
              ₹66,400 <span className="text-success text-sm text-xs">▲</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Silver (1kg)</div>
            <div className="font-bold text-xl">
              ₹92,800 <span className="text-danger text-sm text-xs">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="responsive-grid">
        <div className="col-span-8 card">
          <h3 className="font-semibold mb-4 text-lg">Monthly Revenue Trend</h3>
          <BarChartMock />
        </div>
        <div className="col-span-4 card">
          <h3 className="font-semibold mb-4 text-lg">Sales by Category</h3>
          <div className="flex flex-col items-center justify-center mt-6">
            {/* Mock Pie Chart using CSS conic-gradient */}
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                background:
                  'conic-gradient(var(--primary) 0% 45%, var(--secondary) 45% 75%, var(--accent) 75% 90%, var(--bg-primary) 90% 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  background: 'var(--bg-card)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span className="font-bold text-xl text-primary">45%</span>
                <span className="text-xs text-muted">Gold Rings</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 mt-8 w-full px-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--primary)' }}
                  ></div>{' '}
                  Gold Sets
                </div>
                <span className="font-semibold">45%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 4,
                      background: 'var(--secondary)',
                    }}
                  ></div>{' '}
                  Diamond Rings
                </div>
                <span className="font-semibold">30%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--accent)' }}
                  ></div>{' '}
                  Silver Chains
                </div>
                <span className="font-semibold">15%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 card full-width-tablet">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Purchase Trend</h3>
            <span className="text-xs text-primary font-medium cursor-pointer">
              View full report
            </span>
          </div>
          <AreaChartMock />
        </div>
      </div>
    </div>
  );
}
