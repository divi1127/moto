import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paintbrush, Sticker, Sparkles, ShieldCheck, Droplets, Bike, Wrench,
  ArrowRight, ChevronLeft, ChevronRight, Star, CheckCircle2, Phone,
  Clock, MapPin, Award, Zap, Heart, Users, MessageSquare, Quote,
  Camera, PlayCircle, Send, ChevronDown, CalendarCheck,
} from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import HeroScene3D from '../components/landing/HeroScene3D';
import BikeCustomizerUI from '../components/landing/BikeCustomizerUI';
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider';
import Button from '../components/ui/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedSection({ children, className = '', id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const services = [
  { icon: Paintbrush, title: 'Custom Paint', desc: 'Full-body custom paint jobs, matte finishes, color-shifting wraps, and artistic airbrush work tailored to your vision.', color: 'from-orange-500/20 to-red-500/20', accent: 'text-orange-400' },
  { icon: Sticker, title: 'Stickers & Decals', desc: 'Premium vinyl wraps, racing stripes, brand decals, and custom-cut graphics with precision finish.', color: 'from-cyan-500/20 to-blue-500/20', accent: 'text-cyan-400' },
  { icon: Sparkles, title: 'Detailing', desc: 'Interior and exterior deep detailing with paint correction, swirl removal, and ceramic sealant finish.', color: 'from-purple-500/20 to-pink-500/20', accent: 'text-purple-400' },
  { icon: ShieldCheck, title: 'Ceramic Coating', desc: 'Multi-layer ceramic coating with 9H hardness for scratch resistance, UV protection, and mirror finish.', color: 'from-emerald-500/20 to-teal-500/20', accent: 'text-emerald-400' },
  { icon: ShieldCheck, title: 'Paint Protection Film', desc: 'Self-healing PPF from XPEL and 3M — invisible armor against rock chips, scratches, and road debris.', color: 'from-yellow-500/20 to-amber-500/20', accent: 'text-yellow-400' },
  { icon: Droplets, title: 'Bike Wash', desc: 'Foam wash, chain cleaning, engine degreasing, and protective wax coating — quick and thorough.', color: 'from-blue-500/20 to-indigo-500/20', accent: 'text-blue-400' },
  { icon: Wrench, title: 'Accessories', desc: 'Performance exhausts, crash guards, touring seats, phone mounts, and bolt-on modifications installed.', color: 'from-rose-500/20 to-red-500/20', accent: 'text-rose-400' },
];

const packages = [
  {
    id: 'pkg-1', name: 'Essential', price: 2499, original: 3999, period: 'per service',
    desc: 'Perfect for regular maintenance and upkeep',
    features: ['Foam Wash & Dry', 'Basic Wax Coating', 'Interior Vacuum & Wipe', 'Chain Lubrication', 'Tire Dressing', 'Window Cleaning'],
    cta: 'Book Essential', popular: false,
  },
  {
    id: 'pkg-2', name: 'Premium', price: 6999, original: 11999, period: 'per service',
    desc: 'The most popular choice for serious riders',
    features: ['Everything in Essential', 'Paint Correction & Polish', '6-Month Ceramic Coating', 'Engine Bay Detailing', 'Leather Conditioning', 'Headlight Restoration', 'Free Pickup & Drop', 'Photo Documentation'],
    cta: 'Book Premium', popular: true,
  },
  {
    id: 'pkg-3', name: 'Ultimate', price: 14999, original: 24999, period: 'per service',
    desc: 'The full concierge experience for your machine',
    features: ['Everything in Premium', '12-Month Ceramic Pro Coating', 'Full Paint Protection Film', 'Custom Accent Work', 'Interior Deep Clean & Sanitise', 'Anti-Rust Underbody', 'Priority Scheduling', '30-Day Guarantee', 'Complimentary Bike Cover'],
    cta: 'Book Ultimate', popular: false,
  },
];

const steps = [
  { num: '01', title: 'Choose Your Service', desc: 'Browse our packages or pick individual services. Select what suits your bike and your budget.', icon: Bike },
  { num: '02', title: 'Schedule a Visit', desc: 'Pick a date and time. We offer free pickup and drop within 15 km of our studio.', icon: Clock },
  { num: '03', title: 'Inspection & Quote', desc: 'Our experts inspect your bike on arrival and provide a transparent, no-surprises quote.', icon: CheckCircle2 },
  { num: '04', title: 'Expert Craftsmanship', desc: 'Trained technicians work on your bike using premium products and professional-grade tools.', icon: Wrench },
  { num: '05', title: 'Quality Check & Delivery', desc: 'Multi-point quality inspection before delivery. You approve, we hand over the keys.', icon: Award },
];

const whyUs = [
  { icon: Award, title: 'Certified Experts', desc: 'Our team holds certifications from 3M, XPEL, and Ceramic Pro.' },
  { icon: ShieldCheck, title: 'Premium Products', desc: 'Only top-tier, industry-grade products touch your bike.' },
  { icon: Clock, title: 'On-Time Delivery', desc: 'We respect your time. Jobs completed within committed timelines.' },
  { icon: Zap, title: 'Quick Turnaround', desc: 'Most services completed in 4-8 hours. Express slots available.' },
  { icon: Heart, title: 'Satisfaction Guarantee', desc: 'Not happy? We redo it. No questions, no extra charges.' },
  { icon: Users, title: '2,500+ Happy Riders', desc: 'Trusted by bikers across Bangalore for 5+ years.', },
];

const reviews = [
  { name: 'Arjun Mehta', bike: 'KTM 390 Adventure', rating: 5, text: 'The ceramic coating on my KTM is insane. Water beads off like nothing. Six months in and it still looks like day one. Studio is spotless, staff are genuine bike lovers.', avatar: 'AM' },
  { name: 'Priya Nair', bike: 'Royal Enfield Himalayan', rating: 5, text: 'Got a full wrap and PPF done. The attention to detail is next level. They even sent progress photos during the job. Highly recommend for anyone who truly cares about their ride.', avatar: 'PN' },
  { name: 'Vikram Singh', bike: 'Yamaha R15 V4', rating: 5, text: 'Best detailing shop in Bangalore, hands down. My R15 came out looking showroom fresh. The paint correction alone was worth every rupee. Booking again for my Bullet.', avatar: 'VS' },
  { name: 'Nisha Reddy', bike: 'Bajaj Dominar 400', rating: 4, text: 'Solid work on the Dominar. Got the Premium package — ceramic coat, interior detail, the works. Communication could be slightly better during the process, but the end result is phenomenal.', avatar: 'NR' },
];

const galleryItems = [
  { label: 'KTM 390 — Matte Black Wrap', gradient: 'from-orange-600 via-amber-700 to-yellow-900' },
  { label: 'Royal Enfield — Army Green Custom', gradient: 'from-emerald-700 via-green-800 to-teal-950' },
  { label: 'Yamaha R15 — Racing Livery', gradient: 'from-blue-600 via-indigo-700 to-purple-900' },
  { label: 'Dominar 400 — Ceramic Pro Finish', gradient: 'from-red-600 via-rose-700 to-pink-900' },
  { label: 'Himalayan — Adventure Decals', gradient: 'from-amber-600 via-orange-700 to-red-900' },
  { label: 'Ninja 650 — Full PPF Install', gradient: 'from-cyan-600 via-teal-700 to-emerald-900' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollPhase, setScrollPhase] = useState('hero');
  const [selectedColor, setSelectedColor] = useState('#cc0000');
  const [activeStickers, setActiveStickers] = useState([]);
  const scene3DRef = useRef(null);

  // Propagate color change into Three.js scene
  function handleColorChange(hex) {
    setSelectedColor(hex);
    scene3DRef.current?.setBikeColor(hex);
  }

  // Propagate sticker change into Three.js scene
  function handleStickersChange(indices) {
    setActiveStickers(indices);
    scene3DRef.current?.showStickers(indices);
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────
          CINEMATIC 3D HERO — scroll-pinned 500vh tall container
          The inner sticky div stays at 100vh while the outer div
          creates the scroll distance for GSAP ScrollTrigger
      ───────────────────────────────────────────────────────────── */}
      <section id="cinematic-hero" style={{ height: '500vh', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          {/* Three.js canvas fills the entire viewport */}
          <HeroScene3D
            ref={scene3DRef}
            onPhaseChange={setScrollPhase}
            selectedColor={selectedColor}
            activeStickers={activeStickers}
          />

          {/* Overlay UI — phase labels, color picker, sticker picker */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <BikeCustomizerUI
              phase={scrollPhase}
              selectedColor={selectedColor}
              activeStickers={activeStickers}
              onColorChange={handleColorChange}
              onStickersChange={handleStickersChange}
            />
          </div>

          {/* Pointer-events enabler for the customizer panels */}
          <style>{`
            .customizer-panel { pointer-events: all; }
          `}</style>

          {/* ── Booking CTA overlay (preview phase) ── */}
          <AnimatePresence>
            {scrollPhase === 'preview' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45 }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
              >
                <Button size="lg" onClick={() => navigate('/register')} className="shadow-2xl shadow-amber-500/30">
                  <CalendarCheck className="w-5 h-5" />
                  Book This Customization
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fade vignette — bottom edge blends into next section */}
          <div
            className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0f1115)' }}
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TRANSITION BRIDGE — stats + scroll invitation
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-dark-950 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
              Bangalore's Premier Studio
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Where Bikes Become{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Legends
              </span>
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto leading-relaxed">
              You just customized your dream bike above. Now let us bring it to life.
              Book a service with Bangalore's most trusted motorcycle studio.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { val: '2,500+', label: 'Bikes Transformed' },
              { val: '4.9★', label: 'Google Rating' },
              { val: '5+ Yrs', label: 'Studio Experience' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-2xl border border-border bg-surface/40 backdrop-blur-sm"
              >
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {s.val}
                </p>
                <p className="text-xs text-dark-500 uppercase tracking-wider mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <AnimatedSection id="services" className="py-24 px-6 bg-dark-900/40">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">What We Do</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Premium Services</h2>
            <p className="text-dark-400 mt-4 max-w-lg mx-auto">From paint jobs to paint protection, we handle every aspect of motorcycle customization and care.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i}
                className="group relative p-8 rounded-3xl border border-border bg-surface/50 backdrop-blur-sm hover:border-amber-500/30 hover:bg-surface transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-6 h-6 ${s.accent}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{s.desc}</p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── BEFORE / AFTER ─── */}
      <AnimatedSection id="before-after" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Our Work</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">See the Transformation</h2>
            <p className="text-dark-400 mt-4 max-w-lg mx-auto">Drag the slider to reveal the difference our work makes. Real bikes, real results.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: 'Ceramic Coating — KTM 390', desc: 'After paint correction, 3-layer ceramic pro coating. Deep gloss, hydrophobic finish.' },
              { title: 'Full Wrap — Royal Enfield', desc: 'Matte olive wrap with custom tank graphics. Complete colour transformation.' },
              { title: 'Detailing + PPF — Yamaha R15', desc: 'Swirl-free finish with full front PPF. Stone chip protection, invisible layer.' },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i}>
                <BeforeAfterSlider />
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-dark-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── HOW IT WORKS ─── */}
      <AnimatedSection id="how-it-works" className="py-24 px-6 bg-dark-900/40">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">How It Works</h2>
            <p className="text-dark-400 mt-4 max-w-lg mx-auto">Five straightforward steps from booking to a showroom-fresh ride.</p>
          </motion.div>
          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {steps.map((step, i) => (
                <motion.div key={step.num} variants={fadeUp} custom={i} className="relative text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-surface border border-border group-hover:border-amber-500/40 transition-colors mx-auto mb-5 flex items-center justify-center relative z-10">
                    <step.icon className="w-8 h-8 text-amber-400" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-black text-xs font-black flex items-center justify-center">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── PACKAGES ─── */}
      <AnimatedSection id="packages" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Transparent Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Choose Your Package</h2>
            <p className="text-dark-400 mt-4 max-w-lg mx-auto">No hidden costs. Every package includes premium products and a satisfaction guarantee.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-3xl border p-10 ${
                  pkg.popular
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-surface/80 shadow-lg shadow-amber-500/10'
                    : 'border-border bg-surface/50'
                } backdrop-blur-sm`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black text-[11px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                <p className="text-sm text-dark-400 mt-1 mb-5">{pkg.desc}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">₹{pkg.price.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-dark-500">{pkg.period}</span>
                </div>
                <p className="text-xs text-dark-500 mb-6">
                  <span className="line-through">₹{pkg.original.toLocaleString('en-IN')}</span>
                  <span className="ml-2 text-emerald-400 font-semibold">{Math.round((1 - pkg.price / pkg.original) * 100)}% off</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-dark-300">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.popular ? 'text-amber-400' : 'text-dark-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  variant={pkg.popular ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => navigate('/register')}
                >
                  {pkg.cta} <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── WHY CHOOSE US ─── */}
      <AnimatedSection id="why-us" className="py-24 px-6 bg-dark-900/40">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">The Moto Custom Edge</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Why Riders Choose Us</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-5 p-8 rounded-3xl border border-border bg-surface/30 hover:border-amber-500/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── REVIEWS ─── */}
      <AnimatedSection id="reviews" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">What Riders Say</h2>
            <p className="text-dark-400 mt-4 max-w-lg mx-auto">Real reviews from real customers. No fakes, no fluff.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((r, i) => (
              <motion.div
                key={r.name}
                variants={fadeUp}
                custom={i}
                className="p-8 rounded-3xl border border-border bg-surface/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-4 h-4 ${si < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-dark-600'}`} />
                  ))}
                </div>
                <p className="text-sm text-dark-300 leading-relaxed mb-5 italic">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center text-xs font-bold text-white">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{r.name}</p>
                    <p className="text-[11px] text-dark-500">{r.bike}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── GALLERY ─── */}
      <AnimatedSection id="gallery" className="py-24 px-6 bg-dark-900/40">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Our Portfolio</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Completed Projects</h2>
            <p className="text-dark-400 mt-4 max-w-lg mx-auto">A glimpse of recent bikes we've transformed at our studio.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <svg viewBox="0 0 24 24" className="w-32 h-32" fill="none" stroke="currentColor" strokeWidth="0.5">
                    <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 19H9M9 19L9.5 20M15 19L14.5 20" />
                    <path d="M6 17L8 6M8 6h8M8 6l2.5 2M16 6V8.5M16 6l-2.5 2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">Moto Custom & Detailing</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA ─── */}
      <section id="booking" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 sm:p-16 text-center overflow-hidden border border-amber-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-dark-900 to-red-500/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                Ready to Transform Your Ride?
              </h2>
              <p className="text-dark-300 max-w-xl mx-auto mb-8 leading-relaxed">
                Book a free consultation. We'll assess your bike, recommend the right services,
                and give you a transparent quote — no obligation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" onClick={() => navigate('/register')}>
                  Book a Service <ArrowRight className="w-5 h-5" />
                </Button>
                <a href="tel:+919800000000" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" /> Call Us Now
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-dark-950 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                  <span className="text-black font-black text-sm">MC</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">MOTO CUSTOM</p>
                  <p className="text-[10px] text-dark-500 leading-none mt-1 tracking-widest uppercase">Detailing Studio</p>
                </div>
              </div>
              <p className="text-sm text-dark-400 leading-relaxed">Premium bike customization, detailing, and protection. Trusted by 2,500+ riders in Bangalore.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Services</h4>
              <ul className="space-y-2.5">
                {['Custom Paint', 'Ceramic Coating', 'Paint Protection', 'Detailing', 'Bike Wash', 'Accessories'].map(s => (
                  <li key={s}><a href="#services" className="text-sm text-dark-400 hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Our Work', 'Reviews', 'Blog', 'Careers', 'Contact'].map(s => (
                  <li key={s}><a href="#" className="text-sm text-dark-400 hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-dark-400">Koramangala, 5th Block,<br />Bangalore — 560095</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="tel:+919800000000" className="text-sm text-dark-400 hover:text-white transition-colors">+91 98000 00000</a>
                </div>
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="mailto:hello@motocustom.in" className="text-sm text-dark-400 hover:text-white transition-colors">hello@motocustom.in</a>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                {[Camera, PlayCircle].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-surface border border-border hover:border-amber-500/40 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 text-dark-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-dark-500">© 2026 Moto Custom & Detailing. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service'].map(t => (
                <a key={t} href="#" className="text-xs text-dark-500 hover:text-white transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
