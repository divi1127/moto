import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Wrench, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { cn } from '../../utils/helpers';

const COMPACT_STAGES = [
  { label: 'Confirmed', index: 0 },
  { label: 'Received', index: 1 },
  { label: 'Inspection', index: 2 },
  { label: 'Estimate Approved', index: 3 },
  { label: 'Work Started', index: 4 },
  { label: 'Quality Check', index: 10 },
  { label: 'Ready', index: 11 },
];

function position(stageIdx) {
  let cur = 0;
  COMPACT_STAGES.forEach((s, i) => { if (s.index <= stageIdx) cur = i; });
  const progress = cur > 0 ? (cur / (COMPACT_STAGES.length - 1)) * 100 : 0;
  return { cur, progress };
}

function StageDots({ stageIdx, vertical = false }) {
  const { cur, progress } = position(stageIdx);
  return (
    <div className="relative">
      <div className={cn('absolute bg-border rounded-full', vertical ? 'left-[13px] top-0 bottom-0 w-0.5' : 'left-[14px] right-[14px] top-[13px] h-0.5')} />
      <div className={cn('absolute bg-primary-500/70 rounded-full transition-all duration-700', vertical ? 'left-[13px] top-0 w-0.5' : 'left-[14px] top-[13px] h-0.5')} style={vertical ? { height: `${progress}%` } : { width: `${progress}%` }} />
      <div className={cn('relative flex', vertical ? 'flex-col gap-5' : 'items-start justify-between gap-1')}>
        {COMPACT_STAGES.map((stage, i) => {
          const done = i < cur;
          const current = i === cur;
          return (
            <div key={stage.label} className={cn('flex items-center gap-3', vertical ? 'flex-row' : 'flex-col flex-1 min-w-0')}>
              <div className={cn(
                'shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300',
                done && 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
                current && 'bg-primary-500 border-primary-400 text-black shadow-[0_0_0_5px_rgba(245,158,11,0.15)]',
                !done && !current && 'bg-surface-lighter border-border text-dark-600'
              )}>
                {done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
              </div>
              <p className={cn(
                'leading-tight text-center',
                vertical ? 'text-sm' : 'text-[11px] w-full mt-2',
                current ? 'text-white font-medium' : done ? 'text-dark-300' : 'text-dark-600'
              )}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ServiceStatusTimeline({ booking, bikeName, stageIdx }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border bg-surface p-6 sm:p-7 flex flex-col h-full"
    >
      {booking ? (
        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-500">Service Status</p>
                <p className="text-sm font-semibold text-white leading-snug">
                  {booking.bookingNumber}
                  {bikeName ? <span className="text-dark-400 font-normal"> · {bikeName}</span> : null}
                </p>
              </div>
            </div>
            <StatusBadge status={booking.status} size="sm" />
          </div>

          <div className="mt-6 hidden lg:block">
            <StageDots stageIdx={stageIdx} />
          </div>
          <div className="mt-6 lg:hidden">
            <StageDots stageIdx={stageIdx} vertical />
          </div>

          <button
            type="button"
            onClick={() => navigate('/track-service')}
            className="mt-auto pt-6 w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 cursor-pointer"
          >
            View full tracking <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-light text-dark-500 flex items-center justify-center mb-4 pb-0.5">
            <Wrench className="w-6 h-6" />
          </div>
          <p className="font-semibold text-white">No active service</p>
          <p className="text-sm text-dark-400 mt-1">Book your next service and track it live here.</p>
        </div>
      )}
    </motion.div>
  );
}