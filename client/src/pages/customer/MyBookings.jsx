import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock, Check, ChevronRight, CreditCard, Package, Receipt, Truck, Wrench, Palette
} from 'lucide-react';
import toast from 'react-hot-toast';
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
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const ACTIVE_STATUSES = ['received', 'inspection', 'approved', 'in-progress', 'painting', 'detailing', 'ceramic', 'quality-check', 'ready'];
const PAY_METHODS = ['UPI', 'Card', 'Cash', 'Net Banking'];

function Timeline({ booking }) {
  const stageIdx = statusToStageIndex(booking.status);
  return (
    <div className="space-y-0">
      {WORKFLOW_STAGES.slice(0, 8).map((stage, i) => {
        const done = i < stageIdx;
        const current = i === stageIdx;
        return (
          <div key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
                done && 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
                current && 'bg-primary-500 border-primary-400 text-black shadow-lg shadow-primary-500/40 animate-pulse-glow',
                !done && !current && 'bg-surface-lighter border-border text-dark-600'
              )}>
                {done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
              </div>
              {i < 7 && <div className={cn('w-0.5 h-5', i < stageIdx ? 'bg-emerald-500/40' : 'bg-border')} />}
            </div>
            <p className={cn(
              'text-xs pt-1.5',
              done && 'text-dark-300 line-through decoration-emerald-500/40',
              current && 'text-white font-semibold',
              !done && !current && 'text-dark-500'
            )}>{stage}</p>
          </div>
        );
      })}
    </div>
  );
}

function PaymentModal({ booking, onClose }) {
  const { addPayment, updateBooking } = useStore();
  const [method, setMethod] = useState('UPI');
  const [amount, setAmount] = useState(String(booking.balance || 0));
  const [paying, setPaying] = useState(false);

  const payNow = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > booking.balance) return toast.error(`Cannot pay more than ${formatCurrency(booking.balance)}`);
    setPaying(true);
    const code = method === 'Net Banking' ? 'NB' : method === 'UPI' ? 'UPI' : method.toUpperCase();
    const txn = `TXN-${code}-${Date.now().toString().slice(-8)}`;
    setTimeout(() => {
      addPayment({ bookingId: booking.id, amount: amt, method, transactionId: txn, status: 'completed' });
      updateBooking(booking.id, { balance: Math.max(0, booking.balance - amt) });
      setPaying(false);
      toast.success(`Payment of ${formatCurrency(amt)} received`);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen onClose={onClose} title={`Pay balance · ${booking.bookingNumber}`} size="sm">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-surface-light/60 p-4 flex items-center justify-between">
          <span className="text-sm text-dark-400">Balance due</span>
          <span className="text-lg font-bold text-white">{formatCurrency(booking.balance)}</span>
        </div>
        <Select
          label="Payment method"
          options={PAY_METHODS}
          value={method}
          onChange={e => setMethod(e.target.value)}
        />
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          icon={CreditCard}
        />
        <Button className="w-full" loading={paying} onClick={payNow} icon={CreditCard}>
          Pay {amount ? formatCurrency(Number(amount)) : ''} now
        </Button>
      </div>
    </Modal>
  );
}

export default function MyBookings() {
  const { user, users, getCustomerBikes, getCustomerBookings, getBikeById, getBookingPayments, getCustomizationByBooking } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [details, setDetails] = useState(null);
  const [payBooking, setPayBooking] = useState(null);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  useEffect(() => { setError(!userId); }, [userId]);

  const bookings = useMemo(() => {
    if (!userId) return [];
    return [...getCustomerBookings(userId)].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [userId, getCustomerBookings]);

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings;
    if (filter === 'in-progress') return bookings.filter(b => ACTIVE_STATUSES.includes(b.status));
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const bookingPayments = details ? getBookingPayments(details.id) : [];
  const detailsBike = details ? getBikeById(details.bikeId) : null;
  const design = details ? getCustomizationByBooking(details.id) : null;
  const stageIdx = details ? statusToStageIndex(details.status) : 0;

  const paidForBooking = b => getBookingPayments(b.id).reduce((s, p) => s + (p.amount || 0), 0);

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        subtitle="View and manage every service request you've placed at MOTO CUSTOM & DETAILING."
      >
        <div className="flex items-center gap-2 text-sm text-dark-400">
          <CalendarClock className="w-4 h-4 text-primary-400" />
          <span>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>
      </PageHeader>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all cursor-pointer',
              filter === f.id
                ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                : 'bg-surface text-dark-400 border-border hover:text-white hover:bg-surface-lighter'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={filter === 'all' ? 'No bookings yet' : `No ${FILTERS.find(f => f.id === filter)?.label.toLowerCase() || 'matching'} bookings`}
          description="Book your first service and it will show up here with live status tracking."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((b, i) => {
              const bike = getBikeById(b.bikeId);
              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card hover className="h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-primary-400">{b.bookingNumber}</p>
                        <p className="text-xs text-dark-400 mt-1 flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5" /> {formatDateTimeLabel(b.date, b.timeSlot)}
                        </p>
                      </div>
                      <StatusBadge status={b.status} size="sm" />
                    </div>

                    <div className="mt-4 rounded-xl border border-border bg-surface-light/60 p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Bike</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{bike ? `${bike.brand} ${bike.model}` : '—'}</p>
                    </div>

                    <div className="mt-4 flex-1 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Services</p>
                      {b.services?.map(s => (
                        <div key={s} className="flex items-center gap-2 text-xs text-dark-300">
                          <span className="w-1 h-1 rounded-full bg-primary-400" />
                          {s}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-dark-500">Total</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(b.total)}</p>
                      </div>
                      {b.pickupDrop && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                          <Truck className="w-3 h-3" /> Pickup & Drop
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setDetails(b)}>
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                      {b.balance > 0 && b.status !== 'cancelled' && (
                        <Button size="sm" className="flex-1" icon={CreditCard} onClick={() => setPayBooking(b)}>
                          Pay {formatCurrency(b.balance)}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={!!details} onClose={() => setDetails(null)} title={details?.bookingNumber} size="lg">
        {details && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={details.status} />
              {details.pickupDrop && (
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  <Truck className="w-3.5 h-3.5" /> Pickup & Drop requested
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Wrench} label="Bike" value={detailsBike ? `${detailsBike.brand} ${detailsBike.model} · ${detailsBike.registrationNumber}` : '—'} />
              <InfoRow icon={CalendarClock} label="Date & Time" value={formatDateTimeLabel(details.date, details.timeSlot)} />
            </div>

            <div>
              <SectionTitle icon={Package} title="Services" />
              <div className="space-y-1.5">
                {details.services?.map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm text-dark-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {s}
                  </div>
                ))}
              </div>
              {details.notes && (
                <p className="mt-3 text-xs text-dark-400 italic bg-surface-light/60 border border-border rounded-xl p-3">"{details.notes}"</p>
              )}
            </div>

            {design && (
                <div>
                  <SectionTitle icon={Palette} title="Customization Preview" />
                  <div className="mb-3 rounded-xl border border-border overflow-hidden">
                    {design.previewImage
                      ? <img src={design.previewImage} alt="Your customization preview" className="w-full" />
                      : <div className="py-8 text-center text-xs text-dark-400">Preview not available</div>}
                  </div>
                  {(design.parts?.length > 0 || design.stickers?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {design.parts?.map((p, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-surface-lighter text-dark-300 border border-border">
                          <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: p.color }} />
                          Painted part
                        </span>
                      ))}
                      {design.stickers?.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                          <Palette className="w-3 h-3" /> Sticker
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-dark-400">
                    {design.finishType && <span className="text-dark-200 font-medium">{design.finishType} finish</span>} · design estimate {formatCurrency(design.total || 0)}
                  </p>
                  {design.notes && <p className="mt-2 text-xs text-dark-400 italic">"{design.notes}"</p>}
                </div>
              )}

            <div>
              <SectionTitle icon={Receipt} title="Price Breakdown" />
              <div className="rounded-xl border border-border divide-y divide-border">
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Subtotal</span><span className="text-white">{formatCurrency(details.subtotal)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Discount</span><span className="text-emerald-400">− {formatCurrency(details.discount)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Tax (18%)</span><span className="text-white">{formatCurrency(details.tax)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm font-semibold"><span className="text-white">Total</span><span className="text-white">{formatCurrency(details.total)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Advance paid</span><span className="text-emerald-400">{formatCurrency(details.advance)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm font-semibold"><span className="text-white">Balance</span><span className="text-yellow-400">{formatCurrency(details.balance)}</span></div>
              </div>
            </div>

            <div>
              <SectionTitle icon={CreditCard} title="Payment History" />
              {bookingPayments.length ? (
                <div className="space-y-2">
                  {bookingPayments.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-light/60 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-white">{formatCurrency(p.amount)}</p>
                        <p className="text-[10px] text-dark-500">{p.transactionId} · {p.method}</p>
                      </div>
                      <span className="text-[10px] text-dark-400">{formatDate(p.date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-400 text-center py-4">No payments recorded yet.</p>
              )}
            </div>

            <div>
              <SectionTitle icon={Check} title="Service Timeline" />
              <Timeline booking={details} />
              <p className="mt-3 text-xs text-dark-500">
                {paidForBooking(details) > 0
                  ? `${formatCurrency(paidForBooking(details))} paid · ${formatCurrency(details.balance)} remaining`
                  : 'No payment yet · advance is due on confirmation'}
              </p>
            </div>

            {details.balance > 0 && details.status !== 'cancelled' && (
              <Button className="w-full" icon={CreditCard} onClick={() => { setDetails(null); setPayBooking(details); }}>
                Pay balance {formatCurrency(details.balance)}
              </Button>
            )}
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {payBooking && <PaymentModal booking={payBooking} onClose={() => setPayBooking(null)} />}
      </AnimatePresence>
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}