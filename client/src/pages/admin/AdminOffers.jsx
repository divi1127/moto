import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { PageHeader, PageState, usePageLoading } from './adminShared';
import KPICard from '../../components/ui/KPICard';
import { format } from 'date-fns';
import { Tag, Plus, Percent, IndianRupee, Ticket, Power, CalendarX2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOffers() {
  const { coupons, addCoupon, updateCoupon } = useStore();
  const loading = usePageLoading();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    redemptions: coupons.reduce((s, c) => s + (c.usedCount || 0), 0),
  }), [coupons]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm({ code: '', type: 'percentage', value: '', minimumAmount: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', usageLimit: '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleCreate = () => {
    const e = {};
    if (!form.code?.trim()) e.code = 'Coupon code is required';
    if (!form.value) e.value = 'Value is required';
    if (!form.minimumAmount && form.minimumAmount !== 0) e.minimumAmount = 'Min amount is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (!form.usageLimit) e.usageLimit = 'Usage limit is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    addCoupon({
      code: form.code.toUpperCase().replace(/\s+/g, ''),
      type: form.type,
      value: Number(form.value),
      minimumAmount: Number(form.minimumAmount),
      startDate: form.startDate,
      expiryDate: form.endDate,
      usageLimit: Number(form.usageLimit),
      status: 'active',
    });
    setModalOpen(false);
    toast.success(`Coupon ${form.code.toUpperCase()} created`);
  };

  const toggle = c => {
    updateCoupon(c.id, { status: c.status === 'active' ? 'inactive' : 'active' });
    toast.success(c.status === 'active' ? `${c.code} deactivated` : `${c.code} activated`);
  };

  const usagePct = c => Math.min(100, Math.round(((c.usedCount || 0) / (c.usageLimit || 1)) * 100));

  const displayValue = c => c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value);

  const content = (
    <div className="space-y-6">
      <PageHeader title="Offers & Coupons" subtitle="Create promotional coupons and control which offers are live.">
        <Button icon={Plus} onClick={openCreate}>Create Coupon</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Coupons" value={stats.total} icon={Ticket} color="#8b5cf6" />
        <KPICard title="Active" value={stats.active} icon={Tag} color="#22c55e" />
        <KPICard title="Total Redemptions" value={stats.redemptions} icon={IndianRupee} color="#f59e0b" />
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons yet" description="Create your first coupon to start driving repeat business." action="Create Coupon" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {coupons.map((c, i) => {
            const expired = new Date(c.expiryDate) < new Date();
            const pct = usagePct(c);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card hover className={cn('relative overflow-hidden h-full flex flex-col', c.status !== 'active' && 'opacity-75')}>
                  <div className="absolute top-0 right-0 h-14 w-14">
                    <div className="absolute top-0 right-0 border-t-[56px] border-l-[56px] border-t-primary-500 border-l-transparent" style={{ opacity: c.status === 'active' ? 0.9 : 0.2 }} />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className={c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-surface-lighter text-dark-400 border-border'}>{c.status}</Badge>
                      <p className="font-mono text-xl font-bold text-white mt-2 tracking-wide">{c.code}</p>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {c.type === 'percentage' ? <Percent className="inline w-3 h-3 mr-1" /> : <IndianRupee className="inline w-3 h-3 mr-1" />}
                        {displayValue(c)} off · min {formatCurrency(c.minimumAmount)}
                      </p>
                    </div>
                    <span className="text-2xl font-black gradient-text">{displayValue(c)}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-dark-500">
                    <CalendarX2 className="w-3.5 h-3.5" />
                    {expired
                      ? <span className="text-red-400">Expired {format(new Date(c.expiryDate), 'dd MMM yyyy')}</span>
                      : <span>Valid till {format(new Date(c.expiryDate), 'dd MMM yyyy')}</span>}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-dark-400">Usage</span>
                      <span className="text-white font-medium">{c.usedCount||0} / {c.usageLimit} used</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-lighter overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-emerald-500')}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
                    <Button
                      size="sm"
                      variant={c.status === 'active' ? 'danger' : 'outline'}
                      icon={Power}
                      onClick={() => toggle(c)}
                    >
                      {c.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <span className="text-[11px] text-dark-600">{pct >= 90 ? 'Nearly exhausted' : pct >= 60 ? 'Popular offer' : 'Healthy usage'}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Coupon" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Coupon Code" value={form.code || ''} placeholder="e.g. SUMMER20" error={errors.code} onChange={e => set('code', e.target.value)} />
            <Select label="Discount Type" value={form.type || 'percentage'} onChange={e => set('type', e.target.value)} options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={form.type === 'percentage' ? 'Value (%)' : 'Value (₹)'} type="number" value={form.value} placeholder="0" error={errors.value} onChange={e => set('value', e.target.value)} />
            <Input label="Minimum Order Amount" type="number" value={form.minimumAmount} placeholder="0" error={errors.minimumAmount} onChange={e => set('minimumAmount', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            <Input label="End Date" type="date" value={form.endDate} error={errors.endDate} onChange={e => set('endDate', e.target.value)} />
            <Input label="Usage Limit" type="number" value={form.usageLimit} placeholder="e.g. 100" error={errors.usageLimit} onChange={e => set('usageLimit', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button icon={Plus} onClick={handleCreate}>Create coupon</Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}