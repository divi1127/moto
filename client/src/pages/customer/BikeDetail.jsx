import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bike, CalendarDays, Cog, Fuel, Gauge, Palette, ShieldCheck,
  Layers, Tag, Info, Paintbrush, Wrench, Camera, Check
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import DataTable from '../../components/ui/DataTable';
import BeforeAfterSlider from '../../components/ui/BeforeAfterSlider';
import BikeVisual from '../../components/ui/BikeVisual';
import {
  PageHeader, PageState, usePageLoading, SectionTitle, InfoRow,
  formatDate, formatDateTimeLabel
} from './customerShared';

export default function BikeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, users, getCustomerBikes, getBikeById, getBikeBookings } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const myBikes = myUser ? getCustomerBikes(myUser.id) : [];
  const requested = id ? getBikeById(id) : null;
  const bike = requested && myBikes.some(b => b.id === id) ? requested : null;

  useEffect(() => {
    setError(!bike);
  }, [bike]);

  const bikeBookings = useMemo(() => bike ? [...getBikeBookings(bike.id)].sort((a, b) => (b.date || '').localeCompare(a.date || '')) : [], [bike, getBikeBookings]);
  const activeBooking = bikeBookings.find(b => !['completed', 'cancelled'].includes(b.status)) || null;
  const completedBookings = bikeBookings.filter(b => b.status === 'completed');
  const customizationLog = bikeBookings.filter(b => b.services?.some(s => /paint|decal|sticker|wrap|graphic/i.test(s)));

  if (!loading && !bike) {
    return (
      <EmptyState
        icon={Bike}
        title="Bike not found"
        description="This bike doesn't exist or isn't part of your garage."
        action="Back to my bikes"
        onAction={() => navigate('/my-bikes')}
      />
    );
  }

  const content = (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/my-bikes')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to my bikes
        </button>
        <PageHeader
          title={`${bike.brand} ${bike.model}`}
          subtitle={`${bike.variant || 'Standard'} · ${bike.registrationNumber}`}
        >
          <div className="flex gap-3">
            <Button variant="outline" icon={Paintbrush} onClick={() => navigate('/customization')}>Customize</Button>
            <Button icon={Wrench} onClick={() => navigate('/services')}>Book Service</Button>
          </div>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-lighter via-surface to-surface flex items-center justify-center">
              <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
              <BikeVisual brand={bike.brand} color={bike.color} className="absolute inset-0 p-3" />
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[10px] font-semibold text-dark-300 uppercase tracking-wider">Photo coming soon</div>
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-primary-500/80 backdrop-blur text-[10px] font-bold text-black uppercase tracking-wider">{bike.registrationNumber}</div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-500">Colour</p>
                <p className="text-sm font-medium text-white inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br from-dark-200 to-dark-500" /> {bike.color}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-500">Mileage</p>
                <p className="text-sm font-medium text-white">{bike.mileage ?? 0} km</p>
              </div>
            </div>
          </Card>

          {activeBooking ? (
            <Card>
              <SectionTitle icon={Wrench} title="Current Booking" action={<StatusBadge status={activeBooking.status} size="sm" />} />
              <p className="text-sm text-dark-400">{activeBooking.bookingNumber}</p>
              <p className="text-sm text-white mt-1">{formatDateTimeLabel(activeBooking.date, activeBooking.timeSlot)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeBooking.services?.map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-surface-lighter text-dark-300 border border-border">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-dark-500">Estimate</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(activeBooking.total)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate('/track-service')}>Track <Check className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center">
              <Bike className="w-8 h-8 text-dark-600 mx-auto" />
              <p className="text-sm text-dark-400 mt-3">No active booking for this bike.</p>
              <Button size="sm" className="mt-4" onClick={() => navigate('/services')}>Book a service</Button>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle icon={Tag} title="Bike Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <InfoRow icon={Bike} label="Brand" value={bike.brand} />
              <InfoRow icon={Layers} label="Model / Variant" value={`${bike.model} ${bike.variant || ''}`} />
              <InfoRow icon={CalendarDays} label="Manufacturing Year" value={String(bike.year)} />
              <InfoRow icon={Palette} label="Colour" value={bike.color} />
              <InfoRow icon={Fuel} label="Fuel Type" value={bike.fuelType} />
              <InfoRow icon={Cog} label="Engine Type" value={bike.engineType} />
              <InfoRow icon={Gauge} label="Mileage" value={bike.mileage ? `${bike.mileage} km` : '—'} />
              <InfoRow icon={ShieldCheck} label="Insurance Valid Till" value={formatDate(bike.insuranceValidTill)} />
              <InfoRow icon={Info} label="Notes" value={bike.notes || '—'} />
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Wrench} title="Service History" />
            {completedBookings.length ? (
              <DataTable
                searchable={false}
                pageSize={5}
                data={completedBookings}
                onRowClick={() => navigate('/service-history')}
                columns={[
                  { header: 'Date', accessor: 'date', sortable: true, render: row => <span className="text-white/80">{formatDate(row.date)}</span> },
                  { header: 'Services', accessor: 'services', render: row => <span className="text-xs text-white/70">{row.services?.join(', ')}</span> },
                  { header: 'Amount', accessor: 'total', sortable: true, render: row => <span className="font-medium text-white">{formatCurrency(row.total)}</span> },
                  { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} size="sm" /> },
                ]}
              />
            ) : (
              <div className="text-sm text-dark-400 text-center py-8">No completed services yet for this bike.</div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={Paintbrush} title="Customization History" />
            {customizationLog.length ? (
              <div className="space-y-3">
                {customizationLog.map(booking => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-light/60 p-4">
                    <div>
                      <p className="text-sm font-medium text-white">{booking.bookingNumber}</p>
                      <p className="text-xs text-dark-400 mt-0.5">{formatDate(booking.date)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.services?.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">{s}</span>
                      ))}
                    </div>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-dark-400 text-center py-8">No customization work yet. Design your dream ride!</div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={Camera} title="Before / After Photos" />
            {completedBookings.length ? (
              <BeforeAfterSlider />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {['Before', 'After'].map(label => (
                  <div key={label} className="relative aspect-[4/3] rounded-2xl bg-surface-light/40 border border-dashed border-border flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">{label}</p>
                      <p className="text-xs text-dark-600 mt-1">Appears after service</p>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 text-[10px] font-semibold text-dark-300 uppercase">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => navigate('/my-bikes')}>{content}</PageState>;
}