import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import CustomerSidebar from './CustomerSidebar';
import TopHeader from '../dashboard/TopHeader';
import MobileNav from './MobileNav';

export default function CustomerLayout() {
  const { sidebarOpen, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="hidden lg:block">
        <CustomerSidebar />
      </div>
      <div
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarOpen ? 250 : 72) : 0 }}
      >
        <TopHeader />
        <main className="flex-1">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}