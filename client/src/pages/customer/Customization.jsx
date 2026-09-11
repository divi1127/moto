import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Palette, Paintbrush, Sticker, Wrench, ImagePlus, Check, ChevronRight,
  Info, Sparkles, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading } from './customerShared';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { paintColors, finishTypes, stickerCategories } from '../../data/mockData';

const ACCESSORIES = [
  { id: 'acc-1', name: 'LED Headlight Upgrade', price: 2499 },
  { id: 'acc-2', name: 'Custom Mirrors', price: 1299 },
  { id: 'acc-3', name: 'Custom Grips', price: 799 },
  { id: 'acc-4', name: 'Crash Guard', price: 3499 },
  { id: 'acc-5', name: 'Seat Customization', price: 2999 },
  { id: 'acc-6', name: 'Mobile Holder', price: 499 },
];

export default function Customization() {
  const navigate = useNavigate();
  const { user, users, getCustomerBikes, addCustomizationRequest, createBooking } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const userId = myUser?.id;
  useEffect(() => { setError(!userId); }, [userId]);

  const bikes = useMemo(() => (userId ? getCustomerBikes(userId) : []), [userId, getCustomerBikes]);

  const [form, setForm] = useState({
    bikeId: '',
    paintColor: '',
    customColor: '',
    finishType: 'Gloss',
    stickerCategory: '',
    stickerDesign: '',
    stickerPosition: 'Tank',
    stickerText: '',
    accessories: [],
    references: [],
    notes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAccessory = id => set('accessories', form.accessories.includes(id) ? form.accessories.filter(a => a !== id) : [...form.accessories, id]);

  const selectedStickerCat = stickerCategories.find(s => s.id === form.stickerCategory);

  const estimate = useMemo(() => {
    let subtotal = 0;
    if (form.paintColor || form.customColor) subtotal += form.customColor ? 14999 : 4999;
    if (form.stickerDesign) subtotal += 2499;
    form.accessories.forEach(id => {
      const acc = ACCESSORIES.find(a => a.id === id);
      if (acc) subtotal += acc.price;
    });
    const tax = Math.round(subtotal * 0.18);
    return { subtotal, tax, total: subtotal + tax };
  }, [form.paintColor, form.customColor, form.stickerDesign, form.accessories]);

  const handleSubmit = () => {
    if (!form.bikeId) { toast.error('Select a bike to customize'); return; }
    if (!form.paintColor && !form.customColor && !form.stickerDesign && form.accessories.length === 0) {
      toast.error('Add at least one customization — paint, sticker or accessory');
      return;
    }
    setSubmitting(true);
    const services = [];
    if (form.paintColor || form.customColor) services.push(form.customColor ? 'Custom Design Paint' : 'Single Color Paint');
    if (form.stickerDesign) services.push('Custom Graphics');
    form.accessories.forEach(id => {
      const acc = ACCESSORIES.find(a => a.id === id);
      if (acc) services.push(acc.name);
    });

    const newBooking = createBooking({
      userId,
      bikeId: form.bikeId,
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
      notes: form.notes,
      pickupDrop: false,
    });

    addCustomizationRequest({
      userId,
      bikeId: form.bikeId,
      bookingId: newBooking.id,
      paintColor: form.customColor || form.paintColor,
      finishType: form.finishType,
      stickerDesign: form.stickerDesign,
      stickerPosition: form.stickerPosition,
      stickerText: form.stickerText,
      accessories: form.accessories.map(id => ACCESSORIES.find(a => a.id === id)?.name).filter(Boolean),
      notes: form.notes,
    });

    setSubmitting(false);
    setSubmittedId(newBooking.id);
    toast.success('Customization request submitted! Our designers will review it.');
  };

  if (submittedId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customize" subtitle="Design your dream ride." />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center py-14">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Request received!</h2>
            <p className="text-sm text-dark-400 mt-2 max-w-md mx-auto">
              Our customization team will review your design brief and send an estimate shortly.
            </p>
            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              <Button icon={Sparkles} onClick={() => setSubmittedId(null)}>Make another request</Button>
              <Button variant="secondary" icon={ChevronRight} onClick={() => navigate('/my-bookings')}>View my bookings</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <PageHeader title="Customize" subtitle="From paint jobs to stickers and accessories — tell us how you want your bike transformed." />

      {bikes.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="Add a bike to get started"
          description="You need at least one bike in your garage to start a customization request."
          action="Add your bike"
          onAction={() => navigate('/my-bikes')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><Palette className="w-5 h-5 text-primary-400" /> Choose your bike</h3>
              <p className="text-sm text-dark-400 mb-4">The machine we will be transforming.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bikes.map(bike => (
                  <button
                    key={bike.id}
                    onClick={() => set('bikeId', bike.id)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all cursor-pointer',
                      form.bikeId === bike.id
                        ? 'bg-primary-500/10 border-primary-500/40'
                        : 'bg-surface-light border-border hover:border-primary-500/20'
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.15em] text-dark-500">{bike.brand}</p>
                    <p className="font-semibold text-white mt-0.5">{bike.model}</p>
                    <p className="font-mono text-xs text-primary-400 mt-1">{bike.registrationNumber}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><Paintbrush className="w-5 h-5 text-primary-400" /> Paint & finish</h3>
              <p className="text-sm text-dark-400 mb-4">Select a block colour or describe a custom one.</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {paintColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => set('paintColor', form.paintColor === color.name ? '' : color.name)}
                    className={cn(
                      'p-2 rounded-xl border text-center transition-all cursor-pointer',
                      form.paintColor === color.name ? 'border-primary-500 bg-primary-500/10' : 'border-border bg-surface-light hover:border-dark-600'
                    )}
                  >
                    <span className="block w-8 h-8 rounded-lg mx-auto border border-white/10" style={{ backgroundColor: color.hex }} />
                    <span className="text-[10px] text-dark-300 mt-1.5 block leading-tight">{color.name}</span>
                    <span className="text-[9px] text-dark-600 block">{color.finish}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Input label="Custom colour name (optional)" value={form.customColor} placeholder="e.g. Sunset Orange" onChange={e => set('customColor', e.target.value)} />
                <Select label="Finish" value={form.finishType} onChange={e => set('finishType', e.target.value)} options={finishTypes.map(f => ({ value: f, label: f }))} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><Sticker className="w-5 h-5 text-primary-400" /> Stickers & decals</h3>
              <p className="text-sm text-dark-400 mb-4">Optional — pick a design family and position.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => set('stickerCategory', '')}
                  className={cn('px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer', !form.stickerCategory ? 'bg-primary-500/15 text-primary-400 border-primary-500/30' : 'bg-surface-light text-dark-400 border-border hover:text-white')}
                >None</button>
                {stickerCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { set('stickerCategory', cat.id); set('stickerDesign', ''); }}
                    className={cn('px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer', form.stickerCategory === cat.id ? 'bg-primary-500/15 text-primary-400 border-primary-500/30' : 'bg-surface-light text-dark-400 border-border hover:text-white')}
                  >{cat.name}</button>
                ))}
              </div>
              {selectedStickerCat && (
                <div className="flex flex-wrap gap-2">
                  {selectedStickerCat.designs.map(d => (
                    <button
                      key={d}
                      onClick={() => set('stickerDesign', form.stickerDesign === d ? '' : d)}
                      className={cn('px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer', form.stickerDesign === d ? 'bg-primary-500/15 text-primary-400 border-primary-500/30' : 'bg-surface-light text-dark-400 border-border hover:text-white')}
                    >{d}</button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Select label="Position" value={form.stickerPosition} onChange={e => set('stickerPosition', e.target.value)} options={['Tank', 'Body', 'Fender', 'Rim', 'Full'].map(v => ({ value: v, label: v }))} />
                <Input label="Custom text (optional)" value={form.stickerText} placeholder="e.g. Street 219" onChange={e => set('stickerText', e.target.value)} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><Wrench className="w-5 h-5 text-primary-400" /> Accessories</h3>
              <p className="text-sm text-dark-400 mb-4">Optional upgrades fitted alongside the customization.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCESSORIES.map(acc => {
                  const active = form.accessories.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => toggleAccessory(acc.id)}
                      className={cn(
                        'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer',
                        active ? 'bg-primary-500/10 border-primary-500/40' : 'bg-surface-light border-border hover:border-primary-500/20'
                      )}
                    >
                      <span className="text-sm font-medium text-white">{acc.name}</span>
                      <span className="text-xs font-semibold text-primary-400">{formatCurrency(acc.price)}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><ImagePlus className="w-5 h-5 text-primary-400" /> Reference photos & notes</h3>
              <p className="text-sm text-dark-400 mb-4">Describe the look you are after — or paste links to inspiration.</p>
              <Input label="Reference link" placeholder="https://... (image or design)" onKeyDown={e => {
                if (e.key === 'Enter' && e.target.value) {
                  set('references', [...form.references, e.target.value]);
                  e.target.value = '';
                }
              }} />
              {form.references.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.references.map((r, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-surface-lighter text-dark-300 border border-border inline-flex items-center gap-1.5">
                      {r}
                      <button onClick={() => set('references', form.references.filter((_, j) => j !== i))} className="text-dark-500 hover:text-red-400 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              )}
              <Textarea className="mt-4" label="Notes for the design team" value={form.notes} placeholder="Reference the MotoGP bike's livery, mention any special requests..." onChange={e => set('notes', e.target.value)} />
            </Card>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="sticky top-6">
                <h3 className="font-semibold text-white mb-4">Design brief</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-400">Bike</span>
                    <span className="text-white font-medium text-right">{bikes.find(b => b.id === form.bikeId)?.model || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-400">Paint</span>
                    <span className="text-white font-medium text-right">{form.customColor || form.paintColor || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-400">Finish</span>
                    <span className="text-white font-medium">{form.paintColor || form.customColor ? form.finishType : '—'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-400">Sticker</span>
                    <span className="text-white font-medium text-right">{form.stickerDesign || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-dark-400">Accessories</span>
                    <span className="text-white font-medium text-right">{form.accessories.length || '—'}</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm text-dark-400"><span>Subtotal</span><span>{formatCurrency(estimate.subtotal)}</span></div>
                  <div className="flex items-center justify-between text-sm text-dark-400"><span>GST (18%)</span><span>{formatCurrency(estimate.tax)}</span></div>
                  <div className="flex items-center justify-between text-lg font-bold text-white pt-1"><span>Estimated total</span><span>{formatCurrency(estimate.total)}</span></div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20 text-xs text-dark-400 flex gap-2">
                  <Info className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  This is an estimate. Painting services start in our studio; final quote is confirmed after inspection.
                </div>
                <Button className="w-full mt-4" size="lg" loading={submitting} icon={Send} onClick={handleSubmit}>
                  Submit request
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}