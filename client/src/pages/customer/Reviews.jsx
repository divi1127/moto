import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading, formatDate, StarRating, Stars, SectionTitle } from './customerShared';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

const CATEGORIES = [
  { key: 'quality', label: 'Service Quality' },
  { key: 'staff', label: 'Staff Behavior' },
  { key: 'customization', label: 'Customization' },
  { key: 'value', label: 'Value for Money' },
  { key: 'overall', label: 'Overall' },
];

export default function Reviews() {
  const { user, users, getCustomerBookings, getBookingById, reviews, addReview } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [ratings, setRatings] = useState({ quality: 0, staff: 0, customization: 0, value: 0, overall: 0 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;

  useEffect(() => { setError(!userId); }, [userId]);

  const completed = useMemo(() => {
    if (!userId) return [];
    return [...getCustomerBookings(userId)]
      .filter(b => b.status === 'completed')
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [userId, getCustomerBookings]);

  const reviewedBookingIds = new Set(reviews.filter(r => r.userId === userId).map(r => r.bookingId));
  const writable = completed.filter(b => !reviewedBookingIds.has(b.id));

  const myReviews = useMemo(() => {
    if (!userId) return [];
    return [...reviews.filter(r => r.userId === userId)].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [reviews, userId]);

  const setRating = (key, value) => setRatings(r => ({ ...r, [key]: value }));

  const submit = () => {
    const missingScore = CATEGORIES.find(c => (ratings[c.key] || 0) === 0);
    if (!bookingId) return toast.error('Select a completed booking');
    if (missingScore) return toast.error(`Please rate ${missingScore.label}`);
    if (comment.trim().length < 10) return toast.error('Please write a comment of at least 10 characters');
    setSubmitting(true);
    setTimeout(() => {
      addReview({
        userId,
        bookingId,
        comment: comment.trim(),
        rating: ratings.overall,
        categoryRatings: { ...ratings },
      });
      setSubmitting(false);
      toast.success('Review submitted! Thank you for your feedback');
      setBookingId('');
      setRatings({ quality: 0, staff: 0, customization: 0, value: 0, overall: 0 });
      setComment('');
    }, 700);
  };

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="Reviews & Ratings"
        subtitle="Share your experience and help us craft better rides for you."
      >
        {myUser && (
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Star className="w-4 h-4 text-primary-400 fill-primary-400" />
            <span>{myReviews.length} review{myReviews.length !== 1 ? 's' : ''} submitted</span>
          </div>
        )}
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-red-500" />
          <SectionTitle icon={MessageSquare} title="Write a Review" />
          {writable.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-dark-300">{completed.length === 0 ? 'No completed services yet — reviews open once a service wraps up.' : 'You have reviewed every completed service. Ride safely!'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="max-w-md">
                <Select
                  label="Booking"
                  placeholder="Select a completed booking"
                  options={writable.map(b => {
                    const label = `${b.bookingNumber} · ${formatDate(b.date)}`;
                    return { value: b.id, label };
                  })}
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <div key={cat.key} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-light/60 p-4">
                    <p className="text-sm font-medium text-white">{cat.label}</p>
                    <StarRating value={ratings[cat.key]} onChange={v => setRating(cat.key, v)} />
                  </div>
                ))}
              </div>

              <Textarea
                label="Your experience"
                placeholder="Tell us how your bike turned out — the good, the great, and the detailed..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />

              <div className="flex justify-end">
                <Button loading={submitting} icon={Send} onClick={submit}>Submit review</Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <div>
        <SectionTitle icon={Star} title="Previous Reviews" />
        {myReviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Reviews you submit will show up here for others to read."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myReviews.map((r, i) => {
              const b = getBookingById(r.bookingId);
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold text-primary-400">{b?.bookingNumber || 'Booking'}</p>
                        <p className="text-xs text-dark-500 mt-0.5">{formatDate(r.date)}</p>
                      </div>
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                    <div className="mt-3">
                      <Stars value={r.rating} size="w-5 h-5" />
                    </div>
                    <p className="mt-3 text-sm text-dark-300 leading-relaxed">"{r.comment}"</p>
                    {r.categoryRatings && (
                      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2">
                        {CATEGORIES.map(cat => (
                          <div key={cat.key} className="flex items-center justify-between text-xs">
                            <span className="text-dark-500">{cat.label}</span>
                            <Stars value={r.categoryRatings[cat.key] || 0} size="w-3 h-3" />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}