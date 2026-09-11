import { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { PageHeader, SectionTitle, PageState, usePageLoading } from './adminShared';
import KPICard from '../../components/ui/KPICard';
import { format } from 'date-fns';
import { IndianRupee, Clock, RotateCcw, Banknote, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const METHODS = ['UPI', 'Cash', 'Card', 'Net Banking'];

export default function AdminPayments() {
  const { payments, bookings, users, addPayment, updateBooking } = useStore();
  const loading = usePageLoading();
  const [methodFilter, setMethodFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [recordOpen, setRecordOpen] = useState(false);
  const [payForm, setPayForm] = useState({ bookingId: '', amount: '', method: 'UPI', transactionId: '' });

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completed = payments.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);
    const todayCollection = completed.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0);
    const refunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);
    const pendingAmount = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((s, b) => s + (b.balance || 0), 0);
    return { totalRevenue, pendingAmount, refunded, todayCollection };
  }, [payments, bookings]);

  const filtered = useMemo(() => {
    return [...payments]
      .filter(p => {
        if (methodFilter && p.method !== methodFilter) return false;
        if (fromDate && p.date < fromDate) return false;
        if (toDate && p.date > toDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, methodFilter, fromDate, toDate]);

  const outstandingBookings = useMemo(() => bookings.filter(b => b.status !== 'cancelled' && (b.balance || 0) > 0), [bookings]);

  const customerOf = bookingId => {
    const b = bookings.find(x => x.id === bookingId);
    return users.find(u => u.id === b?.userId)?.name || 'Unknown';
  };

  const columns = [
    {
      header: 'Booking #',
      render: r => {
        const b = bookings.find(x => x.id === r.bookingId);
        return <span className="text-primary-400 font-medium font-mono">{b?.bookingNumber || '—'}</span>;
      },
    },
    { header: 'Customer', render: r => customerOf(r.bookingId) },
    { header: 'Amount', accessor: 'amount', sortable: true, render: r => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { header: 'Method', accessor: 'method', sortable: true, render: r => <Badge className="bg-surface-lighter text-dark-300 border-border">{r.method}</Badge> },
    { header: 'Transaction ID', accessor: 'transactionId', render: r => <span className="font-mono text-xs text-dark-400">{r.transactionId || '—'}</span> },
    { header: 'Date', accessor: 'date', sortable: true, render: r => format(new Date(r.date), 'dd MMM yyyy') },
    { header: 'Status', render: r => <StatusBadge status={r.status === 'refunded' ? 'cancelled' : r.status === 'completed' ? 'active' : r.status} /> },
    {
      header: 'Actions',
      render: r => r.status === 'completed' ? (
        <Button size="sm" variant="danger" icon={RotateCcw} onClick={() => handleRefund(r)}>Refund</Button>
      ) : '—',
    },
  ];

  const openRecord = () => {
    if (outstandingBookings.length === 0) {
      toast('No bookings with outstanding balance');
      return;
    }
    const first = outstandingBookings[0];
    setPayForm({ bookingId: first.id, amount: String(first.balance), method: 'UPI', transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000) });
    setRecordOpen(true);
  };

  const handleRecord = () => {
    const amount = Number(payForm.amount);
    if (!payForm.bookingId) { toast.error('Select a booking'); return; }
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    const booking = bookings.find(b => b.id === payForm.bookingId);
    addPayment({
      bookingId: payForm.bookingId,
      amount,
      method: payForm.method,
      transactionId: payForm.transactionId || 'CASH-001',
      status: 'completed',
    });
    const newBalance = Math.max(0, (booking.balance || 0) - amount);
    updateBooking(payForm.bookingId, { balance: newBalance });
    if (newBalance === 0) {
      updateBooking(payForm.bookingId, { balance: 0 });
    }
    setRecordOpen(false);
    toast.success(`Payment of ${formatCurrency(amount)} recorded`);
  };

  const handleRefund = r => {
    updateBooking(r.bookingId, { balance: (bookings.find(b => b.id === r.bookingId)?.balance || 0) + r.amount });
    toast.success(`${formatCurrency(r.amount)} refunded to customer`);
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Payment Management" subtitle="Record and reconcile payments across all bookings.">
        <Button icon={Plus} onClick={openRecord}>Record Payment</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={stats.totalRevenue} icon={IndianRupee} color="#22c55e" trend="up" trendValue="+18% vs last month" />
        <KPICard title="Pending Amount" value={stats.pendingAmount} icon={Clock} color="#f59e0b" />
        <KPICard title="Refunded" value={stats.refunded} icon={RotateCcw} color="#ef4444" />
        <KPICard title="Today's Collection" value={stats.todayCollection} icon={Banknote} color="#3b82f6" />
      </div>

      <Card>
        <SectionTitle
          title="Transactions"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="w-40 py-1.5"
                placeholder="All methods"
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                options={METHODS.map(m => ({ value: m, label: m }))}
              />
              <Input type="date" className="py-1.5 w-40" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              <Input type="date" className="py-1.5 w-40" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={Banknote} title="No payments found" description="Adjust your filters or record a new payment." action="Record Payment" onAction={openRecord} />
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </Card>

      <Modal isOpen={recordOpen} onClose={() => setRecordOpen(false)} title="Record Payment" size="md">
        <div className="space-y-5">
          <Select
            label="Booking"
            value={payForm.bookingId}
            onChange={e => {
              const b = bookings.find(x => x.id === e.target.value);
              setPayForm(f => ({ ...f, bookingId: e.target.value, amount: String(b?.balance || 0) }));
            }}
            options={outstandingBookings.map(b => ({ value: b.id, label: `${b.bookingNumber} — ${customerOf(b.id)} (due ${formatCurrency(b.balance)})` }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
            <Select label="Method" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))} options={METHODS.map(m => ({ value: m, label: m }))} />
          </div>
          <Input label="Transaction ID" value={payForm.transactionId} placeholder="TXN-..." onChange={e => setPayForm(f => ({ ...f, transactionId: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button icon={Banknote} onClick={handleRecord}>Record payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}