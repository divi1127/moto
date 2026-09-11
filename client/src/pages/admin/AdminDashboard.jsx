import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import KPICard from '../../components/ui/KPICard';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { monthlyRevenue, serviceDistribution } from '../../data/mockData';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Bike, CalendarCheck, Wrench, CheckCircle2, Clock, IndianRupee, TrendingUp, Plus, UserPlus, Sparkles, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { users, bikes, bookings, payments } = useStore();

  const stats = useMemo(() => {
    const customers = users.filter(u => u.role === 'customer');
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayBookings = bookings.filter(b => b.date === today);
    const activeJobs = bookings.filter(b => ['in-progress', 'painting', 'detailing', 'ceramic', 'quality-check'].includes(b.status));
    const completedJobs = bookings.filter(b => b.status === 'completed');
    const pendingPayments = bookings.reduce((sum, b) => sum + (b.balance || 0), 0);
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const currentMonth = format(new Date(), 'MMM');
    const monthlyData = monthlyRevenue.find(m => m.month === currentMonth);
    const monthlyRevenueAmount = monthlyData?.revenue || totalRevenue;

    return {
      totalCustomers: customers.length,
      totalBikes: bikes.length,
      todayBookings: todayBookings.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      pendingPayments,
      totalRevenue,
      monthlyRevenue: monthlyRevenueAmount,
    };
  }, [users, bikes, bookings, payments]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [bookings]);

  const kpis = [
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: '#3b82f6', trend: 'up', trendValue: '+12%' },
    { title: 'Total Bikes', value: stats.totalBikes, icon: Bike, color: '#8b5cf6', trend: 'up', trendValue: '+8%' },
    { title: "Today's Bookings", value: stats.todayBookings, icon: CalendarCheck, color: '#06b6d4' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: Wrench, color: '#f97316' },
    { title: 'Completed Jobs', value: stats.completedJobs, icon: CheckCircle2, color: '#10b981', trend: 'up', trendValue: '+24%' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: '#f59e0b' },
    { title: 'Total Revenue', value: stats.totalRevenue, icon: IndianRupee, color: '#22c55e', trend: 'up', trendValue: '+18%' },
    { title: 'Monthly Revenue', value: stats.monthlyRevenue, icon: TrendingUp, color: '#ec4899', trend: 'up', trendValue: '+15%' },
  ];

  const bookingColumns = [
    {
      header: 'Booking #',
      accessor: 'bookingNumber',
      render: (row) => <span className="text-primary-400 font-medium">{row.bookingNumber}</span>,
    },
    {
      header: 'Customer',
      render: (row) => {
        const user = users.find(u => u.id === row.userId);
        return user?.name || 'Unknown';
      },
    },
    {
      header: 'Bike',
      render: (row) => {
        const bike = bikes.find(b => b.id === row.bikeId);
        return bike ? `${bike.brand} ${bike.model}` : 'Unknown';
      },
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Total',
      accessor: 'total',
      render: (row) => <span className="font-medium">{formatCurrency(row.total)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, Admin</h1>
          <p className="text-dark-400 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" icon={Plus} onClick={() => window.location.href = '/admin/bookings'}>Create Booking</Button>
          <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => window.location.href = '/admin/customers'}>Add Customer</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                <p className="text-sm text-dark-400">Monthly revenue trend</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Booking Trends</h3>
                <p className="text-sm text-dark-400">Monthly bookings</p>
              </div>
              <CalendarCheck className="w-5 h-5 text-primary-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="bookings" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-1">
          <Card className="h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Service Distribution</h3>
              <p className="text-sm text-dark-400">Bookings by service category</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {serviceDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-dark-400">{item.name}</span>
                  <span className="text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
                <p className="text-sm text-dark-400">Last 5 bookings</p>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => window.location.href = '/admin/bookings'}>View All</Button>
            </div>
            <DataTable columns={bookingColumns} data={recentBookings} searchable={false} pageSize={5} />
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <p className="text-sm text-dark-400">Frequently used actions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/admin/bookings'}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-light hover:border-primary-500/30 transition-all cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-primary-500/10">
                <Plus className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Create Booking</p>
                <p className="text-xs text-dark-400">New service booking</p>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/admin/customers'}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-light hover:border-primary-500/30 transition-all cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Add Customer</p>
                <p className="text-xs text-dark-400">Register new customer</p>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/admin/services'}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-light hover:border-primary-500/30 transition-all cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Add Service</p>
                <p className="text-xs text-dark-400">Manage services</p>
              </div>
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
