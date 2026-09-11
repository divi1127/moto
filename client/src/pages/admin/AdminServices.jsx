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
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Pencil, Clock, IndianRupee, Sparkles, Droplets, Paintbrush, Sticker, Shield, ShieldCheck, Wrench } from 'lucide-react';

const categoryIcons = {
  washing: Droplets,
  detailing: Sparkles,
  painting: Paintbrush,
  stickers: Sticker,
  ceramic: Shield,
  protection: ShieldCheck,
  accessories: Wrench,
};

export default function AdminServices() {
  const { serviceCategories } = useStore();
  const [services, setServices] = useState(() =>
    serviceCategories.flatMap(cat => cat.services.map(s => ({ ...s, active: true })))
  );
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '', category: serviceCategories[0]?.id || '' });

  const categories = useMemo(() => [
    { id: 'all', name: 'All Services', count: services.length },
    ...serviceCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: services.filter(s => s.category === cat.id).length,
    })),
  ], [services, serviceCategories]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter(s => s.category === activeCategory);
  }, [services, activeCategory]);

  const toggleService = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleEditPrice = (id, price) => {
    const numeric = Number(price);
    if (isNaN(numeric) || numeric < 0) return;
    setServices(prev => prev.map(s => s.id === id ? { ...s, price: numeric } : s));
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price || !newService.category) return;
    const svc = {
      id: `svc-${Date.now()}`,
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      duration: newService.duration,
      category: newService.category,
      active: true,
    };
    setServices(prev => [...prev, svc]);
    setShowAddModal(false);
    setNewService({ name: '', description: '', price: '', duration: '', category: serviceCategories[0]?.id || '' });
  };

  const handleEditSave = () => {
    if (!editingService) return;
    setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...editingService, price: Number(editingService.price) || s.price } : s));
    setShowEditModal(false);
    setEditingService(null);
  };

  const grouped = useMemo(() => {
    const catList = activeCategory === 'all' ? serviceCategories : serviceCategories.filter(c => c.id === activeCategory);
    return catList.map(cat => ({
      ...cat,
      services: filteredServices.filter(s => s.category === cat.id),
    }));
  }, [activeCategory, serviceCategories, filteredServices]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Management</h1>
          <p className="text-dark-400 mt-1">Manage services, pricing and availability</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Service</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer',
                activeCategory === cat.id ? 'bg-primary-500 text-black' : 'bg-surface-light text-dark-400 hover:text-white hover:bg-surface-lighter'
              )}
            >
              {cat.name}
              <span className={cn('px-1.5 py-0.5 rounded-md text-xs', activeCategory === cat.id ? 'bg-black/20 text-black' : 'bg-dark-700 text-dark-400')}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {grouped.map((cat) => (
        <section key={cat.id}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
              {(() => { const Icon = categoryIcons[cat.id] || Sparkles; return <Icon className="w-5 h-5" />; })()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{cat.name}</h2>
              <p className="text-sm text-dark-400">{cat.description}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cat.services.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className={cn('h-full transition-opacity', !service.active && 'opacity-50')}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge status={service.active ? 'active' : 'inactive'} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingService(service); setShowEditModal(true); }}
                        className="p-2 hover:bg-surface-lighter rounded-lg text-dark-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleService(service.id)}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                          service.active ? 'bg-primary-500' : 'bg-dark-600'
                        )}
                      >
                        <span className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                          service.active ? 'left-5.5 translate-x-0' : 'left-0.5'
                        )} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                  <p className="text-sm text-dark-400 mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-400">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{formatCurrency(service.price)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-dark-400">
                        <Clock className="w-3 h-3" />
                        {service.duration}
                      </div>
                    </div>
                    <Input
                      type="number"
                      defaultValue={service.price}
                      onBlur={(e) => { const v = Number(e.target.value); if (v && v !== service.price) handleEditPrice(service.id, e.target.value); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                      className="w-24 !py-1.5 text-sm text-right"
                      placeholder="Price"
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {filteredServices.length === 0 && (
        <EmptyState icon={Sparkles} title="No services found" description="Add your first service to this category." action="Add Service" onAction={() => setShowAddModal(true)} />
      )}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Service">
        {editingService && (
          <div className="space-y-4">
            <Input label="Service Name" value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
            <Textarea label="Description" value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (₹)" type="number" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} />
              <Input label="Duration" value={editingService.duration} onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Service">
        <div className="space-y-4">
          <Input label="Service Name" placeholder="e.g. Hot Wax Polish" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
          <Textarea label="Description" placeholder="Describe the service" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" placeholder="999" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
            <Input label="Duration" placeholder="e.g. 45 min" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} />
          </div>
          <Select
            label="Category"
            options={serviceCategories.map(c => ({ value: c.id, label: c.name }))}
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddService} disabled={!newService.name || !newService.price}>Add Service</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}