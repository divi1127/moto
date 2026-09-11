import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bike, Calendar, Clock, User } from 'lucide-react';
import { cn } from '../../utils/helpers';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/services', icon: Bike, label: 'Services' },
  { to: '/book-service', icon: Calendar, label: 'Book' },
  { to: '/my-bookings', icon: Clock, label: 'Bookings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/90 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {items.map(item => {
          const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 flex-1"
            >
              <div className={cn(
                'w-10 h-7 rounded-lg flex items-center justify-center transition-colors',
                isActive ? 'bg-primary-500/10 text-primary-400' : 'text-dark-500'
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-primary-400' : 'text-dark-500')}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}