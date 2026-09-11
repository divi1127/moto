import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import KPICard from '../../components/ui/KPICard';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { FileText, Wrench, Camera, ClipboardList, CheckCircle2, Loader, AlertCircle } from 'lucide-react';

export default function AdminJobCards() {
  const { jobCards, bookings, users, bikes, updateJobCard } = useStore();
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const columns = [
    {
      header: 'Job Card #',
      accessor: 'id',
      render: (row) => <span className="text-primary-400 font-medium">{row.id.toUpperCase()}</span>,
    },
    {
      header: 'Booking #',
      render: (row) => {
        const booking = bookings.find(b => b.id === row.bookingId);
        return booking?.bookingNumber || 'Unknown';
      },
    },
    {
      header: 'Customer',
      render: (row) => {
        const booking = bookings.find(b => b.id === row.bookingId);
        const user = users.find(u => u.id === booking?.userId);
        return user?.name || 'Unknown';
      },
    },
    {
      header: 'Bike',
      render: (row) => {
        const booking = bookings.find(b => b.id === row.bookingId);
        const bike = bikes.find(b => b.id === booking?.bikeId);
        return bike ? `${bike.brand} ${bike.model}` : 'Unknown';
      },
    },
    {
      header: 'Assigned Staff',
      render: (row) => {
        const staff = row.assignedStaff?.map(id => users.find(u => u.id === id)?.name).filter(Boolean);
        return (
          <div className="flex flex-wrap gap-1">
            {staff?.length ? staff.map((name, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">{name}</span>
            )) : <span className="text-dark-500">Unassigned</span>}
          </div>
        );
      },
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Est. Cost',
      accessor: 'estimatedCost',
      sortable: true,
      render: (row) => <span className="font-semibold">{formatCurrency(row.estimatedCost)}</span>,
    },
  ];

  const summary = useMemo(() => {
    return {
      total: jobCards.length,
      inProgress: jobCards.filter(j => j.status === 'in-progress').length,
      completed: jobCards.filter(j => j.status === 'completed').length,
      pending: jobCards.filter(j => ['inspection', 'approved', 'received'].includes(j.status)).length,
    };
  }, [jobCards]);

  const handleStatusUpdate = (id, status) => {
    updateJobCard(id, { status });
    setNewStatus('');
    if (selectedCard?.id === id) {
      setSelectedCard({ ...selectedCard, status });
    }
  };

  const statusOptions = [
    { value: 'received', label: 'Bike Received' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'approved', label: 'Estimate Approved' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'painting', label: 'Painting' },
    { value: 'detailing', label: 'Detailing' },
    { value: 'ceramic', label: 'Ceramic / Protection' },
    { value: 'quality-check', label: 'Quality Check' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Cards</h1>
          <p className="text-dark-400 mt-1">Manage workshop job cards and workflow</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Job Cards" value={summary.total} icon={FileText} color="#3b82f6" />
        <KPICard title="In Progress" value={summary.inProgress} icon={Wrench} color="#f97316" />
        <KPICard title="Completed" value={summary.completed} icon={CheckCircle2} color="#10b981" />
        <KPICard title="Pending Inspection" value={summary.pending} icon={AlertCircle} color="#f59e0b" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card padding={false}>
          {jobCards.length === 0 ? (
            <EmptyState icon={FileText} title="No job cards" description="Job cards will appear here when bookings are accepted into the workshop." />
          ) : (
            <DataTable
              columns={columns}
              data={jobCards}
              pageSize={8}
              onRowClick={(row) => { setSelectedCard(row); setShowDetail(true); }}
            />
          )}
        </Card>
      </motion.div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Job Card ${selectedCard?.id.toUpperCase() || ''}`} size="lg">
        {selectedCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedCard.status} size="md" />
              <div className="flex items-center gap-3">
                <Select
                  options={statusOptions.filter(o => o.value !== selectedCard.status)}
                  placeholder="Update Status"
                  value={newStatus}
                  onChange={(e) => { setNewStatus(e.target.value); handleStatusUpdate(selectedCard.id, e.target.value); }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Booking</p>
                <p className="text-sm font-medium text-white">{bookings.find(b => b.id === selectedCard.bookingId)?.bookingNumber || 'Unknown'}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Inspection Date</p>
                <p className="text-sm font-medium text-white">{selectedCard.inspectionDate}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Estimated Cost</p>
                <p className="text-sm font-semibold text-primary-400">{formatCurrency(selectedCard.estimatedCost)}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-light">
                <p className="text-xs text-dark-400 mb-1">Actual Cost</p>
                <p className="text-sm font-semibold text-emerald-400">{selectedCard.actualCost ? formatCurrency(selectedCard.actualCost) : 'Pending'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-dark-400" />
                <h4 className="text-sm font-semibold text-white">Assigned Staff</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCard.assignedStaff?.map((id, i) => {
                  const staff = users.find(u => u.id === id);
                  if (!staff) return null;
                  return (
                    <Badge key={i}>{staff.name}{staff.specialization ? ` · ${staff.specialization}` : ''}</Badge>
                  );
                })}
                {!selectedCard.assignedStaff?.length && <span className="text-sm text-dark-500">No staff assigned</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-light border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-white">Inspection Notes</h4>
                </div>
                <p className="text-sm text-white/70">{selectedCard.inspectionNotes || 'No inspection notes'}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-light border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white">Work Notes</h4>
                </div>
                <p className="text-sm text-white/70">{selectedCard.workNotes || 'No work notes yet'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-dark-400" />
                <h4 className="text-sm font-semibold text-white">Before / After Photos</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Before', 'After'].map((label) => (
                  <button
                    key={label}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border bg-surface-light hover:border-primary-500/40 transition-colors cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-dark-500 mb-2" />
                    <span className="text-xs text-dark-400">{label} Photo</span>
                    <span className="text-[10px] text-dark-500 mt-1">Click to upload</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-light border border-border">
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <Loader className="w-4 h-4 text-primary-400" />
                Progress backed by booking workflow
              </div>
              <span className="text-xs text-dark-500">Stage index: {selectedCard.stageIndex || 0}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}