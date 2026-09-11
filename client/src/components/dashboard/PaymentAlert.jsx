import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/helpers';

export default function PaymentAlert({ amount, bookingsCount, onPay }) {
  if (!amount || amount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-5 sm:px-6 py-4"
    >
      <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">
          Payment due of <span className="text-amber-400">{formatCurrency(amount)}</span>
        </p>
        <p className="text-sm text-dark-400 mt-0.5">
          {bookingsCount} booking{bookingsCount > 1 ? 's' : ''} awaiting settlement. Clear dues to keep your service on priority.
        </p>
      </div>
      <Button variant="outline" size="md" onClick={onPay} className="flex-shrink-0">
        Pay now <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}