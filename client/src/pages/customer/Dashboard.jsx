import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, CalendarClock, CalendarDays, Sparkles } from 'lucide-react';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading, statusToStageIndex, formatDate } from './customerShared';
import KPICard from '../../components/ui/KPICard';
import AppointmentCard from '../../components/dashboard/AppointmentCard';
import ServiceStatusTimeline from '../../components/dashboard/ServiceStatusTimeline';
import PaymentAlert from '../../components/dashboard/PaymentAlert';
import BikeCard from '../../components/dashboard/BikeCard';
import OfferCard from '../../components/dashboard/OfferCard';
import RecentServicesTable from '../../components/dashboard/RecentServicesTable';
import Avatar from '../../components/ui/Avatar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, users, getCustomerBikes, getCustomerBookings, coupons } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  const data = useMemo(() => {
    if (!userId) return null;
    const bikes = getCustomerBikes(userId);
    const bookings = [...getCustomerBookings(userId)].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
    const today = new Date().toISOString().split('T')[0];
    const upcoming = activeBookings
      .filter(b => (b.date || '') >= today)
      .sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot));
    const next = upcoming[0] || null;
    const recentActive = [...activeBookings].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0] || null;
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.balance > 0 && b.status !== 'cancelled');
    const pendingBalance = pendingBookings.reduce((s, b) => s + (b.balance || 0), 0);
    return { bikes, bookings, activeBookings, next, recentActive, completedCount, pendingBookings, pendingBalance };
  }, [userId, getCustomerBikes, getCustomerBookings]);

  useEffect(() => { setError(!userId); }, [userId]);

  const bikeMap = useMemo(() => {
    const m = {};
    (data?.bikes || []).forEach(b => { m[b.id] = b; });
    return m;
  }, [data?.bikes]);

  const stageIdx = data?.recentActive ? statusToStageIndex(data.recentActive.status) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (myUser?.name || 'rider').split(' ')[0];
  const activeCoupons = coupons.filter(c => c.status === 'active').slice(0, 3);
  const recentRows = (data?.bookings || []).slice(0, 5);

  const content = (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here's what's happening with your bikes at MOTO CUSTOM & DETAILING."
      >
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{myUser?.name}</p>
            <p className="text-xs text-dark-500">{myUser?.email}</p>
          </div>
          <Avatar name={myUser?.name} size="md" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Total Bikes" value={data?.bikes.length || 0} icon={Bike} color="primary-500" delay={0} />
        <KPICard title="Active Bookings" value={data?.activeBookings.length || 0} icon={CalendarClock} color="blue-500" delay={0.08} />
        <KPICard title="Upcoming Appointment" value={data?.next ? formatDate(data.next.date) : 'None'} icon={CalendarDays} color="purple-500" delay={0.16} />
        <KPICard title="Completed Services" value={data?.completedCount || 0} icon={Sparkles} color="emerald-500" delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentCard
          booking={data?.next}
          bike={data?.next ? bikeMap[data.next.bikeId] : null}
        />
        <ServiceStatusTimeline
          booking={data?.recentActive}
          bikeName={data?.recentActive ? `${bikeMap[data.recentActive.bikeId]?.brand || ''} ${bikeMap[data.recentActive.bikeId]?.model || ''}`.trim() : ''}
          stageIdx={stageIdx}
        />
      </div>

      {data && data.pendingBookings.length > 0 && (
        <PaymentAlert
          amount={data.pendingBalance}
          bookingsCount={data.pendingBookings.length}
          onPay={() => navigate('/payments')}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">My Bikes</h2>
            <button
              onClick={() => navigate('/my-bikes')}
              className="text-sm font-medium text-primary-400 hover:text-primary-300 cursor-pointer"
            >
              View all
            </button>
          </div>
          {data && data.bikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {data.bikes.map((bike, i) => (
                <BikeCard key={bike.id} bike={bike} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-dark-400">No bikes added yet.</p>
              <button
                onClick={() => navigate('/my-bikes')}
                className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300 cursor-pointer"
              >
                Add your first bike
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Offers</h2>
            <button
              onClick={() => navigate('/services')}
              className="text-sm font-medium text-primary-400 hover:text-primary-300 cursor-pointer"
            >
              View all
            </button>
          </div>
          {activeCoupons.length > 0 ? (
            <div className="space-y-4">
              {activeCoupons.map((c, i) => (
                <OfferCard key={c.id} coupon={c} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-dark-400">No active offers right now.</p>
            </div>
          )}
        </div>
      </div>

      <RecentServicesTable rows={recentRows} bikeMap={bikeMap} />
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}