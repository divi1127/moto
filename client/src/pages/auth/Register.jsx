import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Home, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

export default function Register() {
  const navigate = useNavigate();
  const register = useStore(s => s.register);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', city: '', preferredContact: 'WhatsApp',
  });

  const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Hyderabad', 'Pune', 'Chennai'];
  const contactMethods = ['WhatsApp', 'SMS', 'Email', 'Phone Call'];

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.phone) newErrors.phone = 'Phone is required';
    else if (!/^[+0-9 ]{10,15}$/.test(form.phone)) newErrors.phone = 'Invalid phone number';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setTimeout(() => {
      register({ name: form.name, email: form.email, phone: form.phone, password: form.password, address: form.address, city: form.city, preferredContact: form.preferredContact });
      setLoading(false);
      toast.success('Account created! Welcome to Moto Custom.');
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-sm text-dark-400">Join Moto Custom & Detailing</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" placeholder="Arjun Mehta" value={form.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email address" type="email" placeholder="you@email.com" value={form.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} icon={Mail} />
          <Input label="Mobile number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => handleChange('phone', e.target.value)} error={errors.phone} icon={Phone} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => handleChange('password', e.target.value)} error={errors.password} icon={Lock} />
          <Input label="Confirm password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} error={errors.confirmPassword} icon={Lock} />
        </div>
        <Input label="Address" placeholder="Street, area, landmark" value={form.address} onChange={e => handleChange('address', e.target.value)} icon={Home} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="City" options={cities} placeholder="Select city" value={form.city} onChange={e => handleChange('city', e.target.value)} icon={MapPin} />
          <Select label="Preferred contact" options={contactMethods} value={form.preferredContact} onChange={e => handleChange('preferredContact', e.target.value)} icon={Phone} />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create Account <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <div className="text-center text-sm">
        <span className="text-dark-400">Already have an account? </span>
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
      </div>
    </div>
  );
}
