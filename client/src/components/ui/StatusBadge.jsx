import { cn, getStatusConfig } from '../../utils/helpers';

export default function StatusBadge({ status, size = 'sm' }) {
  const config = getStatusConfig(status);
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config.bg, config.color, config.border
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}