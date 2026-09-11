import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { PageHeader, SectionTitle, PageState, usePageLoading } from './adminShared';
import { format } from 'date-fns';
import { Star, MessageSquare, Check, X, EyeOff, Reply, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STAR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#fbbf24'];

function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? 'fill-primary-400 text-primary-400' : 'text-dark-600')} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { reviews, users, bookings, updateReview } = useStore();
  const loading = usePageLoading();
  const [filter, setFilter] = useState('all');
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const stats = useMemo(() => {
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const distribution = [0, 1, 2, 3, 4, 5].map(n => ({ stars: n, count: reviews.filter(r => Math.round(r.rating) === n).length }));
    return {
      avg,
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      distribution,
    };
  }, [reviews]);

  const tabs = [
    { value: 'all', label: 'All', count: reviews.length },
    { value: 'approved', label: 'Approved', count: stats.approved },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'rejected', label: 'Rejected', count: reviews.filter(r => r.status === 'rejected').length },
  ];

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  const customerName = r => users.find(u => u.id === r.userId)?.name || 'Unknown customer';
  const bookingNumber = r => bookings.find(b => b.id === r.bookingId)?.bookingNumber || '—';

  const statusBadge = s => {
    const configs = {
      approved: { label: 'Approved', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
      pending: { label: 'Pending', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400' },
      rejected: { label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
      hidden: { label: 'Hidden', cls: 'text-gray-400 bg-gray-500/10 border-gray-500/20', dot: 'bg-gray-400' },
    };
    const c = configs[s];
    return <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border', c.cls)}><span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />{c.label}</span>;
  };

  const setStatus = (r, status) => {
    updateReview(r.id, { status });
    const labels = { approved: 'approved', rejected: 'rejected', hidden: 'hidden away' };
    toast.success(`Review ${labels[status]}`);
  };

  const startRespond = r => {
    setRespondingId(respondingId === r.id ? null : r.id);
    setResponseText(r.response || '');
  };

  const sendResponse = r => {
    updateReview(r.id, { response: responseText.trim() });
    toast.success('Response published to customer');
    setRespondingId(null);
    setResponseText('');
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Reviews & Ratings" subtitle="Moderate customer feedback and respond to published reviews." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="flex flex-col items-center justify-center text-center py-8 lg:h-full">
            <p className="text-[11px] uppercase tracking-wider text-dark-500 font-medium">Average Rating</p>
            <p className="text-5xl font-black text-white mt-2">{stats.avg.toFixed(1)}</p>
            <Stars value={stats.avg} size="w-6 h-6" />
            <p className="text-xs text-dark-500 mt-3">{stats.total} review{stats.total !== 1 ? 's' : ''} received</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="h-full">
            <SectionTitle icon={ThumbsUp} title="Rating Distribution" />
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = stats.distribution[stars]?.count || 0;
                const pct = stats.total ? (count / stats.total) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-10 text-sm text-dark-400 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />{stars}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-surface-lighter overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: STAR_COLORS[stars - 1] }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-dark-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

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
        <EmptyState icon={MessageSquare} title="No reviews here" description="Customer reviews will show up once they submit feedback." />
      ) : (
        <div className="space-y-4">
          {filtered.map((r, i) => {
            const responding = respondingId === r.id;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-red-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0">
                        {customerName(r).split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{customerName(r)}</p>
                        <p className="text-xs text-dark-500">Booking <span className="font-mono">{bookingNumber(r)}</span> · {format(new Date(r.date), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} />
                      {statusBadge(r.status)}
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-dark-200 leading-relaxed">"{r.comment}"</p>

                  {r.response && (
                    <div className="mt-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                      <p className="text-[11px] uppercase tracking-wider text-primary-400 font-medium mb-1">Response from Moto Custom</p>
                      <p className="text-sm text-dark-300">{r.response}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
                    {r.status === 'pending' && <Button size="sm" icon={Check} onClick={() => setStatus(r, 'approved')}>Approve</Button>}
                    {r.status !== 'rejected' && <Button size="sm" variant="danger" icon={X} onClick={() => setStatus(r, 'rejected')}>Reject</Button>}
                    {r.status !== 'hidden' && <Button size="sm" variant="secondary" icon={EyeOff} onClick={() => setStatus(r, 'hidden')}>Hide</Button>}
                    <Button size="sm" variant="outline" icon={Reply} onClick={() => startRespond(r)}>{r.response ? 'Edit response' : 'Respond'}</Button>
                  </div>

                  {responding && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                      <Textarea
                        label="Your response"
                        value={responseText}
                        placeholder="Thank the customer and address any feedback..."
                        onChange={e => setResponseText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="secondary" size="sm" onClick={() => setRespondingId(null)}>Cancel</Button>
                        <Button size="sm" icon={Reply} disabled={!responseText.trim()} onClick={() => sendResponse(r)}>Publish response</Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}