import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bike, CalendarClock, Check, ChevronLeft, ChevronRight, Crown, MapPin,
  Package, Receipt, Sparkles, Tag, Truck, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addDays } from 'date-fns';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import { PageHeader, PageState, usePageLoading, formatDate, formatDateTimeLabel } from './customerShared';

const STEPS = ['Bike', 'Services', 'Package', 'Date & Time', 'Review'];

export default function BookService() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelected = location.state?.service || null;
  const initialState = preSelected ? { services: [preSelected.id], serviceNames: [preSelected.name] } : {};
  const [step, setStep] = useState(0);
  const [bikeId, setBikeId] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [pickupDrop, setPickupDrop] = useState(false);
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const loading = usePageLoading();

  const { user, user: currentUser, getCustomerBikes, serviceCategories, packages, coupons, createBooking, getBikeById, addPayment } = useStore();

  const allServices = useMemo(() => serviceCategories.flatMap(cat => cat.services || []), [serviceCategories]);

  useEffect(() => {
    if (initialState.services?.length) {
      setSelectedServices(initialState.services);
      setSelectedNames(initialState.serviceNames);
    }
  }, []);

  const myUser = user?.role === 'customer' ? user : null;
  const bikes = useMemo(() => myUser ? getCustomerBikes(myUser.id) : [], [myUser, getCustomerBikes]);
  const selectedBike = bikeId ? getBikeById(bikeId) : null;

  const serviceCost = useMemo(() => {
    let cost = 0;
    selectedServices.forEach(id => {
      const s = allServices.find(x => x.id === id);
      cost += s?.price || 0;
    });
    return cost;
  }, [selectedServices, allServices]);

  const packageObj = packages.find(p => p.id === selectedPackage) || null;
  const packageCost = packageObj?.price || 0;
  const subtotal = serviceCost + packageCost;

  const couponAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const { type, value, minimumAmount } = appliedCoupon;
    if (subtotal < minimumAmount) return 0;
    return type === 'percentage' ? Math.round(subtotal * value / 100) : Math.min(value, subtotal);
  }, [appliedCoupon, subtotal]);

  const discount = Math.round(subtotal * 0.1);
  const tax = Math.round((subtotal - discount - couponAmount) * 0.18);
  const total = subtotal - discount - couponAmount + tax;
  const advance = Math.round(Math.min(total, 1000));
  const balance = total - advance;

  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1)), []);
  const canNext = step === 0 ? !!bikeId : step === 1 ? selectedServices.length > 0 : step === 3 ? !!(date && timeSlot) : true;

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const c = coupons.find(x => x.code?.toLowerCase() === couponCode.trim().toLowerCase());
    if (!c) return toast.error('Invalid coupon code');
    if (subtotal < (c.minimumAmount || 0)) return toast.error(`Coupon requires a minimum of ${formatCurrency(c.minimumAmount)}`);
    setAppliedCoupon(c);
    toast.success(`Coupon ${c.code} applied!`);
  };

  const saveBooking = () => {
    setConfirming(true);
    setTimeout(() => {
      const newBooking = createBooking({
        userId: myUser.id,
        bikeId,
        services: selectedNames,
        package: packageObj?.id || null,
        date,
        timeSlot,
        status: 'pending',
        subtotal,
        discount: discount + couponAmount,
        tax,
        total,
        advance,
        balance,
        notes: notes || '',
        pickupDrop,
        createdAt: new Date().toISOString().split('T')[0],
      });
      if (advance > 0) {
        addPayment({ bookingId: newBooking.id, amount: advance, method: 'UPI', status: 'completed', date: new Date().toISOString().split('T')[0], transactionId: `TXN-${Date.now()}`, type: 'advance' });
      }
      setConfirming(false);
      toast.success(`Booking confirmed! ${newBooking.bookingNumber}`);
      setTimeout(() => navigate('/my-bookings'), 900);
    }, 800);
  };

  const content = (
    <>
      <PageHeader title="Book a Service" subtitle="Complete your booking in a few simple steps." />

      <div className="mb-6">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors',
                    i <= step ? 'text-primary-400' : 'text-dark-500 hover:text-dark-400'
                  )}
                >
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                    i < step ? 'bg-primary-500 text-white' : i === step ? 'bg-primary-500/15 text-primary-400 border border-primary-500/40' : 'bg-surface-lighter text-dark-500'
                  )}>{i < step ? <Check className="w-3 h-3" /> : i + 1}</span>
                  <span className="hidden sm:inline truncate">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className={cn('h-px flex-1', i < step ? 'bg-primary-500/60' : 'bg-border')} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Bike className="w-5 h-5 text-primary-400" /> Select your bike</h3>
                {bikes.length === 0 ? (
                  <p className="text-sm text-dark-400">No bikes in your garage yet. Add a bike from My Bikes first.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bikes.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setBikeId(b.id)}
                        className={cn(
                          'text-left p-4 rounded-xl border transition-colors',
                          bikeId === b.id ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/20' : 'border-border bg-surface-light hover:border-dark-600'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-white">{b.name || `${b.brand} ${b.model}`}</p>
                          {bikeId === b.id && <Check className="w-4 h-4 text-primary-400" />}
                        </div>
                        <p className="text-xs text-dark-400">{b.color ? `${b.color} • ` : ''}{b.registrationNumber || b.regNumber}</p>
                        <p className="text-xs text-dark-500 mt-2">{b.year || ''}</p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Wrench className="w-5 h-5 text-primary-400" /> Select services</h3>
                <div className="space-y-5">
                  {serviceCategories.map(cat => (
                    <div key={cat.id}>
                      <h4 className="text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(cat.services || []).map(s => {
                          const active = selectedServices.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedServices(prev => active ? prev.filter(x => x !== s.id) : [...prev, s.id]);
                                setSelectedNames(prev => active ? prev.filter(x => x !== s.name) : [...prev, s.name]);
                              }}
                              className={cn(
                                'text-left p-3.5 rounded-xl border transition-colors',
                                active ? 'border-primary-500 bg-primary-500/10' : 'border-border bg-surface-light hover:border-dark-600'
                              )}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-medium text-white">{s.name}</p>
                                <div className={cn('w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0', active ? 'bg-primary-500 border-primary-500' : 'border-dark-600')}>
                                  {active && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                              </div>
                              <p className="text-xs text-dark-400 line-clamp-2">{s.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-semibold text-primary-400">{formatCurrency(s.price)}</span>
                                <span className="text-[11px] text-dark-500">{s.duration}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2"><Crown className="w-5 h-5 text-primary-400" /> Add a package <span className="text-xs font-normal text-dark-500">(optional)</span></h3>
                  <button onClick={() => setSelectedPackage(null)} className={cn('text-xs px-3 py-1.5 rounded-lg border font-medium', !selectedPackage ? 'border-primary-500/40 text-primary-400 bg-primary-500/10' : 'border-border text-dark-400 hover:text-white')}>Skip package</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {packages.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPackage(p.id)}
                      className={cn(
                        'text-left p-4 rounded-xl border transition-colors relative',
                        selectedPackage === p.id ? 'border-primary-500 bg-primary-500/10' : 'border-border bg-surface-light hover:border-dark-600'
                      )}
                    >
                      {p.popular && <Badge className="absolute top-3 right-3 bg-primary-500/15 text-primary-400 border-primary-500/30">Popular</Badge>}
                      <div className="flex items-start justify-between gap-3 pr-16">
                        <div>
                          <p className="text-sm font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-dark-400 mt-0.5">{p.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary-400">{formatCurrency(p.price)}</p>
                          {p.duration && <p className="text-[11px] text-dark-500">{p.duration}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(p.features || []).map(f => <span key={f} className="text-[11px] px-2 py-0.5 rounded-md bg-surface-lighter text-dark-300 border border-border">{f}</span>)}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><CalendarClock className="w-5 h-5 text-primary-400" /> Choose date & time</h3>
                <div className="grid grid-cols-7 gap-2">
                  {dates.map(d => {
                    const active = date === d.toISOString().split('T')[0];
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => setDate(d.toISOString().split('T')[0])}
                        className={cn(
                          'flex flex-col items-center py-2.5 rounded-xl border transition-colors',
                          active ? 'border-primary-500 bg-primary-500/10' : 'border-border bg-surface-light hover:border-dark-600'
                        )}
                      >
                        <span className="text-[10px] text-dark-500 uppercase">{format(d, 'EEE')}</span>
                        <span className={cn('text-sm font-bold mt-0.5', active ? 'text-primary-400' : 'text-white')}>{format(d, 'd')}</span>
                        <span className="text-[10px] text-dark-500">{format(d, 'MMM')}</span>
                      </button>
                    );
                  })}
                </div>
                {date && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                    {timeSlots.map(ts => (
                      <button
                        key={ts}
                        onClick={() => setTimeSlot(ts)}
                        className={cn(
                          'text-xs font-medium py-2 rounded-lg border transition-colors',
                          timeSlot === ts ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-border bg-surface-light text-dark-300 hover:border-dark-600'
                        )}
                      >
                        {ts}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                  <Truck className="w-5 h-5 text-primary-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Pickup & Drop</p>
                    <p className="text-xs text-dark-500">We pick your bike from home and deliver it back</p>
                  </div>
                  <div
                    onClick={() => setPickupDrop(!pickupDrop)}
                    className={cn('w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center flex-shrink-0', pickupDrop ? 'bg-primary-500' : 'bg-surface-lighter border border-border')}
                  >
                    <span className={cn('w-4.5 h-4.5 w-[18px] h-[18px] rounded-full bg-white shadow mx-0.5 transition-transform', pickupDrop && 'translate-x-5')} />
                  </div>
                </div>
                <div className="mt-4">
                  <Textarea label="Notes / Instructions (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests for the booking..." />
                </div>
              </Card>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Receipt className="w-5 h-5 text-primary-400" /> Review your booking</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border/60"><span className="text-dark-400">Bike</span><span className="text-white font-medium">{selectedBike ? (selectedBike.name || `${selectedBike.brand} ${selectedBike.model}`) : '—'}</span></div>
                  <div className="flex items-center justify-between py-2 border-b border-border/60"><span className="text-dark-400">Services</span><span className="text-white font-medium">{selectedNames.join(', ') || '—'}</span></div>
                  <div className="flex items-center justify-between py-2 border-b border-border/60"><span className="text-dark-400">Package</span><span className="text-white font-medium">{packageObj?.name || 'None'}</span></div>
                  <div className="flex items-center justify-between py-2 border-b border-border/60">
                    <span className="text-dark-400">Date & time</span>
                    <span className="text-white font-medium">{date && timeSlot ? formatDateTimeLabel(date, timeSlot) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/60">
                    <span className="text-dark-400">Pickup & Drop</span>
                    <span className={cn('font-medium', pickupDrop ? 'text-primary-400' : 'text-dark-500')}>{pickupDrop ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-base font-semibold text-white mb-4">Price Summary</h3>
                <div className="mb-4 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Apply coupon"
                    className="flex-1 min-w-0 bg-surface-light border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50"
                  />
                  <Button variant="outline" size="sm" icon={Tag} onClick={applyCoupon} disabled={!!appliedCoupon}>Apply</Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-dark-400">Subtotal</span><span className="text-white font-medium">{formatCurrency(subtotal)}</span></div>
                  {applyShow && (
                    <div className="flex justify-between"><span className="text-dark-400">{appliedCoupon?.code} discount</span><span className="text-emerald-400 font-medium">-{formatCurrency(couponAmount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-dark-400">Service discount</span><span className="text-emerald-400 font-medium">-{formatCurrency(discount)}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">GST (18%)</span><span className="text-white font-medium">{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-border"><span className="text-white font-semibold">Total</span><span className="text-white font-bold">{formatCurrency(total)}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Advance due now</span><span className="text-primary-400 font-medium">{formatCurrency(advance)}</span></div>
                  <div className="flex justify-between"><span className="text-dark-400">Balance at pickup</span><span className="text-yellow-400 font-medium">{formatCurrency(balance)}</span></div>
                </div>
                <div className="mt-5">
                  <Button fullWidth icon={Sparkles} onClick={saveBooking} disabled={confirming}>{confirming ? 'Confirming...' : 'Confirm Booking'}</Button>
                </div>
                <p className="text-[11px] text-dark-500 mt-3"><MapPin className="w-3 h-3 inline mr-1" />Pay the advance amount to confirm your slot. Cancel anytime before the scheduled date from My Bookings.</p>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" icon={ChevronLeft} onClick={() => setStep(step - 1)}>Back</Button>
          {step < STEPS.length - 1 && (
            <Button icon={ChevronRight} iconPosition="end" onClick={() => setStep(step + 1)} disabled={!canNext}>Continue</Button>
          )}
        </div>
      )}
    </>
  );

  return <PageState loading={loading && !myUser} error={false} onRetry={() => {}}>{myUser ? content : (
    <PageState loading={false}><PageHeader title="Book a Service" subtitle="Please sign in to book a service." /></PageState>
  )}</PageState>;
}
