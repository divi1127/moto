import { cn } from '../../utils/helpers';
import { getStatusConfig } from '../../utils/helpers';

export default function Badge({ status, children, className, size = 'sm' }) {
  const config = status ? getStatusConfig(status) : null;
  const label = children || config?.label || status;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config ? `${config.bg} ${config.color} ${config.border}` : 'bg-dark-700 text-dark-300 border-dark-600',
      className
    )}>
      {config && <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />}
      {label}
    </span>
  );
}