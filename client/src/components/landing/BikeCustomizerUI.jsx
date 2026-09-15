import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paintbrush, Sticker, Eye, RotateCcw, Check, Palette } from 'lucide-react';

const COLORS = [
  { id: 'red',    hex: '#cc0000', label: 'Racing Red',    gradient: 'from-red-600 to-red-800' },
  { id: 'black',  hex: '#111111', label: 'Midnight Black', gradient: 'from-neutral-700 to-neutral-950' },
  { id: 'white',  hex: '#e8e8e8', label: 'Pearl White',   gradient: 'from-slate-100 to-slate-300' },
  { id: 'blue',   hex: '#0055cc', label: 'Electric Blue',  gradient: 'from-blue-600 to-blue-900' },
  { id: 'orange', hex: '#e05500', label: 'Matte Orange',  gradient: 'from-orange-500 to-orange-800' },
  { id: 'green',  hex: '#1a6600', label: 'Racing Green',  gradient: 'from-green-700 to-green-950' },
];

const STICKER_SETS = [
  { id: 0, label: 'Brand Logo', icon: '🏁', desc: 'DUCATI side decal' },
  { id: 1, label: 'Racing',     icon: '⚡', desc: 'Gold racing stripe' },
  { id: 2, label: 'Flag',       icon: '🎯', desc: 'Nation flag badge' },
];

const PHASE_LABELS = {
  hero:       { title: 'Design Your Dream Ride',      sub: 'Scroll to begin the experience' },
  drive:      { title: 'The Journey Begins…',         sub: 'Watch the car come alive' },
  transition: { title: 'Meet the Machine',            sub: 'Your Ducati Streetfighter awaits' },
  spin:       { title: '360° View',                   sub: 'Inspect every angle of the bike' },
  paint:      { title: 'Choose Your Color',           sub: 'Pick a paint to apply it live' },
  stickers:   { title: 'Add Your Decals',             sub: 'Toggle sticker sets below' },
  preview:    { title: 'Your Masterpiece',            sub: 'Ready to book? Scroll to confirm' },
};

export default function BikeCustomizerUI({ phase, onColorChange, onStickersChange, selectedColor, activeStickers }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const showColorPicker = phase === 'paint' || phase === 'stickers' || phase === 'preview';
  const showStickerPicker = phase === 'stickers' || phase === 'preview';
  const phaseInfo = PHASE_LABELS[phase] || PHASE_LABELS.hero;

  function toggleSticker(id) {
    if (activeStickers.includes(id)) {
      onStickersChange(activeStickers.filter(s => s !== id));
    } else {
      onStickersChange([...activeStickers, id]);
    }
  }

  return (
    <>
      {/* ── Phase label (top-centre) ── */}
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-24 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-center px-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-2xl"
              style={{ textShadow: '0 0 40px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.9)' }}>
              {phaseInfo.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-amber-400/90 font-medium tracking-wide"
               style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              {phaseInfo.sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scroll progress bar ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-30 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
          style={{ width: `${getPhaseProgress(phase) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* ── Phase badge ── */}
      <div className="absolute top-6 right-6 z-30">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">{phase}</span>
        </motion.div>
      </div>

      {/* ── Color Picker Panel ── */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            key="color-panel"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="customizer-panel absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col gap-4 min-w-[160px]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Paint</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onColorChange(c.hex)}
                    onMouseEnter={() => setHoveredColor(c.id)}
                    onMouseLeave={() => setHoveredColor(null)}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-200"
                    title={c.label}
                  >
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.gradient} ring-2 transition-all duration-200 flex items-center justify-center flex-shrink-0`}
                      style={{
                        ringColor: selectedColor === c.hex ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.1)',
                        boxShadow: selectedColor === c.hex
                          ? '0 0 0 2px #f59e0b, 0 0 12px rgba(245,158,11,0.5)'
                          : '0 0 0 1px rgba(255,255,255,0.12)',
                      }}
                    >
                      {selectedColor === c.hex && (
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-200 ${selectedColor === c.hex ? 'text-amber-400' : 'text-white/60 group-hover:text-white/90'}`}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticker Panel ── */}
      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            key="sticker-panel"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="customizer-panel absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col gap-4 min-w-[160px]">
              <div className="flex items-center gap-2">
                <Sticker className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Decals</span>
              </div>

              <div className="flex flex-col gap-2">
                {STICKER_SETS.map(s => {
                  const active = activeStickers.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSticker(s.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-250 text-left ${
                        active
                          ? 'border-amber-500/60 bg-amber-500/10'
                          : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl leading-none">{s.icon}</span>
                      <div>
                        <p className={`text-xs font-semibold ${active ? 'text-amber-400' : 'text-white/75'}`}>{s.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{s.desc}</p>
                      </div>
                      <div className={`ml-auto w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        active ? 'bg-amber-500 border-amber-500' : 'border-white/20'
                      }`}>
                        {active && <Check className="w-2.5 h-2.5 text-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom info bar ── */}
      <AnimatePresence>
        {phase === 'preview' && (
          <motion.div
            key="preview-bar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-12 left-0 right-0 flex justify-center z-20 pointer-events-none"
          >
            <div className="glass-panel px-8 py-4 rounded-2xl flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">360° Preview</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor || '#cc0000' }} />
                <span className="text-sm text-white/70">
                  {COLORS.find(c => c.hex === selectedColor)?.label || 'Custom Paint'}
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <Sticker className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/70">{activeStickers.length} Decal{activeStickers.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <span className="text-xs text-white/40 pointer-events-auto">
                ↓ Scroll to Book
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll indicator (hero phase) ── */}
      <AnimatePresence>
        {(phase === 'hero' || phase === 'drive') && (
          <motion.div
            key="scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Scroll</span>
            <div className="w-6 h-10 rounded-full border border-white/15 flex items-start justify-center pt-2">
              <motion.div
                className="w-1 h-2 rounded-full bg-amber-400"
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getPhaseProgress(phase) {
  const map = { hero: 0.1, drive: 0.33, transition: 0.5, spin: 0.63, paint: 0.76, stickers: 0.86, preview: 0.96 };
  return map[phase] ?? 0;
}
