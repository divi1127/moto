import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { Search, Bike, GaugeCircle, ShieldCheck, Fuel, Cog, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminBikes() {
  const { bikes, users, bookings, updateBike, deleteBike, addBike } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedBike, setSelectedBike] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const brands = useMemo(() => [...new Set(bikes.map(b => b.brand))], [bikes]);

  const filteredBikes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return bikes.filter(b => {
      const matchesBrand = brandFilter === 'all' || b.brand === brandFilter;
      if (!matchesBrand) return false;
      if (!term) return true;
      const owner = users.find(u => u.id === b.userId);
      return (
        `${b.brand} ${b.model}`.toLowerCase().includes(term) ||
        (b.registrationNumber || '').toLowerCase().includes(term) ||
        (owner?.name || '').toLowerCase().includes(term)
      );
    });
  }, [bikes, searchTerm, brandFilter, users]);

  const getOwnerName = (id) => users.find(u => u.id === id)?.name || 'Unknown';

  const columns = [
    {
      header: 'Bike',
      sortable: true,
      accessor: 'brand',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-500/10">
            <Bike className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-white">{row.brand} {row.model}</p>
            <p className="text-xs text-dark-400">{row.variant}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Registration #',
      accessor: 'registrationNumber',
      render: (row) => <span className="text-white/70 font-mono text-xs">{row.registrationNumber}</span>,
    },
    { header: 'Owner', render: (row) => getOwnerName(row.userId) },
    { header: 'Year', accessor: 'year', render: (row) => <span className="text-white/70">{row.year}</span> },
    { header: 'Color', render: (row) => <Badge>{row.color}</Badge> },
    {
      header: 'Mileage',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-white/70">
          <GaugeCircle className="w-3.5 h-3.5 text-dark-400" />
          {row.mileage} km
        </div>
      ),
    },
    { header: 'Status', render: () => <StatusBadge status="active" /> },
  ];

  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ brand: '', model: '', registrationNumber: '', year: '', color: '', mileage: '', userId: '' });

  const handleEditSave = () => {
    const parsed = {
      ...editForm,
      year: editForm.year ? Number(editForm.year) : undefined,
      mileage: typeof editForm.mileage === 'string' && editForm.mileage ? editForm.mileage.replace(/[^\d]/g, '') : editForm.mileage,
    };
    updateBike(selectedBike.id, parsed);
    setShowEdit(false);
    setSelectedBike({ ...selectedBike, ...parsed });
  };

  const handleAddSave = () => {
    if (!addForm.brand || !addForm.model || !addForm.registrationNumber) return;
    addBike({
      ...addForm,
      year: Number(addForm.year) || new Date().getFullYear(),
      userId: addForm.userId || users.find(u => u.role === 'customer')?.id,
      fuelType: 'Petrol',
      engineType: 'Single Cylinder',
      insuranceValidTill: '2027-12-31',
      notes: '',
      variant: 'Standard',
    });
    setShowAddModal(false);
    setAddForm({ brand: '', model: '', registrationNumber: '', year: '', color: '', mileage: '', userId: '' });
  };

  const bikeBookings = selectedBike ? bookings.filter(b => b.bikeId === selectedBike.id) : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bike Management</h1>
          <p className="text-dark-400 mt-1">Manage customer bikes registered at the studio</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Bike</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative sm:max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <Input
            icon={null}
            placeholder="Search by bike, registration or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={[{ value: 'all', label: 'All Brands' }, ...brands.map(b => ({ value: b, label: b }))]}
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="w-48"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card padding={false}>
          {filteredBikes.length === 0 ? (
            <EmptyState icon={Bike} title="No bikes found" description="Try a different search or add a new bike." />
          ) : (
            <DataTable
              columns={columns}
              data={filteredBikes}
              searchable={false}
              onRowClick={(row) => { setSelectedBike(row); setShowDetail(true); }}
            />
          )}
        </Card>
      </motion.div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Bike Details" size="lg">
        {selectedBike && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary-500/10">
                  <Bike className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedBike.brand} {selectedBike.model}</h3>
                  <p className="text-sm text-dark-400">{selectedBike.variant} · {selectedBike.year}</p>
                  <p className="text-sm text-primary-400 font-mono mt-1">{selectedBike.registrationNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={Pencil} onClick={() => { setEditForm(selectedBike); setShowEdit(true); }}>Edit</Button>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => { deleteBike(selectedBike.id); setShowDetail(false); }}>Delete</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 text-dark-400 mb-1"><GaugeCircle className="w-4 h-4" /><span className="text-xs">Mileage</span></div>
                <p className="text-sm font-medium text-white">{selectedBike.mileage} km</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 text-dark-400 mb-1"><Fuel className="w-4 h-4" /><span className="text-xs">Fuel</span></div>
                <p className="text-sm font-medium text-white">{selectedBike.fuelType}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 text-dark-400 mb-1"><Cog className="w-4 h-4" /><span className="text-xs">Engine</span></div>
                <p className="text-sm font-medium text-white">{selectedBike.engineType}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 text-dark-400 mb-1"><ShieldCheck className="w-4 h-4" /><span className="text-xs">Insurance</span></div>
                <p className="text-sm font-medium text-white">{selectedBike.insuranceValidTill || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Color</p>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: selectedBike.color.toLowerCase() }} />
                  <p className="text-sm font-medium text-white">{selectedBike.color}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Owner</p>
                <p className="text-sm font-medium text-white">{getOwnerName(selectedBike.userId)}</p>
              </div>
            </div>

            {selectedBike.notes && (
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Notes</p>
                <p className="text-sm text-white">{selectedBike.notes}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Booking History</h4>
              <div className="space-y-2">
                {bikeBookings.length === 0 && <p className="text-sm text-dark-500">No bookings for this bike yet</p>}
                {bikeBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-primary-400">{booking.bookingNumber}</p>
                      <p className="text-xs text-dark-400">{booking.date} · {booking.timeSlot}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-white">{formatCurrency(booking.total)}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title={`Edit ${selectedBike?.brand || ''} ${selectedBike?.model || ''}`}>
        <div className="space-y-4">
          <Input label="Registration #" value={editForm.registrationNumber || ''} onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Year" type="number" value={editForm.year || ''} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
            <Input label="Color" value={editForm.color || ''} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} />
          </div>
          <Input label="Mileage (km)" value={editForm.mileage || ''} onChange={(e) => setEditForm({ ...editForm, mileage: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Bike">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Brand" placeholder="e.g. Royal Enfield" value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} />
            <Input label="Model" placeholder="e.g. Classic 350" value={addForm.model} onChange={(e) => setAddForm({ ...addForm, model: e.target.value })} />
          </div>
          <Input label="Registration #" placeholder="KA 01 AB 1234" value={addForm.registrationNumber} onChange={(e) => setAddForm({ ...addForm, registrationNumber: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Year" type="number" placeholder="2024" value={addForm.year} onChange={(e) => setAddForm({ ...addForm, year: e.target.value })} />
            <Input label="Color" placeholder="Matte Black" value={addForm.color} onChange={(e) => setAddForm({ ...addForm, color: e.target.value })} />
          </div>
          <Input label="Mileage (km)" placeholder="12000" value={addForm.mileage} onChange={(e) => setAddForm({ ...addForm, mileage: e.target.value })} />
          <Select
            label="Owner"
            placeholder="Select customer"
            options={users.filter(u => u.role === 'customer').map(u => ({ value: u.id, label: u.name }))}
            value={addForm.userId}
            onChange={(e) => setAddForm({ ...addForm, userId: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddSave} disabled={!addForm.brand || !addForm.model || !addForm.registrationNumber}>Add Bike</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}