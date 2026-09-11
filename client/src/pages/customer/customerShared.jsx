import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

export const WORKFLOW_STAGES = [
  'Booking Confirmed',
  'Bike Received',
  'Inspection',
  'Estimate Approved',
  'Work Assigned',
  'Customization',
  'Painting',
  'Sticker Installation',
  'Detailing',
  'Ceramic / PPF',
  'Quality Check',
  'Ready for Pickup',
  'Completed',
];

const STAGE_MAP = {
  pending: 0, confirmed: 0, received: 1, inspection: 2, approved: 3,
  'in-progress': 4, painting: 6, detailing: 8, ceramic: 9,
  'quality-check': 10, ready: 11, completed: 12,
};

export function statusToStageIndex(status) {
  return STAGE_MAP[status] ?? 0;
}

export function usePageLoading(delay = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
}

export function formatDateTimeLabel(date, timeSlot) {
  return timeSlot ? `${formatDate(date)} · ${timeSlot}` : formatDate(date);
}

export function timeSlotTo24(ts = '10:00 AM') {
  const [timePart, meridiem] = (ts || '10:00 AM').split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isCancellable(status) {
  return ['pending', 'confirmed'].includes(status);
}

export function getCountdown(target) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    past: false,
  };
}

export function PageState({ loading, error, onRetry, children }) {
  if (loading) return <div className="py-24"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorState onRetry={onRetry} />;
  return children;
}

export function ErrorState({ title = 'Could not load content', message = 'Something went wrong while fetching your data. Please try again.', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-red-500/20 bg-red-500/5"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-dark-400 max-w-sm mb-6">{message}</p>
      <Button variant="danger" onClick={onRetry || (() => window.location.reload())} icon={RefreshCcw}>Try again</Button>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-dark-400 mt-1 max-w-xl">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function SectionTitle({ icon: Icon, title, action, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-5 h-5 text-primary-400" />}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-light/60 border border-border/60">
      {Icon && <div className="p-2 rounded-lg bg-surface-lighter text-primary-400 flex-shrink-0"><Icon className="w-4 h-4" /></div>}
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-dark-500 font-medium">{label}</p>
        <p className="text-sm font-medium text-white mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-dark-500 mt-0.5">{description}</p>}
      </div>
      <div className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0',
        checked ? 'bg-primary-500' : 'bg-surface-lighter border border-border group-hover:border-dark-600'
      )}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')}
        />
      </div>
    </button>
  );
}

export function StarRating({ value = 0, onChange, size = 'w-6 h-6', readonly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={cn('transition-transform', !readonly && 'hover:scale-125 cursor-pointer', readonly && 'cursor-default')}
        >
          <Star className={cn(size, n <= value ? 'fill-primary-400 text-primary-400' : 'text-dark-600')} />
        </button>
      ))}
    </div>
  );
}

export function Stars({ value = 0, size = 'w-4 h-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? 'fill-primary-400 text-primary-400' : 'text-dark-600')} />
      ))}
    </div>
  );
}