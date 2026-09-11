import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { Plus, Pencil, Trash2, Clock, Check, Tag, Sparkle } from 'lucide-react';

export default function AdminPackages() {
  const { packages, serviceCategories, addPackage, updatePackage, deletePackage } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [newPkg, setNewPkg] = useState({ name: '', description: '', price: '', discount: '', duration: '', features: [], originalPrice: '', color: '#3b82f6', popular: false });

  const allServices = useMemo(() => serviceCategories.flatMap(c => c.services), [serviceCategories]);

  const toggleFeature = (pkgState, setPkg, name) => {
    setPkg(({ features, ...rest }) => ({
      ...rest,
      features: features.includes(name) ? features.filter(f => f !== name) : [...features, name],
    }));
  };

  const createPackage = () => {
    if (!newPkg.name || !newPkg.price) return;
    const price = Number(newPkg.price);
    const originalPrice = Number(newPkg.originalPrice) || Math.round(price / (1 - (Number(newPkg.discount) || 0) / 100));
    const discount = Number(newPkg.discount) || (newPkg.originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0);
    addPackage({
      id: `pkg-${Date.now()}`,
      name: newPkg.name,
      description: newPkg.description,
      price,
      originalPrice,
      discount,
      duration: newPkg.duration,
      features: newPkg.features,
      color: newPkg.color,
      popular: newPkg.popular,
    });
    setShowCreateModal(false);
    setNewPkg({ name: '', description: '', price: '', discount: '', duration: '', features: [], originalPrice: '', color: '#3b82f6', popular: false });
  };

  const handleEditSave = () => {
    if (!editingPkg) return;
    const price = Number(editingPkg.price);
    const originalPrice = Number(editingPkg.originalPrice) || editingPkg.originalPrice;
    const discount = Number(editingPkg.discount) || (originalPrice ? Math.round((1 - price / Number(originalPrice)) * 100) : 0);
    updatePackage(editingPkg.id, { ...editingPkg, price, originalPrice, discount });
    setShowEditModal(false);
    setEditingPkg(null);
  };

  const handleDelete = (id) => {
    deletePackage(id);
  };

  const handleTogglePopular = (id) => {
    const pkg = packages.find(p => p.id === id);
    if (pkg) updatePackage(id, { popular: !pkg.popular });
  };

  const renderForm = (pkgState, setPkg) => (
    <div className="space-y-4">
      <Input label="Package Name" placeholder="e.g. Ultra Care Plus" value={pkgState.name} onChange={(e) => setPkg({ ...pkgState, name: e.target.value })} />
      <Textarea label="Description" placeholder="What does this package include?" value={pkgState.description} onChange={(e) => setPkg({ ...pkgState, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Price (₹)" type="number" placeholder="4999" value={pkgState.price} onChange={(e) => setPkg({ ...pkgState, price: e.target.value })} />
        <Input label="Duration" placeholder="e.g. 3-4 hrs" value={pkgState.duration} onChange={(e) => setPkg({ ...pkgState, duration: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Discount (%)" type="number" placeholder="20" value={pkgState.discount} onChange={(e) => setPkg({ ...pkgState, discount: e.target.value })} />
        <Input label="Original Price (₹)" type="number" placeholder="Auto from discount" value={pkgState.originalPrice} onChange={(e) => setPkg({ ...pkgState, originalPrice: e.target.value })} />
      </div>
      <Input
        label="Accent Color"
        type="color"
        value={pkgState.color}
        onChange={(e) => setPkg({ ...pkgState, color: e.target.value })}
        className="h-10 p-1 cursor-pointer"
      />
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Included Services</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-xl bg-surface-light border border-border">
          {allServices.map((svc) => (
            <label key={svc.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pkgState.features.includes(svc.name)}
                onChange={() => toggleFeature(pkgState, setPkg, svc.name)}
                className="rounded border-border text-primary-500 focus:ring-primary-500/30"
              />
              <span className="text-white/80">{svc.name}</span>
            </label>
          ))}
        </div>
        {pkgState.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {pkgState.features.map((f, i) => (
              <button key={i} onClick={() => toggleFeature(pkgState, setPkg, f)} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-xs hover:bg-primary-500/20 transition-colors cursor-pointer" title="Remove">
                {f} <span className="text-primary-400 font-bold">×</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={pkgState.popular}
          onChange={(e) => setPkg({ ...pkgState, popular: e.target.checked })}
          className="rounded border-border text-primary-500 focus:ring-primary-500/30"
        />
        <span className="text-white/80 flex items-center gap-1.5"><Sparkle className="w-3.5 h-3.5 text-amber-400" /> Mark as Popular</span>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Package Management</h1>
          <p className="text-dark-400 mt-1">Create and manage bundled service packages</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>Create Package</Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (
          <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover className="relative h-full overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: pkg.color }} />
              {pkg.popular && (
                <span className="absolute top-4 -right-8 rotate-45 bg-amber-500 text-black text-[10px] font-bold px-8 py-1 uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingPkg(pkg); setShowEditModal(true); }} className="p-2 hover:bg-surface-lighter rounded-lg text-dark-400 hover:text-white transition-colors cursor-pointer">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-dark-400 hover:text-red-400 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-4 min-h-[40px]">{pkg.description}</p>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-bold text-white">{formatCurrency(pkg.price)}</span>
                {pkg.originalPrice > pkg.price && (
                  <span className="text-sm text-dark-500 line-through mb-1">{formatCurrency(pkg.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                {pkg.discount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <Tag className="w-3 h-3" /> {pkg.discount}% OFF
                  </div>
                )}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-light text-dark-300 text-xs">
                  <Clock className="w-3 h-3" /> {pkg.duration}
                </div>
              </div>

              <ul className="space-y-1.5 mb-5">
                {pkg.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${pkg.color}22`, color: pkg.color }}>
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" size="sm" className="w-full" onClick={() => handleTogglePopular(pkg.id)}>
                {pkg.popular ? 'Remove from Popular' : 'Mark as Popular'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Package" size="lg">
        {renderForm(newPkg, setNewPkg)}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={createPackage} disabled={!newPkg.name || !newPkg.price}>Create Package</Button>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Package" size="lg">
        {editingPkg && renderForm(editingPkg, setEditingPkg)}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleEditSave}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}