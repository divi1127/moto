import { cn, getInitials } from '../../utils/helpers';

export default function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const colors = [
    'from-primary-500 to-red-500',
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-yellow-500',
  ];

  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  if (src) {
    return (
      <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
    );
  }

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white',
      sizes[size],
      colors[colorIndex],
      className
    )}>
      {getInitials(name)}
    </div>
  );
}