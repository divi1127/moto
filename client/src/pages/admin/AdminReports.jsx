import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Card from '../../components/ui/Card';
import { PageHeader, SectionTitle, Tabs, PageState, usePageLoading } from './adminShared';
import KPICard from '../../components/ui/KPICard';
import { format, subDays, subWeeks, addDays } from 'date-fns';
import { monthlyRevenue } from '../../data/mockData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  IndianRupee, TrendingUp, Users, Wrench, CheckCircle2, Clock, Repeat,
  Percent, Building2, Timer, CalendarCheck
} from 'lucide-react';

const TOOLTIP_STYLE = { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' };

const genRevenue = seed => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return 14000 + (h % 82) * 140;
};

const YEARLY_DATA = [
  { year: '2021', revenue: 680000, bookings: 96 },
  { year: '2022', revenue: 1150000, bookings: 168 },
  { year: '2023', revenue: 1840000, bookings: 251 },
  { year: '2024', revenue: 2490000, bookings: 338 },
  { year: '2025', revenue: 3260000, bookings: 412 },
  { year: '2026', revenue: 3140000, bookings: 384 },
];

export default function AdminReports() {
  const { users, bookings, payments, jobCards } = useStore();
  const loading = usePageLoading();
  const [tab, setTab] = useState('revenue');
  const [range, setRange] = useState('monthly');

  const dailyData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - 6);
    return { label: format(d, 'EEE'), revenue: genRevenue(format(d, 'yyyyMMdd')) };
  }), []);

  const weeklyData = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const d = subWeeks(new Date(), 7 - i);
    return { label: format(d, 'dd MMM'), revenue: genRevenue(format(d, 'yyyyww')) };
  }), []);

  const monthly = useMemo(() => monthlyRevenue.map(m => ({ ...m })), []);

  const ranges = {
    daily: { label: 'Daily', data: dailyData },
    weekly: { label: 'Weekly', data: weeklyData },
    monthly: { label: 'Monthly', data: monthly },
    yearly: { label: 'Yearly', data: YEARLY_DATA },
  };
  const rangeData = ranges[range].data;
  const rangeKey = range === 'yearly' ? 'year' : range === 'monthly' ? 'month' : 'label';

  const rangeStats = useMemo(() => {
    const total = rangeData.reduce((s, d) => s + d.revenue, 0);
    const bookingsTotal = rangeData.reduce((s, d) => s + (d.bookings || 0), 0);
    return { total, count: rangeData.length, bookings: bookingsTotal, avg: rangeData.length ? Math.round(total / rangeData.length) : 0 };
  }, [rangeData]);

  const serviceCounts = useMemo(() => {
    const map = {};
    bookings.forEach(b => (b.services || []).forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).map(([name, count]) => ({ name: name.length > 22 ? `${name.slice(0, 22)}…` : name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 8);
  }, [bookings]);

  const serviceRevenue = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const svcs = b.services || [];
      if (!svcs.length) return;
      const share = (b.total || 0) / svcs.length;
      svcs.forEach(s => { map[s] = (map[s] || 0) + share; });
    });
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);
  const topRevenueService = serviceRevenue[0] || null;

  const customerStats = useMemo(() => {
    const customers = users.filter(u => u.role === 'customer');
    const thirtyDaysAgo = subDays(new Date(), 30);
    const newCustomers = customers.filter(u => new Date(u.createdAt) > thirtyDaysAgo);
    const returning = customers.length - newCustomers.length;
    const returningRate = customers.length ? Math.round((returning / customers.length) * 100) : 0;
    const avgBookings = customers.length ? (bookings.length / customers.length).toFixed(1) : '0';
    const revenuePerCustomer = customers.length ? Math.round(payments.reduce((s, p) => s + p.amount, 0) / customers.length) : 0;
    return {
      total: customers.length,
      newCount: newCustomers.length,
      returningCount: returning,
      returningRate,
      avgBookings,
      revenuePerCustomer,
      pie: [
        { name: 'New (30 days)', value: newCustomers.length, color: '#f59e0b' },
        { name: 'Returning', value: returning, color: '#10b981' },
      ],
    };
  }, [users, bookings, payments]);

  const workshopStats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed').length;
    const inProgress = bookings.filter(b => ['in-progress', 'painting', 'detailing', 'ceramic', 'quality-check'].includes(b.status)).length;
    const pending = bookings.filter(b => ['pending', 'confirmed', 'received', 'inspection', 'approved'].includes(b.status)).length;

    const staffMap = {};
    jobCards.forEach(jc => {
      (jc.assignedStaff || []).forEach(sid => {
        staffMap[sid] = staffMap[sid] || { total: 0, done: 0 };
        staffMap[sid].total += 1;
        if (jc.status === 'completed') staffMap[sid].done += 1;
      });
    });

    const staffPerf = Object.entries(staffMap).map(([id, v]) => {
      const u = users.find(x => x.id === id);
      return { id, name: u?.name || 'Unassigned', specialization: u?.specialization || 'General', ...v, rate: v.total ? Math.round((v.done / v.total) * 100) : 0 };
    });

    const leadTimes = bookings
      .filter(b => b.status === 'completed' && b.createdAt && b.date)
      .map(b => Math.max(1, Math.round((new Date(b.date) - new Date(b.createdAt)) / 86400000)));
    const avgTurnaround = leadTimes.length ? (leadTimes.reduce((s, x) => s + x, 0) / leadTimes.length).toFixed(1) : '—';

    return { completed, inProgress, pending, avgTurnaround, staffPerf };
  }, [bookings, jobCards, users]);

  const kpis = {
    services: [
      { title: 'Most Booked Service', value: serviceCounts[0]?.count || 0, icon: CalendarCheck, color: '#f59e0b' },
      { title: 'Service Categories', value: new Set(bookings.flatMap(b => b.services || [])).size, icon: Wrench, color: '#8b5cf6' },
      { title: 'Total Bookings', value: bookings.length, icon: TrendingUp, color: '#3b82f6' },
      { title: 'Top Service Revenue', value: topRevenueService?.revenue || 0, icon: IndianRupee, color: '#22c55e' },
    ],
    customers: [
      { title: 'Total Customers', value: customerStats.total, icon: Users, color: '#3b82f6' },
      { title: 'New (30 days)', value: customerStats.newCount, icon: Repeat, color: '#f59e0b' },
      { title: 'Returning Rate', value: `${customerStats.returningRate}%`, icon: Percent, color: '#10b981' },
      { title: 'Revenue / Customer', value: customerStats.revenuePerCustomer, icon: IndianRupee, color: '#22c55e' },
    ],
    workshop: [
      { title: 'Completed Jobs', value: workshopStats.completed, icon: CheckCircle2, color: '#10b981' },
      { title: 'In Progress', value: workshopStats.inProgress, icon: Wrench, color: '#f97316' },
      { title: 'Pending Jobs', value: workshopStats.pending, icon: Clock, color: '#f59e0b' },
      { title: 'Avg Turnaround', value: `${workshopStats.avgTurnaround} days`, icon: Timer, color: '#8b5cf6' },
    ],
  };

  const chartCartesian = <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />;

  const content = (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Real-time performance across revenue, services, customers and the workshop." />

      <Tabs
        tabs={[
          { value: 'revenue', label: 'Revenue' },
          { value: 'services', label: 'Services' },
          { value: 'customers', label: 'Customers' },
          { value: 'workshop', label: 'Workshop' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'revenue' && (
        <motion.div key="revenue" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Sales" value={rangeStats.total} icon={IndianRupee} color="#22c55e" />
            <KPICard title="Avg per period" value={rangeStats.avg} icon={TrendingUp} color="#f59e0b" />
            <KPICard title="Bookings" value={rangeStats.bookings} icon={CalendarCheck} color="#3b82f6" />
            <KPICard title="Periods" value={rangeStats.count} icon={Building2} color="#8b5cf6" />
          </div>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Sales Performance</h3>
                <p className="text-sm text-dark-400">Revenue over the selected period</p>
              </div>
              <div className="inline-flex gap-1 p-1 rounded-xl bg-surface-light border border-border">
                {Object.entries(ranges).map(([key, r]) => (
                  <button
                    key={key}
                    onClick={() => setRange(key)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer border transition-all',
                      range === key
                        ? 'bg-primary-500/15 text-primary-400 border-primary-500/20'
                        : 'text-dark-400 hover:text-white border-transparent'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rangeData}>
                  <defs>
                    <linearGradient id="reportRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {chartCartesian}
                  <XAxis dataKey={rangeKey} stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [formatCurrency(Math.round(v)), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#reportRevenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {tab === 'services' && (
        <motion.div key="services" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.services.map((k, i) => <KPICard key={k.title} {...k} delay={i * 0.05} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionTitle icon={Wrench} title="Most Booked Services" />
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceCounts} layout="vertical" margin={{ left: 8, right: 8 }}>
                    {chartCartesian}
                    <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={150} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <SectionTitle icon={IndianRupee} title="Revenue by Service" />
              <div className="h-80 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {serviceRevenue.map((s, i) => {
                    const max = serviceRevenue[0]?.revenue || 1;
                    const pct = Math.round((s.revenue / max) * 100);
                    return (
                      <div key={s.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-dark-300">{s.name}</span>
                          <span className="text-white font-medium">{formatCurrency(Math.round(s.revenue))}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-surface-lighter overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: ['#f59e0b', '#8b5cf6', '#3b82f6', '#22c55e', '#ef4444'][i % 5] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {tab === 'customers' && (
        <motion.div key="customers" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.customers.map((k, i) => <KPICard key={k.title} value={k.value} {...k} delay={i * 0.05} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionTitle icon={Repeat} title="New vs Returning Customers" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customerStats.pie} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                      {customerStats.pie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} customers`, '']} />
                    <Legend formatter={name => <span style={{ color: '#ced4da', fontSize: '12px' }}>{name}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <SectionTitle icon={Users} title="Customer Retention" />
              <div className="space-y-4">
                {[
                  { label: 'Total customers', value: customerStats.total, bar: 100 },
                  { label: 'Returning customers', value: customerStats.returningCount, bar: customerStats.returningRate },
                  { label: 'New customers (30 days)', value: customerStats.newCount, bar: customerStats.total ? Math.round((customerStats.newCount / customerStats.total) * 100) : 0 },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-dark-400">{row.label}</span>
                      <span className="text-white font-semibold">{row.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-lighter overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${row.bar}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary-500 to-red-500" />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-light border border-border">
                    <p className="text-xs text-dark-400">Avg bookings / customer</p>
                    <p className="text-2xl font-bold text-white mt-1">{customerStats.avgBookings}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-light border border-border">
                    <p className="text-xs text-dark-400">Revenue per customer</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(customerStats.revenuePerCustomer)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {tab === 'workshop' && (
        <motion.div key="workshop" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.workshop.map((k, i) => <KPICard key={k.title} value={k.value} {...k} delay={i * 0.05} />)}
          </div>
          <Card>
            <SectionTitle icon={Building2} title="Workload Overview" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Completed', jobs: workshopStats.completed, color: '#10b981' },
                  { name: 'In Progress', jobs: workshopStats.inProgress, color: '#f97316' },
                  { name: 'Pending', jobs: workshopStats.pending, color: '#f59e0b' },
                ]}>
                  {chartCartesian}
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="jobs" radius={[6, 6, 0, 0]} barSize={48}>
                    {[
                      { name: 'Completed', jobs: workshopStats.completed },
                      { name: 'In Progress', jobs: workshopStats.inProgress },
                      { name: 'Pending', jobs: workshopStats.pending },
                    ].map((e, i) => <Cell key={i} fill={['#10b981', '#f97316', '#f59e0b'][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <SectionTitle icon={Users} title="Staff Performance" />
            {workshopStats.staffPerf.length === 0 ? (
              <p className="text-sm text-dark-500 py-6 text-center">No staff assignments recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {workshopStats.staffPerf.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-xl bg-surface-light border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-dark-500">{s.specialization}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg bg-surface-lighter text-dark-300">{s.done}/{s.total} done</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-lighter overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.rate}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-dark-500 mt-1.5">{s.rate}% completion rate</p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}