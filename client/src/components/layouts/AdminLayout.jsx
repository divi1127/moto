import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../../store/useStore';
import AdminSidebar from './AdminSidebar';
import AdminMobileHeader from './AdminMobileHeader';

export default function AdminLayout() {
  const { sidebarOpen, user } = useStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-950">
      {isMobile ? (
        <>
          <AdminMobileHeader onToggle={() => setMobileMenuOpen(o => !o)} />
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="fixed top-0 left-0 bottom-0 z-50">
                  <AdminSidebar />
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <AdminSidebar />
      )}
      <div
        style={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 260 : 72) }}
        className="transition-all duration-300 min-h-screen flex flex-col"
      >
        <main className="flex-1">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}