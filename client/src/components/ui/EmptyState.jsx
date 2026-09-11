import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, onAction, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-lighter flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-dark-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-dark-400 max-w-sm mb-6">{description}</p>
      {action && <Button onClick={onAction}>{action}</Button>}
    </motion.div>
  );
}