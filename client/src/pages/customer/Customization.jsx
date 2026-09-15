import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Palette, Paintbrush, Sticker, Check, ChevronRight, Send, Info,
  Sparkles, Trash2, RefreshCcw, MousePointerClick, Fuel, Shield, Box,
  Square, Wind, Circle, Armchair, Flame,
} from 'lucide-react';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading } from './customerShared';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import BeforeAfterSlider from '../../components/ui/BeforeAfterSlider';
import BikeWorkspace from '../../components/customizer/BikeWorkspace';
import StickerPreview from '../../components/customizer/StickerPreview';
import useBikeCanvas from '../../components/customizer/useBikeCanvas';
import {
  CUSTOM_PARTS, partById, FINISH_TYPES, STICKER_DEFS, STICKER_CATEGORIES,
  getDesignEstimate, toServiceLines,
} from '../../components/customizer/partPresets';
import { paintColors } from '../../data/mockData';

const PART_ICONS = {
  tank: Fuel,
  'front-mudguard': Shield,
  'rear-body': Box,
  'side-panel': Square,
  visor: Wind,
  'rim-front': Circle,
  'rim-rear': Circle,
  seat: Armchair,
  exhaust: Flame,
};

const TABS = [
  { id: 'paint', label: 'Parts & colors', icon: Palette },
  { id: 'sticker', label: 'Stickers', icon: Sticker },
  { id: 'preview', label: 'Preview & book', icon: Paintbrush },
];

function ColorStrip({ value, onPick, disabled }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
      {paintColors.map(c => (
        <button
          key={c.id}
          type="button"
          disabled={disabled}
          title={`${c.name} · ${c.finish}`}
          onClick={() => onPick(c.hex)}
          className={cn(
            'aspect-square rounded-xl border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
            value?.toUpperCase() === c.hex.toUpperCase()
              ? 'border-primary-400 ring-2 ring-primary-400/40 scale-105'
              : 'border-border hover:border-dark-500'
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

export default function Customization() {
  const navigate = useNavigate();
  const { user, users, getCustomerBikes, addCustomizationRequest, createBooking } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const core = useBikeCanvas();

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;
  useEffect(() => { setError(!userId); }, [userId]);

  const bikes = useMemo(() => (userId ? getCustomerBikes(userId) : []), [userId, getCustomerBikes]);

  const [bikeId, setBikeId] = useState('');
  const [step, setStep] = useState('paint');
  const [finishType, setFinishType] = useState('Gloss');
  const [customHex, setCustomHex] = useState('#ffffff');
  const [category, setCategory] = useState('all');
  const [notes, setNotes] = useState('');
  const [compare, setCompare] = useState(null);

  useEffect(() => {
    if (step === 'preview' && core.hasPhoto) {
      setCompare({ before: core.capture(false), after: core.capture(true) });
    }
  }, [step, core.hasPhoto, core.capture]);

  const estimate = useMemo(
    () => getDesignEstimate(core.parts, core.stickers, finishType),
    [core.parts, core.stickers, finishType]
  );

  const hasDesign = core.parts.length > 0 || core.stickers.length > 0;

  const visibleStickers = useMemo(
    () => (category === 'all' ? STICKER_DEFS : STICKER_DEFS.filter(s => s.category === category || s.premium)),
    [category]
  );

  const selectedPart = core.selected?.kind === 'part' ? core.selected : null;
  const selectedSticker = core.selected?.kind === 'sticker' ? core.selected : null;

  const pickColor = hex => core.applyColor(hex);

  const handlePartChip = type => {
    if (!core.hasPhoto) { toast.error('Upload a bike photo first'); return; }
    const existing = core.parts.find(p => p.partType === type);
    if (existing) {
      core.selectById(existing.id);
      return;
    }
    core.startDraw(type);
  };

  const handleStickerClick = key => {
    if (!core.hasPhoto) { toast.error('Upload a bike photo first'); return; }
    core.addSticker(key);
  };

  const handleSubmit = () => {
    if (!bikeId) { toast.error('Select a bike to customize'); return; }
    if (!hasDesign) { toast.error('Add at least one painted part or a sticker to your design'); return; }
    if (!core.hasPhoto) { toast.error('Upload a bike photo first'); return; }

    setSubmitting(true);
    const services = toServiceLines(core.parts, core.stickers, finishType);
    const previewImage = core.capture(true);
    const originalImage = core.capture(false);

    const newBooking = createBooking({
      userId,
      bikeId,
      services,
      package: null,
      date: format(new Date(), 'yyyy-MM-dd'),
      timeSlot: '10:00 AM',
      subtotal: estimate.subtotal,
      discount: 0,
      tax: estimate.tax,
      total: estimate.total,
      advance: 0,
      balance: estimate.total,
      notes,
      pickupDrop: false,
    });

    addCustomizationRequest({
      userId,
      bikeId,
      bookingId: newBooking.id,
      kind: 'visual',
      finishType,
      parts: core.parts.map(p => ({ partType: p.partType, color: p.color, opacity: p.opacity })),
      stickers: core.stickers.map(s => ({ key: s.key, color: s.color, opacity: s.opacity })),
      originalImage,
      previewImage,
      subtotal: estimate.subtotal,
      tax: estimate.tax,
      total: estimate.total,
      notes,
    });

    setSubmitting(false);
    setSubmitted({ id: newBooking.id, preview: previewImage, total: estimate.total });
    toast.success('Customization request submitted! Our designers will review your preview.');
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customize" subtitle="Design your dream ride." />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Design brief submitted!</h2>
                <p className="text-sm text-dark-400 mt-0.5">
                  Our customization team will review your preview and send a final quote shortly.
                </p>
              </div>
            </div>
            {submitted.preview && (
              <div className="mt-5 rounded-2xl overflow-hidden border border-border">
                <img src={submitted.preview} alt="Your customization preview" className="w-full" />
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-dark-500 font-medium">Estimated total</p>
                <p className="text-xl font-bold text-primary-400">{formatCurrency(submitted.total)}</p>
              </div>
              <span className="text-xs text-dark-400">Booking {submitted.id}</span>
            </div>
            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              <Button icon={Sparkles} onClick={() => { setSubmitted(null); core.clearAll(); setCompare(null); }}>
                Design another
              </Button>
              <Button variant="secondary" icon={ChevronRight} onClick={() => navigate('/my-bookings')}>View my bookings</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <PageHeader title="Customize" subtitle="Upload a photo, mask the parts you want recolored, add stickers and preview your ride — before you book." />

      {bikes.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="Add a bike to get started"
          description="You need at least one bike in your garage to start a customization request."
          action="Add your bike"
          onAction={() => navigate('/my-bikes')}
        />
      ) : (
        <>
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2 flex-shrink-0">
                <span className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-[11px] font-bold text-primary-400">1</span>
                Your bike
              </span>
              <div className="flex flex-wrap gap-2">
                {bikes.map(bike => (
                  <button
                    key={bike.id}
                    type="button"
                    onClick={() => setBikeId(bike.id)}
                    className={cn(
                      'text-left px-3.5 py-2 rounded-xl border transition-all cursor-pointer',
                      bikeId === bike.id
                        ? 'bg-primary-500/10 border-primary-500/40'
                        : 'bg-surface-light border-border hover:border-primary-500/20'
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.15em] text-dark-500">{bike.brand}</p>
                    <p className="text-sm font-semibold text-white">{bike.model}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <BikeWorkspace core={core} />
            </div>

            <div className="space-y-4">
              <div className="flex gap-1.5 rounded-xl border border-border bg-surface p-1.5">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStep(t.id)}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                      step === t.id ? 'bg-primary-500 text-black' : 'text-dark-400 hover:text-white'
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                ))}
              </div>

              {step === 'paint' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-5 space-y-5">
                    <div>
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-[11px] font-bold text-primary-400">2</span>
                        Pick the part to paint
                      </h3>
                      <p className="text-xs text-dark-400 mt-1 mb-3">
                        Tap a part, then click points around it on the photo and press <span className="text-dark-200 font-medium">Complete shape</span>.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {CUSTOM_PARTS.map(part => {
                          const Icon = PART_ICONS[part.id] || Square;
                          const painted = core.parts.some(p => p.partType === part.id);
                          const active = core.drawing?.partType === part.id;
                          return (
                            <button
                              key={part.id}
                              type="button"
                              disabled={!!core.drawing && !active}
                              onClick={() => handlePartChip(part.id)}
                              className={cn(
                                'p-2.5 rounded-xl border text-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                                active ? 'border-primary-500 bg-primary-500/15'
                                  : painted ? 'border-primary-500/40 bg-primary-500/5'
                                  : 'border-border bg-surface-light hover:border-primary-500/20'
                              )}
                            >
                              <Icon className="w-4 h-4 mx-auto mb-1 text-primary-400" />
                              <p className="text-[10px] font-medium text-white leading-tight">{part.name}</p>
                              <p className="text-[9px] text-dark-600 mt-0.5">{formatCurrency(part.price)}</p>
                            </button>
                          );
                        })}
                      </div>
                      {!core.hasPhoto && (
                        <p className="mt-3 text-[11px] text-yellow-400/80 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" /> Upload a photo first to start painting parts.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Finish"
                        value={finishType}
                        onChange={e => setFinishType(e.target.value)}
                        options={FINISH_TYPES.map(f => ({ value: f, label: f }))}
                      />
                      {selectedPart && (
                        <Select
                          label="Change part type"
                          value={selectedPart.type}
                          onChange={e => core.setSelectedPartType(e.target.value)}
                          options={CUSTOM_PARTS.map(p => ({ value: p.id, label: p.name }))}
                        />
                      )}
                    </div>

                    {selectedPart ? (
                      <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">
                            Coloring <span className="text-primary-400">{partById(selectedPart.type)?.name}</span>
                          </p>
                          <button
                            type="button"
                            onClick={core.removeSelected}
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        <ColorStrip value={selectedPart.color} onPick={pickColor} />
                        <div className="flex items-end gap-3">
                          <Input
                            label="Custom colour"
                            value={customHex}
                            onChange={e => setCustomHex(e.target.value)}
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={customHex}
                            onChange={e => { const v = e.target.value; setCustomHex(v); pickColor(v); }}
                            className="w-12 h-11 rounded-xl bg-surface-light border border-border cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
                            <span>Colour intensity</span>
                            <span className="font-mono text-primary-400">{Math.round((selectedPart.opacity || 0.45) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.15}
                            max={0.75}
                            step={0.05}
                            value={selectedPart.opacity || 0.45}
                            onChange={e => core.applyOpacity(Number(e.target.value))}
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-surface-light/60 p-3.5 text-xs text-dark-400 flex items-start gap-2">
                        <MousePointerClick className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                        Select a painted part on the canvas to change its colour, intensity or remove it.
                      </div>
                    )}

                    {core.parts.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-dark-500 font-medium mb-2">Painted parts</p>
                        <div className="flex flex-wrap gap-2">
                          {core.parts.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => core.selectById(p.id)}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-all',
                                selectedPart?.id === p.id
                                  ? 'border-primary-500 bg-primary-500/10 text-white'
                                  : 'border-border bg-surface-light text-dark-300 hover:border-primary-500/30'
                              )}
                            >
                              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: p.color }} />
                              {partById(p.partType)?.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {step === 'sticker' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-5 space-y-5">
                    <div>
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-[11px] font-bold text-primary-400">3</span>
                        Add stickers
                      </h3>
                      <p className="text-xs text-dark-400 mt-1 mb-3">Tap a sticker — it lands on the bike and you can drag, resize and rotate it.</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {STICKER_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                              'px-2.5 py-1.5 text-[11px] rounded-lg border transition-all cursor-pointer',
                              category === cat.id
                                ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                                : 'bg-surface-light text-dark-400 border-border hover:text-white'
                            )}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {visibleStickers.map(st => (
                          <button
                            key={st.key}
                            type="button"
                            onClick={() => handleStickerClick(st.key)}
                            className={cn(
                              'group p-2.5 pt-3 rounded-xl border transition-all cursor-pointer text-center',
                              'border-border bg-surface-light hover:border-primary-500/40 hover:bg-primary-500/5'
                            )}
                          >
                            <div className="h-10 flex items-center justify-center mb-1.5">
                              <StickerPreview def={st} />
                            </div>
                            <p className="text-[10px] font-medium text-white leading-tight">{st.name}</p>
                            <p className="text-[9px] text-dark-600 mt-0.5">
                              {formatCurrency(st.price)}{st.premium ? ' · Premium' : ''}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedSticker && (
                      <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">
                            Sticker <span className="text-primary-400">{STICKER_DEFS.find(s => s.key === selectedSticker.type)?.name}</span>
                          </p>
                          <button
                            type="button"
                            onClick={core.removeSelected}
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        <ColorStrip value={selectedSticker.color} onPick={pickColor} />
                        <div className="flex items-end gap-3">
                          <Input label="Custom colour" value={customHex} onChange={e => setCustomHex(e.target.value)} className="flex-1" />
                          <input
                            type="color"
                            value={customHex}
                            onChange={e => { const v = e.target.value; setCustomHex(v); pickColor(v); }}
                            className="w-12 h-11 rounded-xl bg-surface-light border border-border cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
                            <span>Opacity</span>
                            <span className="font-mono text-primary-400">{Math.round((selectedSticker.opacity || 1) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.1}
                            max={1}
                            step={0.05}
                            value={selectedSticker.opacity || 1}
                            onChange={e => core.applyOpacity(Number(e.target.value))}
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {step === 'preview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-[11px] font-bold text-primary-400">4</span>
                        Before / After
                      </h3>
                      <Button size="sm" variant="outline" icon={RefreshCcw} onClick={() => setCompare({ before: core.capture(false), after: core.capture(true) })}>
                        Refresh
                      </Button>
                    </div>
                    {core.hasPhoto ? (
                      compare ? (
                        <BeforeAfterSlider before={compare.before} after={compare.after} />
                      ) : (
                        <div className="rounded-xl border border-border bg-surface-light/60 p-6 text-center text-xs text-dark-400">
                          Drag the slider when the preview is ready.
                        </div>
                      )
                    ) : (
                      <div className="rounded-xl border border-border bg-surface-light/60 p-6 text-center text-xs text-dark-400">
                        Upload a photo to generate a before / after comparison.
                      </div>
                    )}
                  </Card>

                  <Card className="p-5">
                    <h3 className="font-semibold text-white text-sm mb-3">Design brief & estimate</h3>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {!hasDesign && <p className="text-xs text-dark-500">Nothing added yet — paint a part or add a sticker.</p>}
                      {core.parts.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-dark-500 font-medium mb-1">Painted parts</p>
                          <div className="space-y-1">
                            {core.parts.map(p => (
                              <div key={p.id} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-dark-300">
                                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: p.color }} />
                                  {partById(p.partType)?.name}
                                </span>
                                <span className="text-white font-medium">{formatCurrency(partById(p.partType)?.price || 0)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {core.stickers.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-dark-500 font-medium mb-1">Stickers</p>
                          <div className="space-y-1">
                            {core.stickers.map(s => {
                              const def = STICKER_DEFS.find(x => x.key === s.key);
                              return (
                                <div key={s.id} className="flex items-center justify-between text-xs">
                                  <span className="text-dark-300">{def?.name}{def?.premium ? ' · Premium' : ''}</span>
                                  <span className="text-white font-medium">{formatCurrency(def?.price || 500)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border space-y-1.5">
                        {estimate.lines.map(l => (
                          <div key={l.label} className="flex items-center justify-between text-xs text-dark-400">
                            <span>{l.label}</span>
                            <span>{formatCurrency(l.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                      <div className="flex items-center justify-between text-sm text-dark-400">
                        <span>Subtotal</span><span>{formatCurrency(estimate.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-dark-400">
                        <span>GST (18%)</span><span>{formatCurrency(estimate.tax)}</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold text-white pt-0.5">
                        <span>Estimated total</span><span className="text-primary-400">{formatCurrency(estimate.total)}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20 text-xs text-dark-400 flex gap-2">
                      <Info className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      This estimate reflects your selected parts, finishes and stickers. Final quote is confirmed after the bike is inspected.
                    </div>
                    <Textarea className="mt-4" label="Notes for the design team" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Mention any special requests..." />
                    <Button className="w-full mt-4" size="lg" icon={Send} loading={submitting} disabled={!bikeId || !hasDesign} onClick={handleSubmit}>
                      {!bikeId ? 'Select your bike first' : !hasDesign ? 'Design something first' : `Book customization · ${formatCurrency(estimate.total)}`}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}