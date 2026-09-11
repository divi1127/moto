import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Eye, Bike, Gauge, Palette, Cog, ShieldAlert,
  ShieldCheck, CalendarDays, ChevronRight, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { cn } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import BikeVisual from '../../components/ui/BikeVisual';
import { PageHeader, PageState, usePageLoading, formatDate } from './customerShared';
import { bikeBrands, bikeColors, fuelTypes, engineTypes } from '../../data/mockData';

function BikeForm({ editing, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    brand: editing?.brand || '',
    model: editing?.model || '',
    variant: editing?.variant || '',
    registrationNumber: editing?.registrationNumber || '',
    year: editing?.year ? String(editing.year) : '',
    color: editing?.color || '',
    fuelType: editing?.fuelType || 'Petrol',
    engineType: editing?.engineType || '',
    mileage: editing?.mileage ? String(editing.mileage) : '',
    insuranceValidTill: editing?.insuranceValidTill || '',
    notes: editing?.notes || '',
  }));
  const [errors, setErrors] = useState({});

  const selectedBrand = bikeBrands.find(b => b.name === form.brand);
  const models = selectedBrand?.models || [];
  const years = [];
  for (let y = new Date().getFullYear(); y >= 2005; y--) years.push(String(y));

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    const e = {};
    if (!form.brand) e.brand = 'Select a brand';
    if (!form.model) e.model = 'Select a model';
    if (!form.registrationNumber.trim()) e.registrationNumber = 'Registration number is required';
    if (!form.year) e.year = 'Select manufacturing year';
    if (!form.color) e.color = 'Select a colour';
    if (!form.engineType) e.engineType = 'Select engine type';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      ...form,
      year: Number(form.year),
      mileage: form.mileage || '0',
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Brand"
          options={bikeBrands.map(b => ({ value: b.name, label: b.name }))}
          placeholder="Select brand"
          value={form.brand}
          error={errors.brand}
          onChange={e => { set('brand', e.target.value); set('model', ''); }}
        />
        <Select
          label="Model"
          options={models.map(m => ({ value: m, label: m }))}
          placeholder={form.brand ? 'Select model' : 'Select brand first'}
          value={form.model}
          error={errors.model}
          disabled={!models.length}
          onChange={e => set('model', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Variant" value={form.variant} placeholder="e.g. Halcyon Green" onChange={e => set('variant', e.target.value)} />
        <Input label="Registration Number" value={form.registrationNumber} placeholder="KA 01 AB 1234" error={errors.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} />
        <Select label="Manufacturing Year" options={years} placeholder="Select year" value={form.year} error={errors.year} onChange={e => set('year', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Colour" options={bikeColors.map(c => ({ value: c, label: c }))} placeholder="Select colour" value={form.color} error={errors.color} onChange={e => set('color', e.target.value)} />
        <Select label="Fuel Type" options={fuelTypes.map(f => ({ value: f, label: f }))} value={form.fuelType} onChange={e => set('fuelType', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Engine Type" options={engineTypes.map(t => ({ value: t, label: t }))} placeholder="Select engine" value={form.engineType} error={errors.engineType} onChange={e => set('engineType', e.target.value)} />
        <Input label="Mileage (km)" type="number" value={form.mileage} placeholder="e.g. 12500" onChange={e => set('mileage', e.target.value)} />
      </div>

      <Input label="Insurance Valid Till" type="date" value={form.insuranceValidTill} onChange={e => set('insuranceValidTill', e.target.value)} />

      <Textarea label="Notes" value={form.notes} placeholder="Any special instructions or preferences for this bike..." onChange={e => set('notes', e.target.value)} />

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} icon={Check}>{editing ? 'Save changes' : 'Add bike'}</Button>
      </div>
    </div>
  );
}

export default function MyBikes() {
  const navigate = useNavigate();
  const { user, users, getCustomerBikes, addBike, updateBike, deleteBike } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  const bikes = myUser ? getCustomerBikes(myUser.id) : [];

  useEffect(() => {
    setError(!myUser);
  }, [myUser]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = bike => { setEditing(bike); setModalOpen(true); };

  const handleSubmit = data => {
    if (editing) {
      updateBike(editing.id, data);
      toast.success('Bike updated successfully');
    } else {
      addBike({ ...data, userId: myUser.id });
      toast.success('Bike added to your garage');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteBike(confirmDelete.id);
    setConfirmDelete(null);
    toast.success('Bike removed');
  };

  const insuranceStatus = bike => {
    if (!bike.insuranceValidTill) {
      return { label: 'No insurance date set', cls: 'text-dark-300 bg-surface-lighter border-border', icon: CalendarDays };
    }
    const days = differenceInCalendarDays(parseISO(bike.insuranceValidTill), new Date());
    if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, cls: 'text-red-400 bg-red-500/10 border-red-500/20', icon: ShieldAlert };
    if (days <= 30) return { label: `Expires in ${days}d`, cls: 'text-red-400 bg-red-500/10 border-red-500/20', icon: ShieldAlert };
    if (days <= 90) return { label: `Expires in ${days}d`, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: ShieldAlert };
    return { label: `Valid till ${formatDate(bike.insuranceValidTill)}`, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: ShieldCheck };
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="My Bikes" subtitle="Manage the motorcycles in your garage.">
        <Button onClick={openAdd} icon={Plus}>Add Bike</Button>
      </PageHeader>

      {bikes.length === 0 ? (
        <EmptyState
          icon={Bike}
          title="No bikes yet"
          description="Add your first bike to book services and get customization recommendations."
          action="Add your bike"
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bikes.map((bike, i) => {
            const ins = insuranceStatus(bike);
            const InsIcon = ins.icon;
            return (
              <motion.div key={bike.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Card hover className="relative overflow-hidden h-full">
                  <div className="relative h-40 bg-gradient-to-b from-surface-lighter via-surface to-transparent flex items-center justify-center overflow-hidden">
                    <div className="absolute -top-10 right-0 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute inset-x-0 -bottom-8 h-24 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
                    <BikeVisual brand={bike.brand} color={bike.color} className="absolute inset-0 p-2" />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-primary-500/80 backdrop-blur text-[10px] font-bold text-black uppercase tracking-wider">{bike.registrationNumber}</div>
                  </div>
                  <div className="relative px-5 pb-5 -mt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-dark-500">{bike.brand} · {bike.year}</p>
                        <h3 className="text-lg font-bold text-white mt-0.5">{bike.model}</h3>
                        <p className="text-xs text-dark-400">{bike.variant || 'Standard'}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/my-bikes/${bike.id}`)} />
                        <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(bike)} />
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDelete(bike)} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-border bg-surface-lighter text-dark-300">
                        <Gauge className="w-3.5 h-3.5" /> {bike.mileage ?? 0} km
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-border bg-surface-lighter text-dark-300">
                        <Palette className="w-3.5 h-3.5" /> {bike.color}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-border bg-surface-lighter text-dark-300">
                        <Cog className="w-3.5 h-3.5" /> {bike.engineType}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border', ins.cls)}>
                        <InsIcon className="w-3.5 h-3.5" /> {ins.label}
                      </span>
                    </div>

                    {bike.notes && <p className="mt-3 text-xs text-dark-400 italic">"{bike.notes}"</p>}

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/my-bikes/${bike.id}`)}
                        className="text-xs font-medium text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        View profile <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] uppercase tracking-wider text-dark-600">{bike.fuelType}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Bike' : 'Add Bike'} size="lg">
        <BikeForm editing={editing} onCancel={() => setModalOpen(false)} onSubmit={handleSubmit} />
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete bike" size="sm">
        <p className="text-sm text-dark-300">
          Are you sure you want to remove{' '}
          <span className="text-white font-medium">{confirmDelete?.brand} {confirmDelete?.model}</span>{' '}
          ({confirmDelete?.registrationNumber})? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} icon={Trash2}>Delete bike</Button>
        </div>
      </Modal>
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}