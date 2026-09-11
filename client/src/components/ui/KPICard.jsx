import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, trend, trendValue, color = 'primary-500', delay = 0 }) {
  const animatedValue = useAnimatedCounter(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-surface border border-border rounded-2xl p-6 hover:border-primary-500/20 transition-all duration-300 group h-full flex flex-col"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5 min-w-0 flex-1">
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-[26px] leading-tight font-bold text-white tracking-tight">
            {typeof value === 'number' ? animatedValue.toLocaleString('en-IN') : value}
          </p>
          {trendValue && (
            <div className={cn('flex items-center gap-1 text-xs font-medium',
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform')}
          style={{ backgroundColor: `color-mix(in srgb, var(--color-${color}) 10%, transparent)`, color: `var(--color-${color})` }}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
    </motion.div>
  );
}