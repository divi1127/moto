import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, CircleAlert, ArrowRight, CheckCircle2, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading, formatDate } from './customerShared';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import KPICard from '../../components/ui/KPICard';

const PAY_METHODS = ['UPI', 'Card', 'Cash', 'Net Banking'];

function PayModal({ booking, onClose }) {
  const { addPayment, updateBooking } = useStore();
  const [method, setMethod] = useState('UPI');
  const [amount, setAmount] = useState(String(booking.balance || 0));
  const [paying, setPaying] = useState(false);

  const payNow = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > booking.balance) return toast.error(`Cannot pay more than ${formatCurrency(booking.balance)}`);
    setPaying(true);
    const code = method === 'Net Banking' ? 'NB' : method.toUpperCase();
    const txn = `TXN-${code}-${Date.now().toString().slice(-8)}`;
    setTimeout(() => {
      addPayment({ bookingId: booking.id, amount: amt, method, transactionId: txn, status: 'completed' });
      updateBooking(booking.id, { balance: Math.max(0, booking.balance - amt) });
      setPaying(false);
      toast.success(`Payment of ${formatCurrency(amt)} received`);
      onClose();
    }, 900);
  };

  return (
    <Modal isOpen onClose={onClose} title={`Pay · ${booking.bookingNumber}`} size="sm">
      <div className="space-y-5">
        <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-dark-400">Balance due</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(booking.balance)}</p>
        </div>
        <Select
          label="Payment method"
          options={PAY_METHODS}
          value={method}
          onChange={e => setMethod(e.target.value)}
        />
        <Input label="Amount (INR)" type="number" value={amount} onChange={e => setAmount(e.target.value)} icon={Wallet} />
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={paying} onClick={payNow} icon={CheckCircle2}>Pay now</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function Payments() {
  const { user, users, getCustomerBookings, payments } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [payBooking, setPayBooking] = useState(null);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  useEffect(() => { setError(!userId); }, [userId]);

  const bookings = useMemo(() => {
    if (!userId) return [];
    return [...getCustomerBookings(userId)].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [userId, getCustomerBookings]);

  const bookingMap = useMemo(() => {
    const m = {};
    bookings.forEach(b => { m[b.id] = b; });
    return m;
  }, [bookings]);

  const rows = useMemo(() => {
    return payments
      .filter(p => bookingMap[p.bookingId])
      .map(p => ({ ...p, bookingNumber: bookingMap[p.bookingId]?.bookingNumber || '—' }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [payments, bookingMap]);

  const today = new Date().toISOString().split('T')[0];
  const totalPaid = rows.reduce((s, p) => s + (p.amount || 0), 0);
  const viable = bookings.filter(b => b.balance > 0 && b.status !== 'cancelled');
  const totalPending = viable.reduce((s, b) => s + (b.balance || 0), 0);
  const overdue = viable.filter(b => b.status === 'completed' || (b.date || '') < today);
  const totalOverdue = overdue.reduce((s, b) => s + (b.balance || 0), 0);

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Balances"
        subtitle="Track what you've paid, what's owed, and settle balances in seconds."
      >
        <Button onClick={() => viable[0] && setPayBooking(viable[0])} icon={CreditCard} disabled={!viable.length}>
          Pay balance
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Paid" value={totalPaid} icon={CheckCircle2} color="emerald-500" delay={0} />
        <KPICard title="Total Pending" value={totalPending} icon={Wallet} color="blue-500" delay={0.08} />
        <KPICard title="Total Overdue" value={totalOverdue} icon={CircleAlert} color="red-500" delay={0.16} />
      </div>

      {totalPending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 p-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400"><Wallet className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-semibold text-white">You have {formatCurrency(totalPending)} pending across {viable.length} booking{viable.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-dark-400 mt-0.5">Settle balances to keep your service on priority.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {viable.slice(0, 3).map(b => (
              <Button key={b.id} size="sm" variant="outline" onClick={() => setPayBooking(b)}>
                {b.bookingNumber} <ArrowRight className="w-3 h-3" />
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <Card>
        <h3 className="text-base font-semibold text-white mb-4">Payment History</h3>
        {rows.length ? (
          <DataTable
            searchable
            pageSize={8}
            data={rows}
            columns={[
              {
                header: 'Booking', accessor: 'bookingNumber', sortable: true,
                render: row => <span className="font-mono text-primary-400">{row.bookingNumber}</span>,
              },
              { header: 'Date', accessor: 'date', sortable: true, render: row => <span className="text-white/80">{formatDate(row.date)}</span> },
              { header: 'Amount', accessor: 'amount', sortable: true, render: row => <span className="font-medium text-white">{formatCurrency(row.amount)}</span> },
              { header: 'Method', accessor: 'method', render: row => <span className="text-white/70">{row.method}</span> },
              { header: 'Transaction ID', accessor: 'transactionId', render: row => <span className="font-mono text-xs text-dark-400">{row.transactionId}</span> },
              { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} size="sm" /> },
            ]}
          />
        ) : (
          <EmptyState icon={Receipt} title="No payments yet" description="Your payment history will appear here once you make your first payment." />
        )}
      </Card>

      {viable.length > 0 && (
        <Card>
          <h3 className="text-base font-semibold text-white mb-4">Balance Due</h3>
          <div className="space-y-3">
            {viable.map(b => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-light/60 p-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium text-white">{b.bookingNumber}</p>
                  <p className="text-xs text-dark-400 mt-0.5">Due {formatDate(b.date)}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className={cn('text-sm font-bold', overdue.includes(b) ? 'text-red-400' : 'text-yellow-400')}>{formatCurrency(b.balance)}</p>
                    <p className="text-[10px] text-dark-500">{overdue.includes(b) ? 'Overdue' : 'Pending'}</p>
                  </div>
                  <Button size="sm" onClick={() => setPayBooking(b)} icon={CreditCard}>Pay</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {payBooking && <PayModal booking={payBooking} onClose={() => setPayBooking(null)} />}
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}