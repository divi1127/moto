import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export function usePageLoading(delay = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

export function PageState({ loading, children }) {
  if (loading) return <div className="py-24"><LoadingSpinner size="lg" /></div>;
  return children;
}

export function PageHeader({ title, subtitle, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-dark-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function SectionTitle({ icon: Icon, title, action, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-5 h-5 text-primary-400" />}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 p-1 rounded-xl bg-surface-light border border-border', className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer border',
            active === tab.value
              ? 'bg-primary-500/15 text-primary-400 border-primary-500/20'
              : 'text-dark-400 hover:text-white hover:bg-surface-lighter border-transparent'
          )}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/5 border border-border">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-dark-500 mt-0.5">{description}</p>}
      </div>
      <div className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0',
        checked ? 'bg-primary-500' : 'bg-surface-lighter border border-border group-hover:border-dark-600'
      )}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')}
        />
      </div>
    </button>
  );
}