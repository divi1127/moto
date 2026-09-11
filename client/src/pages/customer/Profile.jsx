import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Shield, Pencil, LogOut, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useStore from '../../store/useStore';
import { PageHeader, PageState, usePageLoading, InfoRow } from './customerShared';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function Profile() {
  const navigate = useNavigate();
  const { user, users, updateProfile, logout } = useStore();
  const loading = usePageLoading();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const myUser = user?.role === 'customer' ? user : users.find(u => u.role === 'customer');
  if (!myUser && !editing) {
    return (
      <PageState loading={loading}>
        <div className="text-center py-20">
          <p className="text-dark-400">No profile available. Please sign in.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </PageState>
    );
  }

  const userCount = users.filter(u => u.role === 'customer').length;

  const openEdit = () => {
    setForm({ name: myUser.name, phone: myUser.phone, email: myUser.email, address: myUser.address, city: myUser.city });
    setEditing(true);
  };

  const handleSave = () => {
    if (!form.name?.trim() || !form.email?.trim()) {
      toast.error('Name and email are required');
      return;
    }
    updateProfile({ name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city });
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const content = (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your account details and preferences.">
        <Button icon={Pencil} onClick={openEdit}>Edit Profile</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center">
            <Avatar name={myUser.name} size="xl" />
            <h2 className="text-lg font-bold text-white mt-4">{myUser.name}</h2>
            <p className="text-sm text-dark-400 mt-0.5">@{myUser.email.split('@')[0]}</p>
            <div className="flex justify-center mt-3">
              <Badge className="bg-primary-500/10 text-primary-400 border-primary-500/20 capitalize">{myUser.role}</Badge>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm p-4 rounded-xl bg-surface-light border border-border">
              <span className="text-dark-400 flex items-center gap-2"><User className="w-4 h-4" /> Member since</span>
              <span className="text-white font-medium">{format(new Date(myUser.createdAt), 'dd MMM yyyy')}</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <h3 className="text-base font-semibold text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Full Name" value={myUser.name} />
              <InfoRow icon={Mail} label="Email" value={myUser.email} />
              <InfoRow icon={Phone} label="Phone" value={myUser.phone} />
              <InfoRow icon={Shield} label="Account Status" value={`${myUser.status} · ${userCount} total customers`} />
              <div className="sm:col-span-2">
                <InfoRow icon={MapPin} label="Address" value={myUser.city ? `${myUser.address}, ${myUser.city}` : myUser.address || 'Not provided'} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <p className="text-xs text-dark-500">Keep your contact details up to date so we can reach you about bookings.</p>
              <Button variant="danger" icon={LogOut} onClick={() => { logout(); navigate('/login'); toast.success('Signed out'); }}>Sign out</Button>
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Profile" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <Input label="Phone" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input className="sm:col-span-2" label="Address" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Input label="City" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button icon={Save} onClick={handleSave}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}