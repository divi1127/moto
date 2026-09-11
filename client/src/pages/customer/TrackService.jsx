import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDays, parseISO } from 'date-fns';
import { Activity, CalendarClock, Check, ClipboardList, Info, Package, Search, Truck, UserRound } from 'lucide-react';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import {
  PageHeader, PageState, usePageLoading, formatDate, formatDateTimeLabel,
  statusToStageIndex, WORKFLOW_STAGES, InfoRow, SectionTitle
} from './customerShared';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';

export default function TrackService() {
  const { user, users, getCustomerBikes, getCustomerBookings, getBikeById, getUserById, jobCards } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  useEffect(() => { setError(!userId); }, [userId]);

  const activeBookings = useMemo(() => {
    if (!userId) return [];
    return [...getCustomerBookings(userId)]
      .filter(b => !['completed', 'cancelled'].includes(b.status))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [userId, getCustomerBookings]);

  useEffect(() => {
    if (!selectedId && activeBookings.length) setSelectedId(activeBookings[0].id);
  }, [activeBookings, selectedId]);

  const booking = activeBookings.find(b => b.id === selectedId) || activeBookings[0] || null;
  const bike = booking ? getBikeById(booking.bikeId) : null;
  const jobCard = booking ? jobCards.find(j => j.bookingId === booking.id) : null;
  const stageIdx = booking ? statusToStageIndex(booking.status) : 0;

  const estimatedPickup = booking ? `${booking.date} · ${booking.timeSlot}` : '—';

  const stageDoneAt = idx => {
    if (!booking?.createdAt) return null;
    try {
      return formatDate(addDays(parseISO(booking.createdAt), idx + 1).toISOString());
    } catch {
      return null;
    }
  };

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="Track Your Service"
        subtitle="Follow every stage of your bike's transformation in real time."
      >
        {booking && <StatusBadge status={booking.status} />}
      </PageHeader>

      {activeBookings.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No active services"
          description="When your service is in progress, you'll see the live workflow timeline here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="max-w-md">
                <Select
                  label="Active booking"
                  options={activeBookings.map(b => ({
                    value: b.id,
                    label: `${b.bookingNumber} · ${formatDate(b.date)}`,
                  }))}
                  value={booking?.id}
                  onChange={e => setSelectedId(e.target.value)}
                />
              </div>
              {booking && (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="text-white font-semibold">{bike ? `${bike.brand} ${bike.model}` : '—'}</span>
                  <span className="text-dark-400">{booking.bookingNumber}</span>
                  <span className="text-dark-400 inline-flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-primary-400" />
                    {formatDateTimeLabel(booking.date, booking.timeSlot)}
                  </span>
                  {booking.pickupDrop && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      <Truck className="w-3 h-3" /> Pickup & Drop
                    </span>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <SectionTitle icon={Activity} title="Workflow Progress" />
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
                <div className="relative space-y-1">
                  {WORKFLOW_STAGES.map((stage, i) => {
                    const done = i < stageIdx;
                    const current = i === stageIdx;
                    return (
                      <motion.div
                        key={stage}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative flex items-start gap-4 py-1"
                      >
                        <motion.div
                          animate={current ? { scale: [1, 1.15, 1] } : {}}
                          transition={current ? { duration: 1.4, repeat: Infinity, repeatDelay: 1 } : {}}
                          className={cn(
                            'relative z-10 w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0',
                            done && 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
                            current && 'bg-primary-500 border-primary-400 text-black shadow-lg shadow-primary-500/50 animate-pulse-glow',
                            !done && !current && 'bg-surface-lighter border-border text-dark-600'
                          )}
                        >
                          {done ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </motion.div>
                        <div className="pt-1.5">
                          <p className={cn(
                            'text-sm',
                            current ? 'text-white font-semibold' : done ? 'text-dark-300' : 'text-dark-600'
                          )}>
                            {stage}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {done && <span className="text-[10px] text-emerald-400/80">{stageDoneAt(i)}</span>}
                            {current && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-wider">
                                In progress
                              </span>
                            )}
                          </div>
                        </div>
                        {i === stageIdx && bike && (
                          <div className="hidden sm:block ml-auto text-right">
                            <p className="text-[10px] uppercase tracking-wider text-dark-500">Stage {stageIdx + 1}/{WORKFLOW_STAGES.length}</p>
                            <p className="text-sm font-semibold text-primary-400">{Math.round((stageIdx / (WORKFLOW_STAGES.length - 1)) * 100)}%</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <SectionTitle icon={UserRound} title="Assigned Staff" />
              {jobCard?.assignedStaff?.length ? (
                <div className="space-y-3">
                  {jobCard.assignedStaff.map(id => {
                    const staff = getUserById(id);
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <Avatar name={staff?.name} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{staff?.name || 'Staff member'}</p>
                          <p className="text-xs text-dark-500">{staff?.specialization || 'Technician'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <Search className="w-8 h-8 text-dark-600 mb-2" />
                  <p className="text-xs text-dark-400 text-center">Staff will be assigned once work begins.</p>
                </div>
              )}
            </Card>

            {booking && (
              <Card>
                <SectionTitle icon={CalendarClock} title="Estimated Pickup" />
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                  <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{formatDateTimeLabel(booking.date, booking.timeSlot)}</p>
                    <p className="text-[10px] text-dark-400 mt-0.5">{booking.pickupDrop ? 'Home pickup & drop arranged' : 'Pickup from studio'}</p>
                  </div>
                </div>
              </Card>
            )}

            {jobCard && (
              <>
                <Card>
                  <SectionTitle icon={ClipboardList} title="Job Card Notes" />
                  <div className="rounded-xl border border-border bg-surface-light/60 p-4">
                    <p className="text-xs text-dark-400 leading-relaxed">{jobCard.workNotes || 'Work in progress — updates coming soon.'}</p>
                  </div>
                </Card>
                <Card>
                  <SectionTitle icon={Info} title="Inspection Notes" />
                  <div className="rounded-xl border border-border bg-surface-light/60 p-4">
                    <p className="text-xs text-dark-400 leading-relaxed">{jobCard.inspectionNotes || 'No inspection notes yet.'}</p>
                  </div>
                </Card>
              </>
            )}

            {booking && (
              <Card>
                <SectionTitle icon={Package} title="Services" />
                <div className="space-y-1.5">
                  {booking.services?.map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs text-dark-300">
                      <span className="w-1 h-1 rounded-full bg-primary-400" />
                      {s}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-dark-400">Total</span>
                  <span className="text-base font-bold text-white">{formatCurrency(booking.total)}</span>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}