import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bike, Wrench, Calendar, Clock, CreditCard,
  FileText, History, Star, User, ChevronLeft, ChevronRight, LogOut, Palette, Settings
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import useStore from '../../store/useStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-bikes', icon: Bike, label: 'My Bikes' },
  { to: '/services', icon: Wrench, label: 'Services' },
  { to: '/customization', icon: Palette, label: 'Customization' },
  { to: '/book-service', icon: Calendar, label: 'Book Service' },
  { to: '/my-bookings', icon: Clock, label: 'My Bookings' },
  { to: '/track-service', icon: Settings, label: 'Service Tracking' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/service-history', icon: History, label: 'Service History' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function CustomerSidebar() {
  const { sidebarOpen, toggleSidebar, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 250 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-surface z-40 flex flex-col"
    >
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-red-500 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">MC</span>
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
              <p className="text-sm font-bold text-white whitespace-nowrap tracking-wide">MOTO CUSTOM</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-dark-500 whitespace-nowrap mt-0.5">Detailing Studio</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-4 h-px bg-border/60" />

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
              isActive
                ? 'bg-primary-500/10 text-primary-300'
                : 'text-dark-400 hover:text-white hover:bg-surface-lighter/70'
            )}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="py-3 px-3 flex items-center gap-1 border-t border-border/60">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-2 rounded-lg hover:bg-surface-lighter/70 text-dark-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-[18px] h-[18px]" /> : <ChevronRight className="w-[18px] h-[18px]" />}
        </button>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-dark-500 whitespace-nowrap">
              Collapse menu
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="ml-auto p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </motion.aside>
  );
}