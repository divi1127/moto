import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export default function Card({ children, className, hover = false, glass = false, padding = true, ...props }) {
  const Comp = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Comp
      className={cn(
        'rounded-2xl border',
        glass ? 'glass border-white/5' : 'bg-surface border-border',
        padding && 'p-6',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  );
}