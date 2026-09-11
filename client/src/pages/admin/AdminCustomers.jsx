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
import Avatar from '../../components/ui/Avatar';
import { Search, UserPlus, Bike, CalendarDays, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminCustomers() {
  const { users, bikes, bookings, payments, register } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const customers = users.filter(u => u.role === 'customer');

  const customerStats = useMemo(() => {
    return Object.fromEntries(customers.map(cu => {
      const customerBikes = bikes.filter(b => b.userId === cu.id);
      const customerBookings = bookings.filter(b => b.userId === cu.id);
      const customerPaymentTotal = customerBookings.reduce((sum, b) => {
        const bookingPayments = payments.filter(p => p.bookingId === b.id);
        return sum + bookingPayments.reduce((s, p) => s + p.amount, 0);
      }, 0);
      return [cu.id, { bikeCount: customerBikes.length, bookingCount: customerBookings.length, totalSpent: customerPaymentTotal }];
    }));
  }, [customers, bikes, bookings, payments]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const columns = [
    {
      header: 'Customer',
      sortable: true,
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatar} size="sm" />
          <span className="text-white font-medium">{row.name}</span>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email', render: (row) => <span className="text-white/70 text-xs">{row.email}</span> },
    { header: 'Phone', accessor: 'phone', render: (row) => <span className="text-white/70 text-xs">{row.phone}</span> },
    { header: 'City', accessor: 'city', render: (row) => <span className="text-white/70">{row.city}</span> },
    { header: 'Bikes', render: (row) => <Badge>{customerStats[row.id]?.bikeCount || 0}</Badge> },
    { header: 'Bookings', render: (row) => <Badge>{customerStats[row.id]?.bookingCount || 0}</Badge> },
    {
      header: 'Total Spent',
      render: (row) => <span className="font-semibold text-emerald-400">{formatCurrency(customerStats[row.id]?.totalSpent || 0)}</span>,
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Joined', accessor: 'createdAt', sortable: true, render: (row) => <span className="text-xs text-dark-400">{row.createdAt}</span> },
  ];

  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', city: '', address: '' });

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) return;
    register(newCustomer);
    setShowAddModal(false);
    setNewCustomer({ name: '', email: '', phone: '', city: '', address: '' });
  };

  const selectedBikes = selectedCustomer ? bikes.filter(b => b.userId === selectedCustomer.id) : [];
  const selectedBookings = selectedCustomer ? bookings.filter(b => b.userId === selectedCustomer.id) : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Management</h1>
          <p className="text-dark-400 mt-1">Manage customers, their bikes and bookings</p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowAddModal(true)}>Add Customer</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <Input
            icon={null}
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Card padding={false}>
          <DataTable
            columns={columns}
            data={filteredCustomers}
            searchable={false}
            onRowClick={(row) => { setSelectedCustomer(row); setShowDetail(true); }}
          />
        </Card>
      </motion.div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Customer Profile" size="lg">
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selectedCustomer.name} src={selectedCustomer.avatar} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                <div className="space-y-1.5 mt-2 text-sm">
                  <div className="flex items-center gap-2 text-dark-400"><Mail className="w-4 h-4" />{selectedCustomer.email}</div>
                  <div className="flex items-center gap-2 text-dark-400"><Phone className="w-4 h-4" />{selectedCustomer.phone}</div>
                  <div className="flex items-center gap-2 text-dark-400"><MapPin className="w-4 h-4" />{selectedCustomer.address}, {selectedCustomer.city}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-surface-light text-center">
                <p className="text-2xl font-bold text-primary-400">{customerStats[selectedCustomer.id]?.bikeCount || 0}</p>
                <p className="text-xs text-dark-400 mt-1">Bikes</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light text-center">
                <p className="text-2xl font-bold text-white">{customerStats[selectedCustomer.id]?.bookingCount || 0}</p>
                <p className="text-xs text-dark-400 mt-1">Bookings</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light text-center">
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(customerStats[selectedCustomer.id]?.totalSpent || 0)}</p>
                <p className="text-xs text-dark-400 mt-1">Total Spent</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bike className="w-4 h-4 text-dark-400" />
                <h4 className="text-sm font-semibold text-white">Bikes</h4>
              </div>
              <div className="space-y-2">
                {selectedBikes.length === 0 && <p className="text-sm text-dark-500">No bikes registered</p>}
                {selectedBikes.map((bike) => (
                  <div key={bike.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-white">{bike.brand} {bike.model}</p>
                      <p className="text-xs text-dark-400">{bike.registrationNumber} · {bike.year} · {bike.color}</p>
                    </div>
                    <Badge>{bike.mileage} km</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-dark-400" />
                <h4 className="text-sm font-semibold text-white">Booking History</h4>
              </div>
              <div className="space-y-2">
                {selectedBookings.length === 0 && <p className="text-sm text-dark-500">No bookings yet</p>}
                {selectedBookings.map((booking) => (
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Customer">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Rohit Kumar" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
          <Input label="Email" type="email" placeholder="rohit@email.com" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
          <Input label="Phone" placeholder="+91 98765 43210" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" placeholder="Bangalore" value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} />
            <Input label="Address" placeholder="Full address" value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer} disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone}>Add Customer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}