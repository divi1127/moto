import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Download, Eye, FileText, MapPin, Phone, Receipt, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading, formatDate, formatDateTimeLabel } from './customerShared';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const COMPANY = {
  name: 'MOTO CUSTOM & DETAILING',
  address: 'No. 42, 1st Main Rd, Koramangala Industrial Layout',
  city: 'Bangalore, Karnataka 560034',
  phone: '+91 90000 00001',
  email: 'support@motocustom.in',
};

export default function Invoices() {
  const { user, users, getCustomerBookings, getBikeById, getBookingPayments, serviceCategories } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(null);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  useEffect(() => { setError(!userId); }, [userId]);

  const bookings = useMemo(() => {
    if (!userId) return [];
    return [...getCustomerBookings(userId)]
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [userId, getCustomerBookings]);

  const servicePrice = useMemo(() => {
    const map = {};
    serviceCategories.forEach(cat => cat.services.forEach(s => { map[s.name] = s.price; }));
    return map;
  }, [serviceCategories]);

  const payments = open ? getBookingPayments(open.id) : [];
  const bike = open ? getBikeById(open.bikeId) : null;
  const paid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const invoiceSubtotal = open
    ? (open.services || []).reduce((s, name) => s + (servicePrice[name] || 0), 0)
    : 0;

  const downloadPDF = () => {
    toast.success('Preparing PDF — use your browser print dialog to save');
    setTimeout(() => window.print(), 350);
  };

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="GST-compliant invoices for every confirmed and completed service."
      >
        <div className="flex items-center gap-2 text-sm text-dark-400">
          <FileText className="w-4 h-4 text-primary-400" />
          <span>{bookings.length} invoice{bookings.length !== 1 ? 's' : ''}</span>
        </div>
      </PageHeader>

      {bookings.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Once a booking is confirmed or completed, its invoice will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {bookings.map((b, i) => {
            const bPaid = getBookingPayments(b.id).reduce((s, p) => s + (p.amount || 0), 0);
            const bBike = getBikeById(b.bikeId);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card hover className="h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-red-500" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Invoice number</p>
                      <p className="font-mono text-sm font-bold text-primary-400 mt-0.5">{b.bookingNumber}</p>
                    </div>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-surface-light/60 p-3.5">
                    <p className="text-[10px] uppercase tracking-wider text-dark-500">Bike</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{bBike ? `${bBike.brand} ${bBike.model}` : '—'}</p>
                    <p className="text-[10px] text-dark-500 mt-0.5">{formatDateTimeLabel(b.date, b.timeSlot)}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-surface-lighter border border-border py-2">
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Amount</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(b.total)}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Paid</p>
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(bPaid)}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Balance</p>
                      <p className="text-sm font-bold text-yellow-400">{formatCurrency(b.balance)}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" icon={Eye} onClick={() => setOpen(b)}>View Invoice</Button>
                    <Button size="sm" variant="ghost" icon={Download} onClick={() => { setOpen(b); downloadPDF(); }}>PDF</Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!open} onClose={() => setOpen(null)} title="Invoice" size="xl" className="bg-white text-black">
        {open && (
          <div className="font-sans">
            <div className="border-b-2 border-gray-800 pb-6 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black tracking-tight">{COMPANY.name}</p>
                      <p className="text-xs text-gray-500">Bike Customization · Detailing · Protection</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1 text-xs text-gray-600">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {COMPANY.address}</p>
                    <p className="pl-[18px]">{COMPANY.city}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {COMPANY.phone}</p>
                    <p className="flex items-center gap-1.5"><Receipt className="w-3 h-3" /> GSTIN: 29ABCDE1234F1Z5</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">INVOICE</p>
                  <p className="font-mono text-sm font-semibold text-gray-700 mt-1">{open.bookingNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">Date: {formatDate(open.date)}</p>
                  <div className="mt-2 inline-block">
                    <StatusBadge status={open.status} size="sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Billed To</p>
                <p className="text-sm font-bold text-gray-900">{myUser?.name}</p>
                <p className="text-xs text-gray-600">{myUser?.address}</p>
                <p className="text-xs text-gray-600">{myUser?.city}</p>
                <p className="text-xs text-gray-600">{myUser?.phone}</p>
                <p className="text-xs text-gray-600">{myUser?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Bike Details</p>
                <p className="text-sm font-bold text-gray-900">{bike ? `${bike.brand} ${bike.model}` : '—'}</p>
                {bike && (
                  <>
                    <p className="text-xs text-gray-600">{bike.registrationNumber}</p>
                    <p className="text-xs text-gray-600">{bike.year} · {bike.color}</p>
                  </>
                )}
                <p className="text-xs text-gray-600 mt-1">{formatDateTimeLabel(open.date, open.timeSlot)}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left px-3 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-l-lg">Service</th>
                  <th className="text-left px-3 py-2.5 text-xs uppercase tracking-wider font-semibold">Duration</th>
                  <th className="text-right px-3 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody>
                {open.services?.map(s => {
                  const svc = serviceCategories.flatMap(c => c.services).find(x => x.name === s);
                  return (
                    <tr key={s} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-gray-800">{s}</td>
                      <td className="px-3 py-2.5 text-gray-500">{svc?.duration || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-900">{formatCurrency(servicePrice[s] || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(invoiceSubtotal)}</span></div>
                <div className="flex justify-between text-red-500"><span>Discount</span><span>− {formatCurrency(open.discount)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (18%)</span><span>{formatCurrency(open.tax)}</span></div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-800 pt-2"><span>Total</span><span>{formatCurrency(open.total)}</span></div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Payments Made</p>
              {payments.length ? (
                <div className="space-y-1.5">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between text-xs text-gray-700">
                      <span className="font-mono">{p.transactionId} · {p.method} · {formatDate(p.date)}</span>
                      <span className="font-semibold">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No payments recorded.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Trusted workshop</span>
                {open.pickupDrop && <span className="inline-flex items-center gap-1"><Truck className="w-3 h-3" /> Pickup & Drop</span>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Balance due</p>
                <p className="text-xl font-black text-gray-900">{formatCurrency(open.balance)}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={downloadPDF} icon={Download}>Download PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}