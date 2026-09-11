import { Bell, Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Avatar from '../ui/Avatar';

export default function TopNav({ title }) {
  const { user, notifications } = useStore();
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-xl border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search customers, bikes, bookings..."
              className="w-72 bg-surface-light border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:w-96 transition-all duration-300"
            />
          </div>
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl hover:bg-surface-lighter text-dark-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {user && <Avatar name={user.name} size="md" />}
        </div>
      </div>
    </header>
  );
}
