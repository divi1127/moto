import { cn } from '../../utils/helpers';

export default function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-dark-300">{label}</label>}
      <textarea
        className={cn(
          'w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-white',
          'placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50',
          'transition-all duration-200 resize-none min-h-[100px]',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}