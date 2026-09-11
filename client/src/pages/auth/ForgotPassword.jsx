import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success('Reset link sent to your email');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Reset your password</h2>
        <p className="text-sm text-dark-400">We'll send you a secure link to set a new password.</p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Check your inbox</h3>
          <p className="text-sm text-dark-400 mb-6">
            A password reset link has been sent to <span className="text-white font-medium">{email}</span>.
            The link expires in 30 minutes.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="ghost" onClick={() => { setSent(false); setEmail(''); }}>
              Resend link
            </Button>
            <Link to="/login" className="w-full">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            error={error}
            icon={Mail}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="pt-2 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-white font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}