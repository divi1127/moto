import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const demoAccounts = [
  { label: 'Admin', email: 'admin@motocustom.in', password: 'admin123', role: 'admin' },
  { label: 'Manager', email: 'manager@motocustom.in', password: 'manager123', role: 'manager' },
  { label: 'Staff', email: 'ajay@motocustom.in', password: 'staff123', role: 'staff' },
  { label: 'Customer', email: 'arjun.mehta@gmail.com', password: 'customer123', role: 'customer' },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
        const role = result.user.role;
        if (role === 'admin' || role === 'manager' || role === 'staff') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error('Invalid email or password');
        setErrors({ password: 'Invalid credentials, try a demo account below' });
      }
    }, 800);
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-sm text-dark-400">Sign in to access your dashboard</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
          icon={Mail}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          icon={Lock}
        />
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs text-dark-400 hover:text-primary-400 font-medium transition-colors">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign In <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <div className="text-center text-sm">
        <span className="text-dark-400">Don't have an account? </span>
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-xs text-dark-500 text-center mb-3 font-medium uppercase tracking-wider">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map(acc => (
            <motion.button
              key={acc.role}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => fillDemo(acc)}
              className="text-left px-3 py-2 rounded-xl border border-border bg-surface-lighter/50 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all cursor-pointer"
            >
              <p className="text-xs font-semibold text-white capitalize">{acc.label}</p>
              <p className="text-[10px] text-dark-500 truncate">{acc.email}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
