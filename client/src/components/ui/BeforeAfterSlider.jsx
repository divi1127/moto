import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function BeforeAfterSlider({ before, after, label = 'Drag' }) {
  const [pos, setPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none touch-none cursor-ew-resize group"
      onMouseDown={e => { setIsDragging(true); handleMove(e.clientX); }}
      onMouseMove={e => isDragging && handleMove(e.clientX)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={e => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
      onTouchMove={e => isDragging && handleMove(e.touches[0].clientX)}
      onTouchEnd={() => setIsDragging(false)}
    >
      <div className="absolute inset-0">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-lighter to-surface">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-dark-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 19H9M9 19L9.5 20M15 19L14.5 20" />
                <path d="M6 17L8 6M8 6h8M8 6l2.5 2M16 6V8.5M16 6l-2.5 2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs font-medium text-dark-500 uppercase tracking-wider">Before</p>
          </div>
        </div>
      </div>
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 via-dark-950 to-red-500/20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 19H9M9 19L9.5 20M15 19L14.5 20" />
                <path d="M6 17L8 6M8 6h8M8 6l2.5 2M16 6V8.5M16 6l-2.5 2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">After</p>
          </div>
        </div>
      </motion.div>
      <div className="absolute inset-y-0" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div className="h-full w-0.5 bg-white/70" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-black" />
            <ChevronRight className="w-4 h-4 text-black -ml-1" />
          </div>
        </div>
      </div>
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[10px] font-semibold text-white uppercase tracking-wider">Before</div>
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-primary-500/80 backdrop-blur text-[10px] font-semibold text-black uppercase tracking-wider">After</div>
    </div>
  );
}
