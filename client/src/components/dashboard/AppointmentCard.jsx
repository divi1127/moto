import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Truck, ChevronRight, Bike } from 'lucide-react';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { formatDateTimeLabel, getCountdown, timeSlotTo24 } from '../../pages/customer/customerShared';

function Countdown({ target }) {
  const [cd, setCd] = useState(() => getCountdown(target));
  useEffect(() => {
    const t = setInterval(() => setCd(getCountdown(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (!target || cd.past) return null;
  const units = [
    { label: 'Days', value: cd.days },
    { label: 'Hours', value: cd.hours },
    { label: 'Minutes', value: cd.minutes },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {units.map(u => (
        <div key={u.label} className="rounded-xl border border-border bg-surface-light/50 py-3.5 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{u.value}</p>
          <p className="text-[11px] uppercase tracking-wider text-dark-500 mt-1">{u.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentCard({ booking, bike }) {
  const navigate = useNavigate();
  const target = booking
    ? new Date(`${booking.date}T${timeSlotTo24(booking.timeSlot)}:00`)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-surface p-6 sm:p-7 flex flex-col h-full overflow-hidden relative"
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-500/[0.08] blur-3xl pointer-events-none" />

      {booking ? (
        <div className="relative flex-1 flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-500">Next Appointment</p>
                <p className="text-base font-semibold text-white">
                  {formatDateTimeLabel(booking.date, booking.timeSlot)}
                </p>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {bike && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface-light/40 px-4 py-3">
              <Bike className="w-[18px] h-[18px] text-primary-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-dark-400 leading-tight">Your motorcycle</p>
                <p className="text-[15px] font-semibold text-white leading-snug truncate">
                  {bike.brand} {bike.model}
                </p>
              </div>
              <p className="ml-auto hidden sm:block font-mono text-xs text-dark-500">{booking.bookingNumber}</p>
            </div>
          )}

          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-500 mb-2.5">Services</p>
            <div className="flex flex-wrap gap-2">
              {booking.services?.slice(0, 4).map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-surface-lighter text-dark-200 border border-border">
                  {s}
                </span>
              ))}
              {booking.pickupDrop && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-300 border border-primary-500/20">
                  <Truck className="w-3.5 h-3.5" /> Pickup & Drop
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <Countdown target={target} />
          </div>

          <div className="mt-auto pt-6 flex flex-wrap gap-3">
            <Button size="md" onClick={() => navigate('/my-bookings')}>
              View booking <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="md" variant="outline" onClick={() => navigate('/track-service')}>
              <Clock className="w-4 h-4" /> Track service
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-surface-light text-dark-500 flex items-center justify-center mb-4">
            <CalendarDays className="w-6 h-6" />
          </div>
          <p className="font-semibold text-white">No upcoming appointment</p>
          <p className="text-sm text-dark-400 mt-1 mb-5">Book your next service and we'll keep you posted here.</p>
          <Button size="md" onClick={() => navigate('/services')}>Explore services</Button>
        </div>
      )}
    </motion.div>
  );
}