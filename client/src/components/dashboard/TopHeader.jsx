import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import useStore from '../../store/useStore';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/helpers';

const intentIcons = {
  booking: 'CalendarCheck',
  service: 'Wrench',
  payment: 'Wallet',
  reminder: 'Bell',
  invoice: 'FileText',
};

const SECTION_TITLES = [
  { match: '/dashboard', title: 'Dashboard' },
  { match: '/my-bikes', title: 'My Bikes' },
  { match: '/services', title: 'Services' },
  { match: '/customization', title: 'Customization' },
  { match: '/book-service', title: 'Book Service' },
  { match: '/my-bookings', title: 'My Bookings' },
  { match: '/track-service', title: 'Service Tracking' },
  { match: '/payments', title: 'Payments' },
  { match: '/invoices', title: 'Invoices' },
  { match: '/service-history', title: 'Service History' },
  { match: '/reviews', title: 'Reviews' },
  { match: '/profile', title: 'Profile' },
];

function timeAgo(dateString) {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'dd MMM, hh:mm a');
  } catch {
    return '';
  }
}

export default function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, notifications, markNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);

  const section = SECTION_TITLES.find(s => location.pathname.startsWith(s.match))?.title || '';
  const unread = notifications.filter(n => !n.read).length;
  const displayName = user?.name || 'Rider';

  const toggleNotifications = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markNotificationsRead();
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center border-b border-border/70 bg-dark-950/85 backdrop-blur-md">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="hidden sm:inline text-xs text-dark-500">Moto Custom</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-dark-600" />
          <span className="text-sm font-semibold text-white truncate">{section || 'Account'}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              aria-label={`Notifications (${unread} unread)`}
              onClick={toggleNotifications}
              className="relative p-2 rounded-xl text-dark-400 hover:text-white hover:bg-surface-lighter transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 z-50 rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      <span className="text-xs text-dark-500">
                        {unread > 0 ? `${unread} new` : 'All caught up'}
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-dark-500 px-5 py-8 text-center">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div key={n.id} className={cn('px-5 py-3 border-b border-border/50 last:border-b-0', !n.read && 'bg-primary-500/[0.04]')}>
                            <div className="flex items-start gap-3">
                              <span className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase',
                                !n.read ? 'bg-primary-500/15 text-primary-300' : 'bg-surface-lighter text-dark-500'
                              )}>
                                {(intentIcons[n.type] || 'Bell').slice(0, 4)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                                <p className="text-xs text-dark-400 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[11px] text-dark-600 mt-1">{timeAgo(n.date)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 rounded-xl py-1 pl-1 pr-2 hover:bg-surface-lighter transition-colors cursor-pointer"
          >
            <Avatar name={displayName} size="sm" />
            <span className="hidden xl:block text-left">
              <span className="block text-sm font-medium text-white leading-tight">{displayName}</span>
              <span className="block text-xs text-dark-500 leading-tight">{user?.email}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}