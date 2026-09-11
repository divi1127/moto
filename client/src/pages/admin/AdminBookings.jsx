import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { bookingStatuses, timeSlots, serviceCategories } from '../../data/mockData';
import { Plus, Calendar, Clock, User, Bike, CheckCircle, XCircle } from 'lucide-react';

export default function AdminBookings() {
  const { bookings, users, bikes, updateBooking, cancelBooking, createBooking } = useStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [newBooking, setNewBooking] = useState({
    userId: '', bikeId: '', date: '', timeSlot: '', services: [], notes: '', pickupDrop: false,
  });

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    if (statusFilter === 'active') return bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const statusTabs = [
    { id: 'all', label: 'All', count: bookings.length },
    { id: 'active', label: 'Active', count: bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length },
    { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { id: 'in-progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in-progress').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const handleStatusUpdate = (bookingId, newStatus) => {
    updateBooking(bookingId, { status: newStatus });
    setUpdatingStatus(null);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const handleCreateBooking = () => {
    if (!newBooking.userId || !newBooking.bikeId || !newBooking.date || !newBooking.timeSlot) return;
    const selectedServices = newBooking.services;
    const subtotal = selectedServices.reduce((sum, sName) => {
      const allServices = serviceCategories.flatMap(c => c.services);
      const svc = allServices.find(s => s.name === sName);
      return sum + (svc?.price || 0);
    }, 0);
    const tax = Math.round(subtotal * 0.18);
    createBooking({
      ...newBooking,
      subtotal,
      discount: 0,
      tax,
      total: subtotal + tax,
      advance: 0,
      balance: subtotal + tax,
    });
    setShowCreateModal(false);
    setNewBooking({ userId: '', bikeId: '', date: '', timeSlot: '', services: [], notes: '', pickupDrop: false });
  };

  const customerBikes = useMemo(() => {
    return newBooking.userId ? bikes.filter(b => b.userId === newBooking.userId) : [];
  }, [newBooking.userId, bikes]);

  const allServices = serviceCategories.flatMap(c => c.services);

  const columns = [
    {
      header: 'Booking #',
      accessor: 'bookingNumber',
      sortable: true,
      render: (row) => <span className="text-primary-400 font-medium cursor-pointer hover:underline">{row.bookingNumber}</span>,
    },
    {
      header: 'Customer',
      render: (row) => {
        const user = users.find(u => u.id === row.userId);
        return user?.name || 'Unknown';
      },
    },
    {
      header: 'Bike',
      render: (row) => {
        const bike = bikes.find(b => b.id === row.bikeId);
        return bike ? `${bike.brand} ${bike.model}` : 'Unknown';
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="w-3.5 h-3.5 text-dark-400" />
          {row.date}
        </div>
      ),
    },
    {
      header: 'Time',
      accessor: 'timeSlot',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="w-3.5 h-3.5 text-dark-400" />
          {row.timeSlot}
        </div>
      ),
    },
    {
      header: 'Services',
      render: (row) => <Badge>{row.services?.length || 0} services</Badge>,
    },
    {
      header: 'Total',
      accessor: 'total',
      sortable: true,
      render: (row) => <span className="font-semibold">{formatCurrency(row.total)}</span>,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
          <p className="text-dark-400 mt-1">Manage all customer bookings</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>Create Booking</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-primary-500 text-black'
                  : 'bg-surface-light text-dark-400 hover:text-white hover:bg-surface-lighter'
              )}
            >
              {tab.label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-md text-xs',
                statusFilter === tab.id ? 'bg-black/20 text-black' : 'bg-dark-700 text-dark-400'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card padding={false}>
          <DataTable
            columns={columns}
            data={filteredBookings}
            onRowClick={(row) => { setSelectedBooking(row); setShowDetail(true); }}
          />
        </Card>
      </motion.div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Booking Details" size="lg">
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Booking Number</p>
                <p className="text-lg font-bold text-primary-400">{selectedBooking.bookingNumber}</p>
              </div>
              <StatusBadge status={selectedBooking.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-dark-400" />
                  <span className="text-xs text-dark-400">Customer</span>
                </div>
                <p className="text-sm font-medium text-white">{users.find(u => u.id === selectedBooking.userId)?.name || 'Unknown'}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 mb-1">
                  <Bike className="w-4 h-4 text-dark-400" />
                  <span className="text-xs text-dark-400">Bike</span>
                </div>
                <p className="text-sm font-medium text-white">{(() => { const b = bikes.find(b => b.id === selectedBooking.bikeId); return b ? `${b.brand} ${b.model}` : 'Unknown'; })()}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-dark-400" />
                  <span className="text-xs text-dark-400">Date & Time</span>
                </div>
                <p className="text-sm font-medium text-white">{selectedBooking.date} at {selectedBooking.timeSlot}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Pickup & Drop</p>
                <p className="text-sm font-medium text-white">{selectedBooking.pickupDrop ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-dark-300 mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.services?.map((svc, i) => (
                  <Badge key={i}>{svc}</Badge>
                ))}
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Notes</p>
                <p className="text-sm text-white">{selectedBooking.notes}</p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-surface-light border border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-dark-400">Subtotal</span><span className="text-white">{formatCurrency(selectedBooking.subtotal)}</span></div>
                {selectedBooking.discount > 0 && <div className="flex justify-between"><span className="text-dark-400">Discount</span><span className="text-emerald-400">-{formatCurrency(selectedBooking.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-dark-400">Tax (18%)</span><span className="text-white">{formatCurrency(selectedBooking.tax)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold"><span className="text-white">Total</span><span className="text-primary-400">{formatCurrency(selectedBooking.total)}</span></div>
                <div className="flex justify-between"><span className="text-dark-400">Advance Paid</span><span className="text-emerald-400">{formatCurrency(selectedBooking.advance)}</span></div>
                <div className="flex justify-between font-semibold"><span className="text-white">Balance</span><span className="text-amber-400">{formatCurrency(selectedBooking.balance)}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedBooking.status === 'pending' && (
                <Button icon={CheckCircle} onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}>Confirm Booking</Button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button icon={Bike} onClick={() => handleStatusUpdate(selectedBooking.id, 'received')}>Mark Bike Received</Button>
              )}
              {!['completed', 'cancelled', 'ready'].includes(selectedBooking.status) && (
                <>
                  <Select
                    options={bookingStatuses.filter(s => s.id !== selectedBooking.status).map(s => ({ value: s.id, label: s.label }))}
                    placeholder="Update Status"
                    value={updatingStatus || ''}
                    onChange={(e) => { setUpdatingStatus(e.target.value); handleStatusUpdate(selectedBooking.id, e.target.value); }}
                  />
                </>
              )}
              {!['completed', 'cancelled'].includes(selectedBooking.status) && (
                <Button variant="danger" icon={XCircle} onClick={() => { cancelBooking(selectedBooking.id); setShowDetail(false); }}>Cancel</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Booking" size="lg">
        <div className="space-y-4">
          <Select
            label="Customer"
            placeholder="Select customer"
            options={users.filter(u => u.role === 'customer').map(u => ({ value: u.id, label: u.name }))}
            value={newBooking.userId}
            onChange={(e) => setNewBooking({ ...newBooking, userId: e.target.value, bikeId: '' })}
          />
          <Select
            label="Bike"
            placeholder="Select bike"
            options={customerBikes.map(b => ({ value: b.id, label: `${b.brand} ${b.model} (${b.registrationNumber})` }))}
            value={newBooking.bikeId}
            onChange={(e) => setNewBooking({ ...newBooking, bikeId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={newBooking.date}
              onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
            />
            <Select
              label="Time Slot"
              placeholder="Select time"
              options={timeSlots}
              value={newBooking.timeSlot}
              onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Services</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-surface-light border border-border">
              {allServices.map((svc) => (
                <label key={svc.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBooking.services.includes(svc.name)}
                    onChange={(e) => {
                      const services = e.target.checked
                        ? [...newBooking.services, svc.name]
                        : newBooking.services.filter(s => s !== svc.name);
                      setNewBooking({ ...newBooking, services });
                    }}
                    className="rounded border-border text-primary-500 focus:ring-primary-500/30"
                  />
                  <span className="text-white/80">{svc.name}</span>
                  <span className="text-dark-400 ml-auto">{formatCurrency(svc.price)}</span>
                </label>
              ))}
            </div>
          </div>
          <Textarea
            label="Notes"
            placeholder="Special instructions..."
            value={newBooking.notes}
            onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={newBooking.pickupDrop}
              onChange={(e) => setNewBooking({ ...newBooking, pickupDrop: e.target.checked })}
              className="rounded border-border text-primary-500 focus:ring-primary-500/30"
            />
            <span className="text-white/80">Pickup & Drop Required</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateBooking} disabled={!newBooking.userId || !newBooking.bikeId || !newBooking.date || !newBooking.timeSlot}>Create Booking</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
