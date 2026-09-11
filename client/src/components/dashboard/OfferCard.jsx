import { motion } from 'framer-motion';
import { BadgePercent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/helpers';

export default function OfferCard({ coupon, index = 0 }) {
  const navigate = useNavigate();
  const IntroIcon = BadgePercent;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 hover:border-primary-500/25 transition-colors"
    >
      <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 flex-shrink-0">
        <IntroIcon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-bold text-primary-300 tracking-wide">{coupon.code}</p>
        <p className="text-sm text-dark-300 mt-0.5 leading-snug">
          {coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatCurrency(coupon.value)} off`}
          <span className="text-dark-500"> · above {formatCurrency(coupon.minimumAmount)}</span>
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="flex-shrink-0"
        onClick={() => navigate('/services')}
      >
        Apply
      </Button>
    </motion.div>
  );
}