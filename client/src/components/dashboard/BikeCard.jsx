import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import BikeVisual from '../ui/BikeVisual';
import Button from '../ui/Button';

export default function BikeCard({ bike, index = 0 }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-primary-500/30 hover:shadow-lg hover:shadow-black/30 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/my-bikes/${bike.id}`)}
    >
      <div className="relative h-24 bg-gradient-to-b from-surface-lighter/70 to-transparent flex items-center justify-center overflow-hidden">
        <BikeVisual brand={bike.brand} color={bike.color} className="absolute inset-0" showRider={false} />
      </div>
      <div className="p-5 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-dark-500">{bike.brand}</p>
        <h3 className="text-[15px] font-semibold text-white truncate mt-0.5">{bike.model}</h3>
        <p className="font-mono text-xs text-primary-400 mt-1.5">{bike.registrationNumber}</p>
        <p className="text-xs text-dark-400 mt-2">
          {bike.year}{bike.color ? ` · ${bike.color}` : ''}{bike.mileage ? ` · ${bike.mileage} km` : ''}
        </p>
        <div className="mt-4 pt-4 border-t border-border/70 flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={e => { e.stopPropagation(); navigate('/book-service'); }}>
            Book service
          </Button>
          <Button size="sm" variant="ghost" className="flex-1" onClick={e => { e.stopPropagation(); navigate(`/my-bikes/${bike.id}`); }}>
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}