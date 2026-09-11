import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { PageHeader, Tabs, PageState, usePageLoading } from './adminShared';
import { Palette, Paintbrush, Sticker, Wrench, Check, X, UserPlus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const CUSTOM_META = {
  'bk-3': { paintColor: 'Matte Black', finish: 'Matte', sticker: 'Classic Racing Stripes', accessories: ['LED Headlight Upgrade', 'Custom Mirrors'] },
  'bk-6': { paintColor: 'Candy Red', finish: 'Metallic', sticker: 'Custom MotoGP Graphics', accessories: ['Crash Guard', 'Custom Grips'] },
  'bk-1': { paintColor: 'British Racing Green', finish: 'Gloss', sticker: 'Racing White Stripes', accessories: ['Seat Customization'] },
  'bk-2': { paintColor: 'Deep Blue', finish: 'Metallic', sticker: 'Modern Racing Decals', accessories: [] },
  'bk-5': { paintColor: null, finish: null, sticker: null, accessories: ['Mobile Holder'] },
};

const CUSTOM_SERVICE_RE = /paint|decal|sticker|graphic|wrap|led|mirror|grip|crash|seat|holder|tattoo/i;

export default function AdminCustomization() {
  const { bookings, users, bikes, serviceCategories, updateBooking, updateJobCard, jobCards } = useStore();
  const loading = usePageLoading();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignStaff, setAssignStaff] = useState('');
  const [assignments, setAssignments] = useState({});

  const staff = useMemo(() => users.filter(u => u.role === 'staff' && u.status === 'active'), [users]);
  const accessoryNames = useMemo(() => {
    const cat = serviceCategories.find(c => c.id === 'accessories');
    return cat?.services.map(s => s.name) || [];
  }, [serviceCategories]);

  const requests = useMemo(() => {
    return bookings
      .filter(b => (b.services || []).some(s => CUSTOM_SERVICE_RE.test(s)))
      .map(b => {
        const meta = CUSTOM_META[b.id] || { paintColor: 'Jet Black', finish: 'Gloss', sticker: 'Custom Design', accessories: [] };
        const accessories = (b.services || []).filter(s => accessoryNames.includes(s));
        const requestStatus =
          b.status === 'cancelled' ? 'rejected'
          : b.status === 'completed' ? 'completed'
          : ['painting', 'detailing', 'ceramic', 'in-progress', 'quality-check', 'ready'].includes(b.status) ? 'in-progress'
          : b.status === 'approved' ? 'approved'
          : 'pending';
        return { ...b, meta, accessories: meta.accessories?.length ? meta.accessories : accessories, requestStatus };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings, accessoryNames]);

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter(r => r.requestStatus === 'pending').length,
    approved: requests.filter(r => r.requestStatus === 'approved').length,
    'in-progress': requests.filter(r => r.requestStatus === 'in-progress').length,
    completed: requests.filter(r => r.requestStatus === 'completed').length,
    rejected: requests.filter(r => r.requestStatus === 'rejected').length,
  }), [requests]);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.requestStatus === filter);
  const tabs = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'approved', label: 'Approved', count: counts.approved },
    { value: 'in-progress', label: 'In Progress', count: counts['in-progress'] },
    { value: 'completed', label: 'Completed', count: counts.completed },
    { value: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const customerName = id => users.find(u => u.id === id)?.name || 'Unknown customer';
  const bikeLabel = id => {
    const bike = bikes.find(x => x.id === id);
    return bike ? `${bike.brand} ${bike.model} · ${bike.registrationNumber}` : 'Unknown bike';
  };

  const handleApprove = req => {
    updateBooking(req.id, { status: 'approved' });
    toast.success(`${req.bookingNumber} approved — moving to workshop`);
  };

  const handleReject = req => {
    updateBooking(req.id, { status: 'cancelled' });
    toast.success(`${req.bookingNumber} rejected`);
  };

  const handleAssign = () => {
    if (!assignStaff) return;
    setAssignments(a => ({ ...a, [assignTarget.id]: assignStaff }));
    updateJobCard(
      jobCards.find(j => j.bookingId === assignTarget.id)?.id,
      { assignedStaff: [assignStaff] }
    );
    toast.success(`Designer assigned to ${assignTarget.bookingNumber}`);
    setAssignTarget(null);
    setAssignStaff('');
  };

  const assignedName = b => {
    const id = assignments[b.id];
    return id ? users.find(u => u.id === id)?.name : null;
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Customization Requests" subtitle="Approve paint, sticker & accessory customizations requested by customers." />

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No customization requests"
          description="Requests for paint jobs, stickers and accessories will appear here once customers submit them."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((req, i) => {
            const assigned = assignedName(req);
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-red-500" style={{ opacity: req.requestStatus === 'approved' ? 1 : 0.4 }} />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-primary-400">{req.bookingNumber}</p>
                      <h3 className="text-lg font-bold text-white mt-0.5">{customerName(req.userId)}</h3>
                      <p className="text-xs text-dark-500 mt-0.5">{bikeLabel(req.bikeId)}</p>
                    </div>
                    <StatusBadge status={req.requestStatus === 'rejected' ? 'cancelled' : req.requestStatus} />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-surface-light border border-border">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-dark-500 font-medium mb-1.5">
                        <Paintbrush className="w-3.5 h-3.5" /> Paint
                      </div>
                      {req.meta.paintColor ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: req.meta.paintColor.toLowerCase().includes('black') ? '#111' : req.meta.paintColor.toLowerCase().includes('green') ? '#166534' : req.meta.paintColor.toLowerCase().includes('red') ? '#991b1b' : req.meta.paintColor.toLowerCase().includes('blue') ? '#1e40af' : '#888' }} />
                            <span className="text-sm font-medium text-white">{req.meta.paintColor}</span>
                          </div>
                          <p className="text-[11px] text-dark-500 mt-1">{req.meta.finish} finish</p>
                        </>
                      ) : <p className="text-xs text-dark-500">Not requested</p>}
                    </div>
                    <div className="p-3 rounded-xl bg-surface-light border border-border">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-dark-500 font-medium mb-1.5">
                        <Sticker className="w-3.5 h-3.5" /> Sticker
                      </div>
                      {req.meta.sticker ? <p className="text-sm font-medium text-white">{req.meta.sticker}</p> : <p className="text-xs text-dark-500">Not requested</p>}
                    </div>
                    <div className="p-3 rounded-xl bg-surface-light border border-border">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-dark-500 font-medium mb-1.5">
                        <Wrench className="w-3.5 h-3.5" /> Accessories
                      </div>
                      {req.accessories.length ? (
                        <div className="flex flex-wrap gap-1">
                          {req.accessories.slice(0, 2).map(a => <span key={a} className="text-[11px] px-2 py-0.5 rounded-md bg-surface-lighter text-dark-300">{a}</span>)}
                          {req.accessories.length > 2 && <span className="text-[11px] text-dark-500">+{req.accessories.length - 2} more</span>}
                        </div>
                      ) : <p className="text-xs text-dark-500">None</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(req.services || []).slice(0, 4).map(s => <Badge key={s} className="bg-surface-lighter text-dark-300 border-border">{s}</Badge>)}
                    {req.services.length > 4 && <span className="text-xs text-dark-500">+{req.services.length - 4} more</span>}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {req.requestStatus === 'pending' && (
                        <>
                          <Button size="sm" variant="primary" icon={Check} onClick={() => handleApprove(req)}>Approve</Button>
                          <Button size="sm" variant="danger" icon={X} onClick={() => handleReject(req)}>Reject</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" icon={UserPlus} onClick={() => setAssignTarget(req)}>Assign</Button>
                      <Button size="sm" variant="secondary" icon={Eye} onClick={() => setSelected(req)}>Details</Button>
                    </div>
                    <div className="text-right">
                      {assigned
                        ? <p className="text-xs font-medium text-emerald-400">Assigned to {assigned}</p>
                        : <p className="text-xs text-dark-500">{formatCurrency(req.total)}</p>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Customization Request" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-primary-400">{selected.bookingNumber}</p>
                <h3 className="text-lg font-bold text-white mt-1">{customerName(selected.userId)}</h3>
                <p className="text-sm text-dark-400">{bikeLabel(selected.bikeId)}</p>
              </div>
              <StatusBadge status={selected.requestStatus === 'rejected' ? 'cancelled' : selected.requestStatus} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-light border border-border">
                <p className="text-xs uppercase tracking-wider text-dark-500 font-medium mb-2">Paint Colour</p>
                {selected.meta.paintColor
                  ? <p className="text-sm font-semibold text-white">{selected.meta.paintColor} · {selected.meta.finish}</p>
                  : <p className="text-sm text-dark-500">Not requested</p>}
              </div>
              <div className="p-4 rounded-xl bg-surface-light border border-border">
                <p className="text-xs uppercase tracking-wider text-dark-500 font-medium mb-2">Sticker Design</p>
                <p className="text-sm font-semibold text-white">{selected.meta.sticker || 'Not requested'}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-light border border-border">
                <p className="text-xs uppercase tracking-wider text-dark-500 font-medium mb-2">Total Value</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(selected.total)}</p>
                <p className="text-xs text-dark-500 mt-1">Advance paid: {formatCurrency(selected.advance || 0)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-dark-500 font-medium mb-2">Requested Accessories</p>
              {selected.accessories.length ? (
                <div className="flex flex-wrap gap-2">
                  {selected.accessories.map(a => <Badge key={a} className="bg-surface-lighter text-dark-300 border-border">{a}</Badge>)}
                </div>
              ) : <p className="text-sm text-dark-500">None requested</p>}
            </div>

            {selected.notes && (
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-xs uppercase tracking-wider text-yellow-400 font-medium mb-1.5">Customer Notes</p>
                <p className="text-sm text-dark-200 italic">"{selected.notes}"</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!assignTarget} onClose={() => setAssignTarget(null)} title="Assign Designer" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-dark-300">
            Assign a specialist to <span className="font-medium text-white">{assignTarget?.bookingNumber}</span> to prepare a design mockup.
          </p>
          <Select
            label="Specialist"
            placeholder="Select staff member"
            value={assignStaff}
            onChange={e => setAssignStaff(e.target.value)}
            options={staff.map(s => ({ value: s.id, label: `${s.name} — ${s.specialization || 'General'}` }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button icon={UserPlus} disabled={!assignStaff} onClick={handleAssign}>Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}