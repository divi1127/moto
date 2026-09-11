import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, ClipboardList, Users, Bike, Wrench,
  Package, Palette, UserCog, Package2, CreditCard, FileText,
  Tag, Star, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/admin/job-cards', icon: ClipboardList, label: 'Job Cards' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/bikes', icon: Bike, label: 'Bikes' },
  { to: '/admin/services', icon: Wrench, label: 'Services' },
  { to: '/admin/packages', icon: Package, label: 'Packages' },
  { to: '/admin/customization', icon: Palette, label: 'Customization' },
  { to: '/admin/staff', icon: UserCog, label: 'Staff' },
  { to: '/admin/inventory', icon: Package2, label: 'Inventory' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/invoices', icon: FileText, label: 'Invoices' },
  { to: '/admin/offers', icon: Tag, label: 'Offers & Coupons' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const { sidebarOpen, toggleSidebar, logout, user } = useStore();
  
  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border z-40 flex flex-col"
    >
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-red-500 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">MC</span>
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-bold text-white whitespace-nowrap">MOTO CUSTOM</p>
              <p className="text-[10px] text-dark-500 whitespace-nowrap">ADMIN PANEL</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-dark-400 hover:text-white hover:bg-surface-lighter'
            )}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
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

      <div className="p-3 border-t border-border">
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar name={user.name} size="sm" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-dark-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-surface-lighter text-dark-400 hover:text-white transition-colors cursor-pointer flex-shrink-0">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button onClick={logout} className="p-2 rounded-xl hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
