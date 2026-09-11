import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { PageHeader, SectionTitle, PageState, usePageLoading } from './adminShared';
import KPICard from '../../components/ui/KPICard';
import { Package, AlertTriangle, IndianRupee, Tags, Plus, ArrowDownToLine, ArrowUpFromLine, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Ceramic Products', 'Cleaning Products', 'PPF', 'Chain Products', 'Paint', 'Stickers & Vinyl', 'Polish', 'Accessories'];

export default function AdminInventory() {
  const { inventory, addInventoryItem, updateInventoryItem } = useStore();
  const loading = usePageLoading();
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [stockAction, setStockAction] = useState('in');
  const [stockQty, setStockQty] = useState('');
  const [formOpen, setFormOpen] = useState({});

  const stats = useMemo(() => {
    const lowStock = inventory.filter(i => i.quantity <= i.minimumStock);
    const totalValue = inventory.reduce((s, i) => s + i.quantity * i.price, 0);
    const categories = new Set(inventory.map(i => i.category)).size;
    return { total: inventory.length, lowStock: lowStock.length, totalValue, categories };
  }, [inventory]);

  const lowStockItems = useMemo(() => inventory.filter(i => i.quantity <= i.minimumStock), [inventory]);

  const isLow = item => item.quantity <= item.minimumStock;

  const columns = [
    { header: 'Item', accessor: 'name', sortable: true, render: r => <span className="font-medium text-white">{r.name}</span> },
    { header: 'Category', accessor: 'category', sortable: true, render: r => <span className="text-xs px-2 py-1 rounded-lg bg-surface-lighter text-dark-300">{r.category}</span> },
    { header: 'Quantity', accessor: 'quantity', sortable: true, render: r => <span className="font-semibold">{r.quantity} <span className="text-xs text-dark-500 font-normal">{r.unit}</span></span> },
    { header: 'Min Stock', accessor: 'minimumStock', sortable: true },
    { header: 'Price', accessor: 'price', sortable: true, render: r => formatCurrency(r.price) },
    { header: 'Supplier', accessor: 'supplier', sortable: true },
    {
      header: 'Status',
      render: r => isLow(r)
        ? <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Low</span>
        : <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> In Stock</span>,
    },
    {
      header: 'Actions',
      render: r => (
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" icon={ArrowDownToLine} onClick={() => openStock(r, 'in')} />
          <Button size="sm" variant="ghost" icon={ArrowUpFromLine} onClick={() => openStock(r, 'out')} />
        </div>
      ),
    },
  ];

  const openAdd = () => {
    setFormOpen({ name: '', category: '', quantity: '', unit: 'pieces', minimumStock: '', price: '', supplier: '' });
    setModalOpen(true);
  };

  const openStock = (item, action) => {
    setStockModal(item);
    setStockAction(action);
    setStockQty('');
  };

  const set = (key, value) => setFormOpen(f => ({ ...f, [key]: value }));

  const handleAdd = () => {
    const e = {};
    if (!formOpen.name?.trim()) e.name = 'Item name required';
    if (!formOpen.category) e.category = 'Select a category';
    if (!formOpen.quantity && formOpen.quantity !== 0) e.quantity = 'Quantity required';
    if (!formOpen.minimumStock && formOpen.minimumStock !== 0) e.minimumStock = 'Min stock required';
    if (!formOpen.price) e.price = 'Price required';
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    addInventoryItem({
      ...formOpen,
      quantity: Number(formOpen.quantity),
      minimumStock: Number(formOpen.minimumStock),
      price: Number(formOpen.price),
      supplier: formOpen.supplier || 'Direct Purchase',
    });
    setModalOpen(false);
    toast.success('Item added to inventory');
  };

  const handleStock = () => {
    const qty = Number(stockQty);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    const next = stockAction === 'in' ? stockModal.quantity + qty : Math.max(0, stockModal.quantity - qty);
    updateInventoryItem(stockModal.id, { quantity: next });
    toast.success(stockAction === 'in' ? `Stocked in ${qty} ${stockModal.unit}` : `Stocked out ${qty} ${stockModal.unit}`);
    setStockModal(null);
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" subtitle="Track parts, chemicals and materials across the workshop.">
        <Button icon={Plus} onClick={openAdd}>Add Item</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Items" value={stats.total} icon={Package} color="#3b82f6" />
        <KPICard title="Low Stock Items" value={stats.lowStock} icon={AlertTriangle} color="#ef4444" />
        <KPICard title="Total Value" value={stats.totalValue} icon={IndianRupee} color="#22c55e" />
        <KPICard title="Categories" value={stats.categories} icon={Tags} color="#8b5cf6" />
      </div>

      {lowStockItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-500/20">
            <SectionTitle
              icon={TrendingDown}
              title={`Low Stock Alert — ${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} at or below minimum`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-dark-500">{item.supplier}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-400">{item.quantity} <span className="text-xs font-normal">{item.unit}</span></p>
                    <p className="text-[11px] text-dark-500">min {item.minimumStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <Card>
        <DataTable columns={columns} data={inventory} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Inventory Item" size="lg">
        <div className="space-y-5">
          <Input label="Item Name" value={formOpen.name || ''} placeholder="e.g. 3M Ceramic Coating 9H" onChange={e => set('name', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formOpen.category || ''}
              placeholder="Select category"
              onChange={e => set('category', e.target.value)}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
            />
            <Input label="Unit" value={formOpen.unit || 'pieces'} placeholder="bottles, liters, cans..." onChange={e => set('unit', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Quantity" type="number" value={formOpen.quantity} placeholder="0" onChange={e => set('quantity', e.target.value)} />
            <Input label="Min Stock" type="number" value={formOpen.minimumStock} placeholder="0" onChange={e => set('minimumStock', e.target.value)} />
            <Input label="Price (per unit)" type="number" value={formOpen.price} placeholder="₹" onChange={e => set('price', e.target.value)} />
          </div>
          <Input label="Supplier" value={formOpen.supplier || ''} placeholder="e.g. 3M India" onChange={e => set('supplier', e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button icon={Plus} onClick={handleAdd}>Add item</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!stockModal} onClose={() => setStockModal(null)} title={stockAction === 'in' ? 'Stock In' : 'Stock Out'} size="sm">
        {stockModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-light border border-border">
              <p className="text-sm font-semibold text-white">{stockModal.name}</p>
              <p className="text-xs text-dark-500 mt-1">Current stock: <span className="text-white font-medium">{stockModal.quantity} {stockModal.unit}</span></p>
            </div>
            <Input
              label={`Quantity to ${stockAction === 'in' ? 'add' : 'remove'}`}
              type="number"
              value={stockQty}
              placeholder="0"
              onChange={e => setStockQty(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setStockModal(null)}>Cancel</Button>
              <Button icon={stockAction === 'in' ? ArrowDownToLine : ArrowUpFromLine} onClick={handleStock}>
                {stockAction === 'in' ? 'Stock In' : 'Stock Out'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}