import { cn } from '../../utils/helpers';

export default function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-dark-300">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={cn(
            'w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-white',
            'placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50',
            'transition-all duration-200',
            Icon && 'pl-10',
            error && 'border-red-500/50 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}