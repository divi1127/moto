import { useState, useEffect, useMemo } from 'react';
import { History, Image as ImageIcon, Info, Receipt, ShieldCheck, StickyNote, UserRound, Wrench } from 'lucide-react';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading, formatDate, formatDateTimeLabel, InfoRow, SectionTitle } from './customerShared';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

export default function ServiceHistory() {
  const { user, users, getCustomerBikes, getCustomerBookings, getBikeById, getBookingPayments, getUserById, jobCards } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [bikeFilter, setBikeFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  useEffect(() => { setError(!userId); }, [userId]);

  const bikes = useMemo(() => (userId ? getCustomerBikes(userId) : []), [userId, getCustomerBikes]);

  const history = useMemo(() => {
    if (!userId) return [];
    return [...getCustomerBookings(userId)]
      .filter(b => b.status === 'completed')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [userId, getCustomerBookings]);

  const filtered = bikeFilter === 'all' ? history : history.filter(b => b.bikeId === bikeFilter);

  const detailBike = detail ? getBikeById(detail.bikeId) : null;
  const detailJobCard = detail ? jobCards.find(j => j.bookingId === detail.id) : null;
  const detailPayments = detail ? getBookingPayments(detail.id) : null;
  const totalPaid = (detailPayments || []).reduce((s, p) => s + (p.amount || 0), 0);

  const photos = ['Wash', 'Detailing', 'Polish', 'Final'];

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="Service History"
        subtitle="A complete record of every service your bikes have received."
      >
        <Select
          label=""
          className="w-56"
          placeholder="All bikes"
          options={bikes.map(b => ({ value: b.id, label: `${b.brand} ${b.model}` }))}
          value={bikeFilter}
          onChange={e => setBikeFilter(e.target.value)}
        />
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No service history yet"
          description="Completed services will appear here with full job card details, photos and invoices."
        />
      ) : (
        <Card>
          <DataTable
            searchable
            pageSize={8}
            data={filtered}
            onRowClick={setDetail}
            columns={[
              { header: 'Date', accessor: 'date', sortable: true, render: row => <span className="text-white/80">{formatDate(row.date)}</span> },
              {
                header: 'Bike', accessor: 'bikeId', sortable: true,
                render: row => {
                  const b = getBikeById(row.bikeId);
                  return b ? <span className="text-white">{b.brand} {b.model}</span> : <span className="text-dark-500">—</span>;
                },
              },
              { header: 'Service', accessor: 'services', render: row => <span className="text-xs text-white/70">{row.services?.join(', ')}</span> },
              { header: 'Amount', accessor: 'total', sortable: true, render: row => <span className="font-medium text-white">{formatCurrency(row.total)}</span> },
              { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} size="sm" /> },
            ]}
          />
        </Card>
      )}

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail?.bookingNumber} size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={detail.status} />
              <span className="text-xs text-dark-400">{formatDateTimeLabel(detail.date, detail.timeSlot)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoRow icon={Wrench} label="Bike" value={detailBike ? `${detailBike.brand} ${detailBike.model}` : '—'} />
              <InfoRow icon={ShieldCheck} label="Registration" value={detailBike?.registrationNumber || '—'} />
              <InfoRow icon={Receipt} label="Total Amount" value={formatCurrency(detail.total)} />
            </div>

            <div>
              <SectionTitle icon={ImageIcon} title="Service Photos" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map(p => (
                  <div key={p} className="aspect-square rounded-xl border border-dashed border-border bg-surface-light/50 flex flex-col items-center justify-center gap-2 text-center p-3">
                    <ImageIcon className="w-6 h-6 text-dark-600" />
                    <span className="text-[10px] text-dark-500">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {detailJobCard && (
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-border bg-surface-light/60 p-4">
                  <SectionTitle icon={StickyNote} title="Work Notes" />
                  <p className="text-xs text-dark-300 leading-relaxed">{detailJobCard.workNotes}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-light/60 p-4">
                  <SectionTitle icon={Info} title="Inspection Notes" />
                  <p className="text-xs text-dark-300 leading-relaxed">{detailJobCard.inspectionNotes}</p>
                </div>
              </div>
            )}

            <div>
              <SectionTitle icon={UserRound} title="Assigned Staff" />
              {detailJobCard?.assignedStaff?.length ? (
                <div className="flex flex-wrap gap-3">
                  {detailJobCard.assignedStaff.map(id => {
                    const staff = getUserById(id);
                    return (
                      <div key={id} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-light/60 px-3.5 py-2.5">
                        <Avatar name={staff?.name} size="sm" />
                        <div>
                          <p className="text-xs font-medium text-white">{staff?.name}</p>
                          <p className="text-[10px] text-dark-500">{staff?.specialization || 'Technician'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-dark-400">No staff record available.</p>
              )}
            </div>

            <div>
              <SectionTitle icon={Receipt} title="Invoice & Payments" />
              <div className="rounded-xl border border-border divide-y divide-border">
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Invoice total</span><span className="text-white">{formatCurrency(detail.total)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Total paid</span><span className="text-emerald-400">{formatCurrency(totalPaid)}</span></div>
                <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-dark-400">Balance</span><span className={cn('font-semibold', detail.balance > 0 ? 'text-yellow-400' : 'text-emerald-400')}>{formatCurrency(detail.balance)}</span></div>
              </div>
              {detailPayments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {detailPayments.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-light/60 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-white">{formatCurrency(p.amount)} · {p.method}</p>
                        <p className="text-[10px] text-dark-500 font-mono">{p.transactionId}</p>
                      </div>
                      <span className="text-[10px] text-dark-400">{formatDate(p.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle icon={Info} title="Services Rendered" />
              <div className="space-y-1.5">
                {detail.services?.map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm text-dark-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {detail.notes && (
              <div className="rounded-xl border border-border bg-surface-light/60 p-4">
                <p className="text-[10px] uppercase tracking-wider text-dark-500 mb-1">Customer Notes</p>
                <p className="text-sm text-dark-300 italic">"{detail.notes}"</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}