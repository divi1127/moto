import { Menu, Bell, Search } from 'lucide-react';
import useStore from '../../store/useStore';
import Avatar from '../ui/Avatar';

export default function AdminMobileHeader({ onToggle }) {
  const { user, notifications } = useStore();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="lg:hidden sticky top-0 z-30 bg-dark-950/90 backdrop-blur-xl border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className="p-2 rounded-xl hover:bg-surface-lighter text-white cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-bold text-white leading-none">MOTO CUSTOM</p>
            <p className="text-[10px] text-dark-500 leading-none mt-1 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-dark-400" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>}
          </div>
          {user && <Avatar name={user.name} size="sm" />}
        </div>
      </div>
    </div>
  );
}