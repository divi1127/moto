import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Sparkles, Paintbrush, Sticker, Shield, ShieldCheck, Wrench,
  ArrowRight, Palette
} from 'lucide-react';
import { cn, formatCurrency, getStatusConfig } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PageHeader, PageState, usePageLoading } from './customerShared';

const CATEGORY_ICONS = { Droplets, Sparkles, Paintbrush, Sticker, Shield, ShieldCheck, Wrench, Palette };

export default function Services() {
  const navigate = useNavigate();
  const { serviceCategories } = useStore();
  const loading = usePageLoading();
  const [error, setError] = useState(false);
  const [active, setActive] = useState(serviceCategories[0]?.id || '');

  useEffect(() => {
    setError(!serviceCategories.length);
  }, [serviceCategories]);

  const categories = serviceCategories;
  const activeCategory = categories.find(c => c.id === active) || categories[0];

  const bookService = service => navigate('/book-service', { state: { serviceId: service.id, service } });

  const content = (
    <div id="services" className="space-y-6">
      <PageHeader title="Services" subtitle="Premium care for every ride — washing, detailing, painting, protection and more.">
        <Button variant="outline" icon={Palette} onClick={() => navigate('/customization')}>Customize your bike</Button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary-500/20 p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-red-500/10 pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{activeCategory?.name}</h2>
            <p className="text-sm text-dark-400 mt-1 max-w-xl">{activeCategory?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">{categories.length}</span>
            <span className="text-sm text-dark-400">service categories</span>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat.icon] || Wrench;
          const isActive = cat.id === active;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border transition-all cursor-pointer',
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border-primary-500/30 shadow-lg shadow-primary-500/10'
                  : 'bg-surface text-dark-400 border-border hover:text-white hover:bg-surface-lighter'
              )}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? undefined : cat.color }} />
              {cat.name}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory?.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {activeCategory?.services.map((service, i) => {
            const Icon = CATEGORY_ICONS[activeCategory.icon] || Wrench;
            const status = getStatusConfig('confirmed');
            return (
              <motion.div key={service.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="flex flex-col h-full relative overflow-hidden">
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${activeCategory.color}, transparent)` }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-11 h-11 rounded-xl border flex items-center justify-center"
                      style={{ backgroundColor: `${activeCategory.color}18`, borderColor: `${activeCategory.color}33`, color: activeCategory.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border', status.bg, status.color, status.border)}>
                      {service.duration}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mt-4">{service.name}</h3>
                  <p className="text-sm text-dark-400 mt-1.5 flex-1">{service.description}</p>
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-dark-500">Price</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(service.price)}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => bookService(service)}>
                      Book <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {!activeCategory?.services.length && (
        <Card className="text-center py-10">
          <Wrench className="w-8 h-8 text-dark-600 mx-auto mb-3" />
          <p className="text-sm text-dark-400">No services available in this category yet.</p>
        </Card>
      )}
    </div>
  );

  return <PageState loading={loading} error={error} onRetry={() => setError(false)}>{content}</PageState>;
}