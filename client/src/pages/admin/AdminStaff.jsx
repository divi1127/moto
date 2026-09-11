import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
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
import { PageHeader, SectionTitle, PageState, usePageLoading } from './adminShared';
import { format } from 'date-fns';
import { UserPlus, Pencil, Power, Phone, Mail, CalendarDays, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = ['Painter', 'Detailer', 'Ceramic Specialist', 'Sticker Designer', 'Service Technician'];

export default function AdminStaff() {
  const { users, bookings, jobCards, addStaff, updateUser } = useStore();
  const loading = usePageLoading();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  const staff = useMemo(() => users.filter(u => u.role === 'staff' || u.role === 'manager'), [users]);
  const tabs = useMemo(() => [
    { value: 'all', label: 'All Staff', count: staff.length },
    { value: 'active', label: 'Active', count: staff.filter(s => s.status === 'active').length },
    { value: 'inactive', label: 'Inactive', count: staff.filter(s => s.status !== 'active').length },
  ], [staff]);

  const filtered = activeTab === 'all' ? staff : staff.filter(s => s.status === activeTab);

  const assignmentsByStaff = useMemo(() => {
    const map = {};
    jobCards.forEach(jc => {
      (jc.assignedStaff || []).forEach(sid => {
        const booking = bookings.find(b => b.id === jc.bookingId);
        if (booking) {
          map[sid] = map[sid] || [];
          map[sid].push(booking);
        }
      });
    });
    return map;
  }, [jobCards, bookings]);

  const openAdd = () => {
    setEditing(null);
    setForm({ role: 'staff', specialization: 'Detailer', skills: '' });
    setModalOpen(true);
  };

  const openEdit = s => {
    setEditing(s);
    setForm({ ...s, skills: (s.skills || []).join(', ') });
    setModalOpen(true);
  };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if (!form.phone?.trim()) e.phone = 'Phone is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    const data = {
      ...form,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    if (editing) {
      updateUser(editing.id, data);
      toast.success('Staff member updated');
    } else {
      addStaff(data);
      toast.success('Staff member added');
    }
    setModalOpen(false);
  };

  const toggleStatus = s => {
    updateUser(s.id, { status: s.status === 'active' ? 'inactive' : 'active' });
    toast.success(s.status === 'active' ? `${s.name} deactivated` : `${s.name} activated`);
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Staff Management" subtitle="Manage your painters, detailers, ceramic specialists and technicians.">
        <Button icon={UserPlus} onClick={openAdd}>Add Staff</Button>
      </PageHeader>

      <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-surface-light border border-border">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer border',
              activeTab === t.value
                ? 'bg-primary-500/15 text-primary-400 border-primary-500/20'
                : 'text-dark-400 hover:text-white hover:bg-surface-lighter border-transparent'
            )}
          >
            {t.label}
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/5 border border-border">{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No staff members"
          description="Add your first staff member to start assigning work across the workshop."
          action="Add Staff"
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s, i) => {
            const assigned = assignmentsByStaff[s.id] || [];
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card hover className={cn('h-full flex flex-col', s.status !== 'active' && 'opacity-80')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border',
                        s.status === 'active'
                          ? 'bg-gradient-to-br from-primary-500/20 to-red-500/10 text-primary-400 border-primary-500/20'
                          : 'bg-surface-lighter text-dark-500 border-border'
                      )}>
                        {s.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-primary-400">{s.specialization || 'General Staff'}</p>
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-dark-400"><Phone className="w-3.5 h-3.5 text-dark-500" /> {s.phone}</p>
                    <p className="flex items-center gap-2 text-dark-400"><Mail className="w-3.5 h-3.5 text-dark-500" /> {s.email}</p>
                    <p className="flex items-center gap-2 text-dark-400"><CalendarDays className="w-3.5 h-3.5 text-dark-500" /> Joined {format(new Date(s.createdAt), 'dd MMM yyyy')}</p>
                  </div>

                  {s.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.skills.slice(0, 4).map(skill => <Badge key={skill} className="bg-surface-lighter text-dark-300 border-border">{skill}</Badge>)}
                      {s.skills.length > 4 && <span className="text-xs text-dark-500 self-center">+{s.skills.length - 4}</span>}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-border text-xs text-dark-500 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Assigned jobs</span>
                      <span className="font-semibold text-white">{assigned.length}</span>
                    </div>
                    {assigned.slice(0, 2).map(b => (
                      <p key={b.id} className="text-[11px] font-mono text-dark-400">• {b.bookingNumber} <span className="text-dark-600">({b.status})</span></p>
                    ))}
                    {assigned.length > 2 && <p className="text-[11px] text-dark-600">+{assigned.length - 2} more jobs</p>}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex gap-2 flex-wrap">
                    <Button size="sm" variant="secondary" icon={Pencil} onClick={() => openEdit(s)}>Edit</Button>
                    {s.status === 'active'
                      ? <Button size="sm" variant="danger" icon={Power} onClick={() => toggleStatus(s)}>Deactivate</Button>
                      : <Button size="sm" variant="outline" icon={Power} onClick={() => toggleStatus(s)}>Activate</Button>}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <SectionTitle icon={Wrench} title="Staff Assignments" className="mt-2" />

      <Card>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">Active workshop assignments</h3>
          <p className="text-sm text-dark-400">Bookings currently being worked on by your team</p>
        </div>
        {jobCards.filter(j => j.status === 'in-progress').length === 0 ? (
          <p className="text-sm text-dark-500 py-6 text-center">No active assignments. Assign work from the Job Cards page.</p>
        ) : (
          <DataTable
            searchable={false}
            pageSize={5}
            columns={[
              { header: 'Job Card', accessor: 'id', render: r => <span className="text-primary-400 font-medium font-mono">{r.id.toUpperCase()}</span> },
              { header: 'Booking', render: r => {
                const b = bookings.find(x => x.id === r.bookingId);
                return <span className="font-mono text-white/80">{b?.bookingNumber || 'Unknown'}</span>;
              } },
              { header: 'Status', render: r => <StatusBadge status={r.status} /> },
              {
                header: 'Assigned Staff',
                render: r => (
                  <div className="flex flex-wrap gap-1">
                    {r.assignedStaff?.length
                      ? r.assignedStaff.map(id => <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-surface-lighter text-dark-300">{users.find(u => u.id === id)?.name || 'Unknown'}</span>)
                      : <span className="text-dark-500">Unassigned</span>}
                  </div>
                ),
              },
            ]}
            data={jobCards.filter(j => j.status === 'in-progress')}
          />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff' : 'Add Staff'} size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name || ''} placeholder="e.g. Ajay Kumar" error={errors.name} onChange={e => set('name', e.target.value)} />
            <Input label="Phone" value={form.phone || ''} placeholder="+91 98765 43210" error={errors.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <Input label="Email" type="email" value={form.email || ''} placeholder="name@motoCustom.in" error={errors.email} onChange={e => set('email', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              value={form.role || 'staff'}
              onChange={e => set('role', e.target.value)}
              options={[
                { value: 'staff', label: 'Staff' },
                { value: 'manager', label: 'Manager' },
              ]}
            />
            <Select
              label="Specialization"
              value={form.specialization || ''}
              placeholder="Select specialization"
              onChange={e => set('specialization', e.target.value)}
              options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
            />
          </div>
          <Input label="Skills (comma separated)" value={form.skills || ''} placeholder="Spray painting, Pinstriping, Airbrush" onChange={e => set('skills', e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button icon={UserPlus} onClick={handleSubmit}>{editing ? 'Save changes' : 'Add staff'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}