import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../ui/Button';

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '#services', label: 'Services' },
    { href: '#before-after', label: 'Transformations' },
    { href: '#packages', label: 'Packages' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#why-us', label: 'Why Us' },
    { href: '#reviews', label: 'Reviews' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-dark-950/90 backdrop-blur-xl border-b border-border py-3' : 'bg-transparent py-5'
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-red-500 flex items-center justify-center">
            <span className="text-black font-black text-sm">MC</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">MOTO CUSTOM</p>
            <p className="text-[10px] text-dark-500 leading-none mt-1 tracking-widest uppercase">Detailing Studio</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.map(link => (
            <a key={link.href} href={link.href} className="text-sm text-dark-300 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:+919800000000" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white transition-colors">
            <Phone className="w-4 h-4" /> +91 98000 00000
          </a>
          {user ? (
            <Button size="md" onClick={() => navigate(user.role === 'admin' || user.role === 'staff' || user.role === 'manager' ? '/admin' : '/dashboard')}>
              {user.role === 'admin' || user.role === 'staff' || user.role === 'manager' ? 'Admin Panel' : 'My Dashboard'}
            </Button>
          ) : (
            <>
              <Button size="md" variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button size="md" onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2 rounded-xl hover:bg-surface-lighter text-white cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-dark-950/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {links.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-dark-300 hover:text-white">
                  {link.label}
                </a>
              ))}
              <div className="pt-4 pb-2 flex flex-col gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/dashboard' : '/register')}>
                  {user ? 'My Dashboard' : 'Book a Service'}
                </Button>
                {!user && <Button size="lg" variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
