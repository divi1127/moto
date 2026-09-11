import { cn } from '../../utils/helpers';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, error, options, placeholder, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-dark-300">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            'w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-white appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50',
            'transition-all duration-200',
            error && 'border-red-500/50',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map(opt => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}