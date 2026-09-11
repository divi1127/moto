import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { PageHeader, Tabs, Toggle, PageState, usePageLoading } from './adminShared';
import {
  BellRing, Save, Upload, Clock3, KeyRound, MonitorSmartphone, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const NOTIFICATION_EVENTS = [
  { id: 'booking', label: 'New Booking', description: 'When a customer books a service' },
  { id: 'payment', label: 'Payment Received', description: 'When a payment is recorded' },
  { id: 'status', label: 'Status Updates', description: 'When a job card status changes' },
  { id: 'review', label: 'New Review', description: 'When a customer posts a review' },
  { id: 'staff', label: 'Staff Assignments', description: 'When work is assigned' },
];

export default function AdminSettings() {
  const loading = usePageLoading();
  const [tab, setTab] = useState('general');

  const [general, setGeneral] = useState({
    name: 'MOTO CUSTOM & DETAILING',
    address: '2nd Cross, Indiranagar 100ft Road, Bengaluru 560038',
    phone: '+91 98765 40000',
    email: 'hello@motoCustom.in',
    logo: null,
  });

  const [business, setBusiness] = useState({
    hours: DAYS.map(d => ({ day: d, open: true, openTime: '09:00', closeTime: '19:00' })),
    taxRate: '18',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST, GMT+5:30)',
  });

  const [notifications, setNotifications] = useState(
    NOTIFICATION_EVENTS.map(e => ({ ...e, email: true, whatsapp: true, sms: false }))
  );

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFA: true,
    sessions: [
      { id: 's1', device: 'Chrome · Windows', location: 'Bengaluru, IN', ip: '103.21.58.12', current: true, lastActive: '2 min ago' },
      { id: 's2', device: 'iPhone Safari', location: 'Bengaluru, IN', ip: '103.87.14.9', lastActive: '3 hrs ago' },
      { id: 's3', device: 'Edge · Windows', location: 'Mumbai, IN', ip: '49.36.120.7', lastActive: '2 days ago' },
    ],
  });

  const patchGeneral = k => v => setGeneral(g => ({ ...g, [k]: v }));
  const setBusinessField = k => v => setBusiness(b => ({ ...b, [k]: v }));
  const toggleDay = idx => () => setBusiness(b => ({
    ...b,
    hours: b.hours.map((h, i) => i === idx ? { ...h, open: !h.open } : h),
  }));
  const setDayTime = (idx, field) => v => setBusiness(b => ({
    ...b,
    hours: b.hours.map((h, i) => i === idx ? { ...h, [field]: v } : h),
  }));
  const toggleChannel = (eid, channel) => () => setNotifications(ns => ns.map(n => n.id === eid ? { ...n, [channel]: !n[channel] } : n));
  const patchSecurity = k => v => setSecurity(s => ({ ...s, [k]: v }));

  const handleLogo = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGeneral(g => ({ ...g, logo: { name: file.name, url: URL.createObjectURL(file) } }));
    toast.success('Logo selected — save to apply');
  };

  const save = section => {
    toast.success(`${section} settings saved successfully`);
  };

  const changePassword = () => {
    if (!security.currentPassword) { toast.error('Enter your current password'); return; }
    if (security.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (security.newPassword !== security.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSecurity(s => ({ ...s, currentPassword: '', newPassword: '', confirmPassword: '' }));
    toast.success('Password changed successfully');
  };

  const revokeSession = id => {
    setSecurity(s => ({ ...s, sessions: s.sessions.filter(x => x.id !== id) }));
    toast.success('Session revoked');
  };

  const activeDays = business.hours.filter(h => h.open).length;
  const timeOptions = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of ['00', '30']) {
      timeOptions.push(`${String(h).padStart(2, '0')}:${m}`);
    }
  }

  const content = (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your studio profile, business rules, notifications and security." />

      <Tabs
        tabs={[
          { value: 'general', label: 'General' },
          { value: 'business', label: 'Business' },
          { value: 'notifications', label: 'Notifications' },
          { value: 'security', label: 'Security' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'general' && (
        <motion.div key="general" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
          <Card>
            <h3 className="text-base font-semibold text-white mb-1">Studio Profile</h3>
            <p className="text-sm text-dark-400 mb-5">Shown on invoices, public listings and communication.</p>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-dark-300 mb-2">Logo</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border border-border bg-surface-light flex items-center justify-center overflow-hidden">
                    {general.logo
                      ? <img src={general.logo.url} alt={general.logo.name} className="w-full h-full object-cover" />
                      : <div className="text-center"><span className="text-black font-black text-lg bg-gradient-to-br from-primary-500 to-red-500 w-9 h-9 rounded-lg inline-flex items-center justify-center">MC</span></div>}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-border bg-surface-lighter hover:bg-dark-700 text-white cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" /> Upload logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                  </label>
                </div>
              </div>
              <Input label="Studio Name" value={general.name} onChange={e => patchGeneral('name')(e.target.value)} />
              <Textarea label="Address" value={general.address} onChange={e => patchGeneral('address')(e.target.value)} className="min-h-[80px]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone" value={general.phone} onChange={e => patchGeneral('phone')(e.target.value)} />
                <Input label="Email" type="email" value={general.email} onChange={e => patchGeneral('email')(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button icon={Save} onClick={() => save('General')}>Save changes</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {tab === 'business' && (
        <motion.div key="business" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Clock3 className="w-5 h-5 text-primary-400" />
              <h3 className="text-base font-semibold text-white">Business Hours</h3>
            </div>
            <p className="text-sm text-dark-400 mb-5">Open {activeDays} days a week {activeDays > 0 ? '· shown below' : ''}.</p>
            <div className="space-y-2">
              {business.hours.map((h, i) => (
                <div key={h.day} className={cn(
                  'flex items-center justify-between gap-4 p-3 rounded-xl border transition-colors',
                  h.open ? 'bg-surface-light border-border' : 'bg-surface-light/40 border-border/60 opacity-60'
                )}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={h.open}
                      onChange={toggleDay(i)}
                      className="w-4 h-4 accent-primary-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-white w-10">{h.day}</span>
                  </div>
                  {h.open ? (
                    <div className="flex items-center gap-2">
                      <Select className="w-28 py-1.5" value={h.openTime} onChange={e => setDayTime(i, 'openTime')(e.target.value)} options={timeOptions} />
                      <span className="text-dark-500 text-xs">to</span>
                      <Select className="w-28 py-1.5" value={h.closeTime} onChange={e => setDayTime(i, 'closeTime')(e.target.value)} options={timeOptions} />
                    </div>
                  ) : <span className="text-xs text-dark-500">Closed</span>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <Input label="Tax Rate (%)" type="number" value={business.taxRate} onChange={e => setBusinessField('taxRate')(e.target.value)} />
              <Select label="Currency" value={business.currency} onChange={e => setBusinessField('currency')(e.target.value)} options={['INR (₹)', 'USD ($)', 'EUR (€)'].map(v => ({ value: v, label: v }))} />
              <Select label="Timezone" value={business.timezone} onChange={e => setBusinessField('timezone')(e.target.value)} options={['Asia/Kolkata (IST, GMT+5:30)', 'Asia/Dubai (GST, GMT+4:00)'].map(v => ({ value: v, label: v }))} />
            </div>
            <div className="flex justify-end mt-5">
              <Button icon={Save} onClick={() => save('Business')}>Save changes</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {tab === 'notifications' && (
        <motion.div key="notif" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <BellRing className="w-5 h-5 text-primary-400" />
              <h3 className="text-base font-semibold text-white">Notification Channels</h3>
            </div>
            <p className="text-sm text-dark-400 mb-5">Choose how your team is notified for each event type.</p>

            <div className="grid grid-cols-5 gap-2 px-1 pb-2 text-[11px] uppercase tracking-wider text-dark-500 font-medium">
              <span className="col-span-2">Event</span>
              <span className="text-center">Email</span>
              <span className="text-center">WhatsApp</span>
              <span className="text-center">SMS</span>
            </div>
            <div className="divide-y divide-border/60">
              {notifications.map(n => (
                <div key={n.id} className="py-3 flex items-center gap-2">
                  <div className="col-span-2 flex-1">
                    <p className="text-sm font-medium text-white">{n.label}</p>
                    <p className="text-xs text-dark-500">{n.description}</p>
                  </div>
                  <div className="flex items-center gap-4 justify-end" style={{ width: '20%' }}>
                    <input type="checkbox" checked={n.email} onChange={toggleChannel(n.id, 'email')} className="w-4 h-4 accent-primary-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-end" style={{ width: '20%' }}>
                    <input type="checkbox" checked={n.whatsapp} onChange={toggleChannel(n.id, 'whatsapp')} className="w-4 h-4 accent-primary-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-end" style={{ width: '20%' }}>
                    <input type="checkbox" checked={n.sms} onChange={toggleChannel(n.id, 'sms')} className="w-4 h-4 accent-primary-500 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-dark-500">Prefer toggle switches? Use the switches below.</p>
              <Button icon={Save} onClick={() => save('Notifications')}>Save changes</Button>
            </div>

            <div className="mt-6 space-y-4 border-t border-border pt-5">
              {notifications.map(n => (
                <Toggle key={n.id} checked={n.email} onChange={() => toggleChannel(n.id, 'email')()} label={`Email — ${n.label}`} description={n.description} />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div key="security" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-5 h-5 text-primary-400" />
                <h3 className="text-base font-semibold text-white">Change Password</h3>
              </div>
              <p className="text-sm text-dark-400 mb-5">Update the password used to access the admin panel.</p>
              <div className="space-y-4">
                <Input label="Current Password" type="password" value={security.currentPassword} onChange={e => patchSecurity('currentPassword')(e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="New Password" type="password" value={security.newPassword} onChange={e => patchSecurity('newPassword')(e.target.value)} />
                  <Input label="Confirm New Password" type="password" value={security.confirmPassword} onChange={e => patchSecurity('confirmPassword')(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button icon={KeyRound} onClick={changePassword}>Update password</Button>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-border">
                <Toggle
                  checked={security.twoFA}
                  onChange={() => { patchSecurity('twoFA')(!security.twoFA); toast.success(security.twoFA ? '2FA disabled' : '2FA enabled'); }}
                  label="Two-factor authentication"
                  description="Require an OTP on login for extra security"
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-1">
                <MonitorSmartphone className="w-5 h-5 text-primary-400" />
                <h3 className="text-base font-semibold text-white">Active Sessions</h3>
              </div>
              <p className="text-sm text-dark-400 mb-5">Devices currently signed in to the admin panel.</p>
              <div className="space-y-3">
                {security.sessions.map(session => (
                  <div key={session.id} className="p-4 rounded-xl bg-surface-light border border-border">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          {session.device}
                          {session.current && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">This device</Badge>}
                        </p>
                        <p className="text-xs text-dark-500 mt-0.5">{session.location} · {session.ip} · active {session.lastActive}</p>
                      </div>
                      {!session.current && (
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => revokeSession(session.id)}>Revoke</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );

  return <PageState loading={loading}>{content}</PageState>;
}