import { useState, useMemo } from 'react';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { PageHeader, PageState, usePageLoading } from './adminShared';
import { format } from 'date-fns';
import { FileText, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInvoices() {
  const { bookings, users, bikes, payments } = useStore();
  const loading = usePageLoading();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const invoices = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'cancelled')
      .map(b => {
        const paid = payments
          .filter(p => p.bookingId === b.id && p.status === 'completed')
          .reduce((s, p) => s + p.amount, 0);
        const balance = Math.max(0, (b.total || 0) - paid);
        const invoiceStatus = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'outstanding';
        return { ...b, paid, outstanding: balance, invoiceStatus };
      })
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [bookings, payments]);

  const counts = useMemo(() => ({
    all: invoices.length,
    paid: invoices.filter(i => i.invoiceStatus === 'paid').length,
    partial: invoices.filter(i => i.invoiceStatus === 'partial').length,
    outstanding: invoices.filter(i => i.invoiceStatus === 'outstanding').length,
  }), [invoices]);

  const tabs = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'paid', label: 'Paid', count: counts.paid },
    { value: 'partial', label: 'Partial', count: counts.partial },
    { value: 'outstanding', label: 'Outstanding', count: counts.outstanding },
  ];

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.invoiceStatus === filter);

  const customerName = b => users.find(u => u.id === b?.userId)?.name || 'Unknown customer';
  const customerPhone = b => users.find(u => u.id === b?.userId)?.phone || '';
  const bikeLabel = b => {
    const bike = bikes.find(x => x.id === b?.bikeId);
    return bike ? `${bike.brand} ${bike.model}` : 'Unknown bike';
  };

  const statusBadge = status => {
    const configs = {
      paid: { label: 'Paid', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
      partial: { label: 'Partial Payment', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400' },
      outstanding: { label: 'Outstanding', cls: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
    };
    const c = configs[status];
    return <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border', c.cls)}><span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />{c.label}</span>;
  };

  const columns = [
    { header: 'Invoice #', render: r => <span className="font-mono text-primary-400 font-medium">{r.bookingNumber}</span> },
    { header: 'Customer', render: r => customerName(r) },
    { header: 'Bike', render: r => bikeLabel(r) },
    { header: 'Total', render: r => <span className="font-semibold">{formatCurrency(r.total)}</span> },
    { header: 'Paid', render: r => <span className="text-emerald-400">{formatCurrency(r.paid)}</span> },
    { header: 'Balance', render: r => <span className={r.outstanding > 0 ? 'text-red-400 font-medium' : 'text-dark-500'}>{formatCurrency(r.outstanding)}</span> },
    { header: 'Date', render: r => format(new Date(r.date || r.createdAt), 'dd MMM yyyy') },
    { header: 'Status', render: r => statusBadge(r.invoiceStatus), },
    { header: 'Actions', render: r => (
      <div className="flex gap-1.5">
        <Button size="sm" variant="secondary" icon={Eye} onClick={() => setSelected(r)}>View</Button>
        <Button size="sm" variant="ghost" icon={Download} onClick={() => handleDownload(r)}>PDF</Button>
      </div>
    ) },
  ];

  const bookingPayments = b => payments.filter(p => p.bookingId === b.id && p.status === 'completed');

  const handleDownload = inv => {
    const html = buildInvoiceHtml(inv);
    const win = window.open('', '_blank');
    if (!win) { toast.error('Popup blocked. Allow popups to download PDF'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
    toast.success(`Opening PDF for ${inv.bookingNumber}...`);
  };

  const buildInvoiceHtml = inv => {
    const lines = (inv.services || []).map((s, i) => {
      const price = Math.round((inv.subtotal || inv.total) / Math.max(1, inv.services.length));
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${(i + 1)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${s}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">₹${price.toLocaleString('en-IN')}</td></tr>`;
    }).join('');
    const pays = bookingPayments(inv).map(p => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${format(new Date(p.date), 'dd MMM yyyy')}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${p.method}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">₹${p.amount.toLocaleString('en-IN')}</td></tr>`).join('');
    return `<!DOCTYPE html><html><head><title>Invoice ${inv.bookingNumber}</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;color:#111;margin:0;padding:40px}
      .header{display:flex;justify-content:space-between;border-bottom:3px solid #f59e0b;padding-bottom:20px}
      .brand{font-size:24px;font-weight:800;letter-spacing:1px}
      .muted{color:#666;font-size:12px;line-height:1.6}
      table{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
      th{text-align:left;background:#f7f7f7;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
      .totals{width:280px;margin-left:auto;font-size:13px}
      .totals td{padding:5px 8px}
      .grand{font-size:16px;font-weight:700;color:#f59e0b}
      .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:16px;text-align:center;font-size:12px;color:#888}
    </style></head><body>
      <div class="header">
        <div>
          <div class="brand">MOTO CUSTOM &amp; DETAILING</div>
          <div class="muted">2nd Cross, Indiranagar 100ft Road,<br/>Bangalore 560038 · +91 98765 40000<br/>billing@motoCustom.in</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:18px;font-weight:700">INVOICE</div>
          <div class="muted"># ${inv.bookingNumber}<br/>Date: ${format(new Date(inv.date || inv.createdAt), 'dd MMM yyyy')}</div>
        </div>
      </div>
      <table><tr><th>Bill To</th><th>Vehicle</th></tr>
        <tr><td style="padding:8px 12px">${customerName(inv)}<br/><span class="muted">${customerPhone(inv)}</span></td>
        <td style="padding:8px 12px">${bikeLabel(inv)}</td></tr></table>
      <table><tr><th>#</th><th>Service</th><th>Amount</th></tr>${lines || '<tr><td colspan="3" style="padding:8px 12px">Package booking</td></tr>'}</table>
      <table class="totals">
        <tr><td>Subtotal</td><td style="text-align:right">₹${(inv.subtotal || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td>Discount</td><td style="text-align:right;color:#e53e3e">− ₹${(inv.discount || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td>GST (18%)</td><td style="text-align:right">₹${(inv.tax || 0).toLocaleString('en-IN')}</td></tr>
        <tr class="grand"><td>Total</td><td style="text-align:right">₹${(inv.total || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td>Paid</td><td style="text-align:right;color:#16a34a">₹${(inv.paid || 0).toLocaleString('en-IN')}</td></tr>
        <tr class="grand"><td>Balance Due</td><td style="text-align:right">₹${(inv.outstanding || 0).toLocaleString('en-IN')}</td></tr>
      </table>
      ${pays ? `<table><tr><th>Payment History</th><th>Method</th><th>Amount</th></tr>${pays}</table>` : ''}
      <div class="footer">Thank you for choosing Moto Custom &amp; Detailing.<br/>This is a computer generated invoice.</div>
    </body></html>`;
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Invoice Management" subtitle="Generate and track invoices for every completed and in-progress booking." />

      <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-surface-light border border-border">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer border',
              filter === t.value
                ? 'bg-primary-500/15 text-primary-400 border-primary-500/20'
                : 'text-dark-400 hover:text-white hover:bg-surface-lighter border-transparent'
            )}
          >
            {t.label}
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/5 border border-border">{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices" description="Invoices are generated automatically for every booking." />
      ) : (
        <Card>
          <DataTable columns={columns} data={filtered} />
        </Card>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Invoice ${selected?.bookingNumber || ''}`} size="xl">
        {selected && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <div className="h-1.5 bg-gradient-to-r from-primary-500 to-red-500" />
              <div className="p-6 bg-surface-light">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black tracking-wide text-white">MOTO CUSTOM <span className="text-primary-400">&</span> DETAILING</p>
                    <p className="text-xs text-dark-500 mt-1 leading-relaxed">2nd Cross, Indiranagar 100ft Road,<br />Bangalore 560038 · +91 98765 40000</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-primary-400 font-medium">{selected.bookingNumber}</p>
                    <p className="text-xs text-dark-500 mt-1">Issued: {format(new Date(selected.date || selected.createdAt), 'dd MMM yyyy')}</p>
                    <div className="mt-2">{statusBadge(selected.invoiceStatus)}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-dark-500 font-medium mb-1">Bill To</p>
                  <p className="text-sm font-semibold text-white">{customerName(selected)}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{customerPhone(selected)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-dark-500 font-medium mb-1">Vehicle</p>
                  <p className="text-sm font-semibold text-white">{bikeLabel(selected)}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{selected.timeSlot} on {format(new Date(selected.date), 'dd MMM yyyy')}</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-lighter text-xs uppercase tracking-wider text-dark-400">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Service</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.services || []).map((s, i) => (
                        <tr key={s} className="border-t border-border/60">
                          <td className="px-4 py-2.5 text-dark-500">{i + 1}</td>
                          <td className="px-4 py-2.5 text-white/80">{s}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(Math.round((selected.subtotal || selected.total) / Math.max(1, selected.services.length)))}</td>
                        </tr>
                      ))}
                      {!selected.services.length && (
                        <tr className="border-t border-border/60"><td colSpan="3" className="px-4 py-2.5 text-dark-400">Package booking</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 ml-auto w-full sm:w-80 space-y-1.5 text-sm">
                  <div className="flex justify-between text-dark-400"><span>Subtotal</span><span>{formatCurrency(selected.subtotal || 0)}</span></div>
                  <div className="flex justify-between text-red-400"><span>Discount</span><span>− {formatCurrency(selected.discount || 0)}</span></div>
                  <div className="flex justify-between text-dark-400"><span>GST (18%)</span><span>{formatCurrency(selected.tax || 0)}</span></div>
                  <div className="flex justify-between text-white font-bold text-base border-t border-border pt-2"><span>Total</span><span>{formatCurrency(selected.total)}</span></div>
                  <div className="flex justify-between text-emerald-400"><span>Paid</span><span>{formatCurrency(selected.paid)}</span></div>
                  <div className="flex justify-between text-red-400 font-semibold"><span>Balance due</span><span>{formatCurrency(selected.outstanding)}</span></div>
                </div>
              </div>
              {bookingPayments(selected).length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-[11px] uppercase tracking-wider text-dark-500 font-medium mb-2">Payment History</p>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-lighter text-xs uppercase tracking-wider text-dark-400">
                        <tr><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Method</th><th className="px-4 py-2 text-right">Amount</th></tr>
                      </thead>
                      <tbody>
                        {bookingPayments(selected).map(p => (
                          <tr key={p.id} className="border-t border-border/60">
                            <td className="px-4 py-2 text-white/70">{format(new Date(p.date), 'dd MMM yyyy')}</td>
                            <td className="px-4 py-2 text-white/70">{p.method}</td>
                            <td className="px-4 py-2 text-right text-emerald-400">{formatCurrency(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
              <Button icon={Download} onClick={() => handleDownload(selected)}>Download PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}