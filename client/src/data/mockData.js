import { format, addDays, subDays } from 'date-fns';

export const bikeBrands = [
  { id: 'royal-enfield', name: 'Royal Enfield', models: ['Classic 350', 'Classic 500', 'Bullet 350', 'Bullet 500', 'Interceptor 650', 'Continental GT 650', 'Himalayan 411', 'Meteor 350', 'Scram 411', 'Super Meteor 650'] },
  { id: 'yamaha', name: 'Yamaha', models: ['MT-15', 'R15 V4', 'FZ-S', 'FZ-25', 'Apache RR 310', 'YZF R3', 'MT-03', 'XSR 155', 'Aerox 155'] },
  { id: 'ktm', name: 'KTM', models: ['Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200', 'RC 390', 'Adventure 390', 'Adventure 250'] },
  { id: 'tvs', name: 'TVS', models: ['Apache RTR 160', 'Apache RTR 200', 'Apache RTR 310', 'Ronin', 'Jupiter', 'Ntorq 125', 'iQube'] },
  { id: 'honda', name: 'Honda', models: ['CBR 250RR', 'CB 300R', 'Hornet 2.0', 'SP 125', 'Activa 6G', 'Dio', 'CB Shine', 'Unicorn', 'CB 650R'] },
  { id: 'bajaj', name: 'Bajaj', models: ['Pulsar NS125', 'Pulsar NS160', 'Pulsar NS200', 'Pulsar NS400', 'Pulsar RS200', 'Dominar 250', 'Dominar 400', 'Avenger 220', 'Chetak Electric'] },
  { id: 'suzuki', name: 'Suzuki', models: ['Gixxer SF', 'Gixxer 250', 'Access 125', 'Hayabusa', 'V-Strom 650', 'GSX-S750', 'Burgman Street'] },
];

export const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
export const engineTypes = ['Single Cylinder', 'Twin Cylinder', 'Triple Cylinder', 'Four Cylinder', 'Electric Motor'];

export const bikeColors = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Silver',
  'Grey', 'Matte Black', 'Matte Green', 'Matte Red', 'Metallic Blue',
  'Metallic Grey', 'Pearl White', 'Candy Red'
];

export const serviceCategories = [
  {
    id: 'washing',
    name: 'Bike Washing',
    description: 'Professional bike washing services to keep your ride spotless',
    icon: 'Droplets',
    color: '#3b82f6',
    services: [
      { id: 'wash-1', name: 'Basic Water Wash', description: 'Thorough water wash removing surface dirt and dust', price: 299, duration: '30 min', category: 'washing' },
      { id: 'wash-2', name: 'Foam Wash', description: 'Premium foam wash with pH-neutral shampoo for gentle deep cleaning', price: 499, duration: '45 min', category: 'washing' },
      { id: 'wash-3', name: 'Pressure Wash', description: 'High-pressure wash targeting hard-to-reach areas', price: 599, duration: '40 min', category: 'washing' },
      { id: 'wash-4', name: 'Premium Wash', description: 'Complete premium wash with foam, chain cleaning, and tire dressing', price: 899, duration: '1 hr', category: 'washing' },
      { id: 'wash-5', name: 'Full Bike Cleaning', description: 'Inside-out deep cleaning including engine bay, underseat, and all crevices', price: 1299, duration: '1.5 hrs', category: 'washing' },
    ]
  },
  {
    id: 'detailing',
    name: 'Bike Detailing',
    description: 'Professional detailing to restore your bike\'s showroom shine',
    icon: 'Sparkles',
    color: '#8b5cf6',
    services: [
      { id: 'detail-1', name: 'Complete Bike Detailing', description: 'Full exterior and interior detailing for showroom finish', price: 2999, duration: '3-4 hrs', category: 'detailing' },
      { id: 'detail-2', name: 'Engine Area Cleaning', description: 'Deep cleaning and degreasing of engine components', price: 799, duration: '1 hr', category: 'detailing' },
      { id: 'detail-3', name: 'Chain Cleaning & Lubrication', description: 'Professional chain degreasing, cleaning, and lubrication', price: 499, duration: '30 min', category: 'detailing' },
      { id: 'detail-4', name: 'Rust Removal', description: 'Chemical and mechanical rust treatment and prevention', price: 999, duration: '1-2 hrs', category: 'detailing' },
      { id: 'detail-5', name: 'Plastic Restoration', description: 'Restoring faded plastic parts to original finish', price: 699, duration: '45 min', category: 'detailing' },
      { id: 'detail-6', name: 'Chrome Polishing', description: 'High-gloss chrome polishing and protection', price: 599, duration: '45 min', category: 'detailing' },
      { id: 'detail-7', name: 'Paint Polishing', description: 'Multi-stage paint correction and polishing for mirror finish', price: 1999, duration: '2-3 hrs', category: 'detailing' },
    ]
  },
  {
    id: 'painting',
    name: 'Custom Painting',
    description: 'Premium custom paint jobs by expert painters',
    icon: 'Paintbrush',
    color: '#ef4444',
    services: [
      { id: 'paint-1', name: 'Single Color Paint', description: 'Complete single color respray with premium paint', price: 4999, duration: '2-3 days', category: 'painting' },
      { id: 'paint-2', name: 'Dual Tone Paint', description: 'Two-tone color scheme with precision masking', price: 7999, duration: '3-4 days', category: 'painting' },
      { id: 'paint-3', name: 'Metallic Finish', description: 'Premium metallic paint with deep gloss finish', price: 8999, duration: '3-4 days', category: 'painting' },
      { id: 'paint-4', name: 'Matte Finish', description: 'Smooth matte finish with protective clear coat', price: 7499, duration: '3-4 days', category: 'painting' },
      { id: 'paint-5', name: 'Pearl Finish', description: 'Luxurious pearl finish with color-shifting effect', price: 9999, duration: '4-5 days', category: 'painting' },
      { id: 'paint-6', name: 'Custom Design Paint', description: 'Fully custom paint design with artistic elements', price: 14999, duration: '5-7 days', category: 'painting' },
    ]
  },
  {
    id: 'stickers',
    name: 'Stickers & Decals',
    description: 'Premium stickers and custom decal designs',
    icon: 'Sticker',
    color: '#06b6d4',
    services: [
      { id: 'stick-1', name: 'Tank Stickers', description: 'Custom tank graphics and racing stripes', price: 599, duration: '30 min', category: 'stickers' },
      { id: 'stick-2', name: 'Body Stickers', description: 'Body panel graphics and accent stickers', price: 799, duration: '45 min', category: 'stickers' },
      { id: 'stick-3', name: 'Rim Stickers', description: 'Wheel rim accent stickers in various colors', price: 399, duration: '30 min', category: 'stickers' },
      { id: 'stick-4', name: 'Racing Decals', description: 'Full racing-style decal kit', price: 1499, duration: '1 hr', category: 'stickers' },
      { id: 'stick-5', name: 'Custom Graphics', description: 'Fully custom designed graphics with your artwork', price: 2499, duration: '1-2 hrs', category: 'stickers' },
      { id: 'stick-6', name: 'Full Bike Decal', description: 'Complete bike wrap with custom design', price: 4999, duration: '3-4 hrs', category: 'stickers' },
    ]
  },
  {
    id: 'ceramic',
    name: 'Ceramic Coating',
    description: 'Long-lasting ceramic protection for your bike\'s paint',
    icon: 'Shield',
    color: '#f59e0b',
    services: [
      { id: 'ceramic-1', name: 'Basic Ceramic (6H)', description: 'Entry-level ceramic coating with 6H hardness, 1 year warranty', price: 3999, duration: '4-5 hrs', category: 'ceramic' },
      { id: 'ceramic-2', name: 'Premium Ceramic (9H)', description: 'Professional 9H ceramic coating, 3 year warranty', price: 7999, duration: '5-6 hrs', category: 'ceramic' },
      { id: 'ceramic-3', name: 'Professional Ceramic (9H+)', description: 'Multi-layer professional ceramic, 5 year warranty', price: 12999, duration: '6-8 hrs', category: 'ceramic' },
      { id: 'ceramic-4', name: 'Graphene Ceramic', description: 'Next-gen graphene-infused ceramic coating, 5 year warranty', price: 15999, duration: '7-9 hrs', category: 'ceramic' },
    ]
  },
  {
    id: 'protection',
    name: 'Paint Protection',
    description: 'Ultimate paint and surface protection solutions',
    icon: 'ShieldCheck',
    color: '#10b981',
    services: [
      { id: 'prot-1', name: 'Paint Correction', description: 'Multi-stage paint correction removing swirl marks and scratches', price: 3499, duration: '3-4 hrs', category: 'protection' },
      { id: 'prot-2', name: 'Paint Protection Film', description: 'Clear bra PPF installation for chip and scratch protection', price: 19999, duration: '1-2 days', category: 'protection' },
      { id: 'prot-3', name: 'Partial PPF', description: 'High-impact area PPF protection (tank, fender, side panels)', price: 8999, duration: '4-5 hrs', category: 'protection' },
      { id: 'prot-4', name: 'Hydrophobic Coating', description: 'Water-repellent nano coating for easy maintenance', price: 2499, duration: '2-3 hrs', category: 'protection' },
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Premium accessories for style and protection',
    icon: 'Wrench',
    color: '#ec4899',
    services: [
      { id: 'acc-1', name: 'LED Headlight Upgrade', description: 'Premium LED headlight installation with wiring', price: 2499, duration: '1 hr', category: 'accessories' },
      { id: 'acc-2', name: 'Custom Mirrors', description: 'Aftermarket mirror installation', price: 1299, duration: '30 min', category: 'accessories' },
      { id: 'acc-3', name: 'Custom Grips', description: 'Ergonomic grip installation', price: 799, duration: '20 min', category: 'accessories' },
      { id: 'acc-4', name: 'Crash Guard', description: 'Heavy-duty crash guard installation', price: 3499, duration: '45 min', category: 'accessories' },
      { id: 'acc-5', name: 'Seat Customization', description: 'Custom seat cover with premium cushioning', price: 2999, duration: '1 hr', category: 'accessories' },
      { id: 'acc-6', name: 'Mobile Holder', description: 'Heavy-duty mobile mount installation', price: 499, duration: '15 min', category: 'accessories' },
    ]
  }
];

export const packages = [
  {
    id: 'pkg-1',
    name: 'Basic Care',
    description: 'Essential maintenance to keep your bike clean and running smooth',
    price: 1499,
    originalPrice: 1997,
    discount: 25,
    duration: '2 hrs',
    features: ['Basic Water Wash', 'Foam Wash', 'Chain Cleaning', 'Tire Dressing'],
    color: '#3b82f6',
    popular: false,
  },
  {
    id: 'pkg-2',
    name: 'Premium Care',
    description: 'Comprehensive care package for the enthusiast who demands more',
    price: 3999,
    originalPrice: 5896,
    discount: 32,
    duration: '4-5 hrs',
    features: ['Premium Wash', 'Complete Detailing', 'Chain Service', 'Paint Polishing', 'Chrome Polishing', 'Plastic Restoration'],
    color: '#f59e0b',
    popular: true,
  },
  {
    id: 'pkg-3',
    name: 'Ultimate Care',
    description: 'The complete transformation — every surface, every detail, perfected',
    price: 8999,
    originalPrice: 14496,
    discount: 38,
    duration: '1-2 days',
    features: ['Full Bike Cleaning', 'Complete Detailing', 'Paint Correction', 'Basic Ceramic Coating', 'Chain Service', 'Premium Wash', 'Rust Removal', 'Chrome Polishing'],
    color: '#ef4444',
    popular: false,
  },
];

export const paintColors = [
  { id: 'black', name: 'Jet Black', hex: '#0a0a0a', finish: 'Gloss' },
  { id: 'matte-black', name: 'Matte Black', hex: '#1a1a1a', finish: 'Matte' },
  { id: 'white', name: 'Pearl White', hex: '#f5f5f0', finish: 'Pearl' },
  { id: 'red', name: 'Racing Red', hex: '#dc2626', finish: 'Gloss' },
  { id: 'candy-red', name: 'Candy Red', hex: '#991b1b', finish: 'Metallic' },
  { id: 'blue', name: 'Deep Blue', hex: '#1e40af', finish: 'Metallic' },
  { id: 'metallic-blue', name: 'Electric Blue', hex: '#2563eb', finish: 'Metallic' },
  { id: 'green', name: 'British Racing Green', hex: '#166534', finish: 'Gloss' },
  { id: 'matte-green', name: 'Army Matte Green', hex: '#3f6212', finish: 'Matte' },
  { id: 'orange', name: 'Sunset Orange', hex: '#ea580c', finish: 'Gloss' },
  { id: 'yellow', name: 'Racing Yellow', hex: '#eab308', finish: 'Gloss' },
  { id: 'silver', name: 'Titanium Silver', hex: '#9ca3af', finish: 'Metallic' },
  { id: 'grey', name: 'Gunmetal Grey', hex: '#4b5563', finish: 'Metallic' },
];

export const finishTypes = ['Gloss', 'Matte', 'Satin', 'Metallic', 'Pearl', 'Chrome', 'Chameleon'];

export const stickerCategories = [
  { id: 'racing', name: 'Racing Stripes', designs: ['Classic Racing', 'Modern Racing', 'Minimal Racing', 'Aggressive Racing'] },
  { id: 'geometric', name: 'Geometric Patterns', designs: ['Hexagonal', 'Triangular', 'Abstract Lines', 'Digital Camo'] },
  { id: 'flames', name: 'Flame Designs', designs: ['Classic Flames', 'Blue Flames', 'Subtle Flames', 'Inferno'] },
  { id: 'tribal', name: 'Tribal Graphics', designs: ['Classic Tribal', 'Modern Tribal', 'Celtic', 'Dragon'] },
  { id: 'custom', name: 'Custom Design', designs: ['Upload Your Own'] },
];

export const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM'
];

export const bookingStatuses = [
  { id: 'pending', label: 'Pending', color: '#f59e0b', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  { id: 'confirmed', label: 'Confirmed', color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { id: 'received', label: 'Bike Received', color: '#8b5cf6', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  { id: 'inspection', label: 'Inspection', color: '#06b6d4', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  { id: 'approved', label: 'Estimate Approved', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  { id: 'in-progress', label: 'In Progress', color: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  { id: 'painting', label: 'Painting', color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400' },
  { id: 'detailing', label: 'Detailing', color: '#a855f7', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  { id: 'ceramic', label: 'Ceramic / Protection', color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  { id: 'quality-check', label: 'Quality Check', color: '#06b6d4', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  { id: 'ready', label: 'Ready for Pickup', color: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-400' },
  { id: 'completed', label: 'Completed', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  { id: 'cancelled', label: 'Cancelled', color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400' },
];

export const workflowStages = [
  'Booking Confirmed',
  'Bike Received',
  'Inspection',
  'Estimate Approved',
  'Work Assigned',
  'Customization',
  'Painting',
  'Sticker Installation',
  'Detailing',
  'Ceramic / PPF',
  'Quality Check',
  'Ready for Pickup',
  'Completed'
];

export const sampleUsers = [
  { id: 'usr-1', name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '+91 98765 43210', role: 'customer', status: 'active', avatar: null, address: '42 MG Road, Koramangala', city: 'Bangalore', createdAt: '2025-11-15' },
  { id: 'usr-2', name: 'Priya Sharma', email: 'priya.sharma@outlook.com', phone: '+91 87654 32109', role: 'customer', status: 'active', avatar: null, address: '15 Park Street, Ballygunge', city: 'Kolkata', createdAt: '2025-12-03' },
  { id: 'usr-3', name: 'Rahul Verma', email: 'rahul.v@yahoo.com', phone: '+91 76543 21098', role: 'customer', status: 'active', avatar: null, address: '8 Civil Lines, Jaipur', city: 'Jaipur', createdAt: '2026-01-10' },
  { id: 'usr-4', name: 'Vikram Singh', email: 'vikram.s@gmail.com', phone: '+91 65432 10987', role: 'customer', status: 'active', avatar: null, address: '23 Connaught Place', city: 'Delhi', createdAt: '2026-01-22' },
  { id: 'usr-5', name: 'Neha Patel', email: 'neha.p@rediffmail.com', phone: '+91 54321 09876', role: 'customer', status: 'active', avatar: null, address: '67 SG Highway, Ahmedabad', city: 'Ahmedabad', createdAt: '2026-02-05' },
  { id: 'usr-6', name: 'Karan Malhotra', email: 'karan.m@gmail.com', phone: '+91 43210 98765', role: 'customer', status: 'inactive', avatar: null, address: '31 Jubilee Hills, Hyderabad', city: 'Hyderabad', createdAt: '2026-02-14' },
  { id: 'usr-7', name: 'Admin User', email: 'admin@motoCustom.in', phone: '+91 90000 00001', role: 'admin', status: 'active', avatar: null, address: 'Moto Custom Studio', city: 'Bangalore', createdAt: '2025-10-01' },
  { id: 'usr-8', name: 'Manager Rahul', email: 'manager@motoCustom.in', phone: '+91 90000 00002', role: 'manager', status: 'active', avatar: null, address: 'Moto Custom Studio', city: 'Bangalore', createdAt: '2025-10-01' },
  { id: 'usr-9', name: 'Staff Ajay', email: 'ajay@motoCustom.in', phone: '+91 90000 00003', role: 'staff', status: 'active', avatar: null, address: 'Moto Custom Studio', city: 'Bangalore', createdAt: '2025-10-15', specialization: 'Painter' },
  { id: 'usr-10', name: 'Staff Deepak', email: 'deepak@motoCustom.in', phone: '+91 90000 00004', role: 'staff', status: 'active', avatar: null, address: 'Moto Custom Studio', city: 'Bangalore', createdAt: '2025-11-01', specialization: 'Detailer' },
  { id: 'usr-11', name: 'Staff Ramesh', email: 'ramesh@motoCustom.in', phone: '+91 90000 00005', role: 'staff', status: 'active', avatar: null, address: 'Moto Custom Studio', city: 'Bangalore', createdAt: '2025-11-15', specialization: 'Ceramic Specialist' },
  { id: 'usr-12', name: 'Staff Suresh', email: 'suresh@motoCustom.in', phone: '+91 90000 00006', role: 'staff', status: 'active', avatar: null, address: 'Moto Custom Studio', city: 'Bangalore', createdAt: '2025-12-01', specialization: 'Sticker Designer' },
];

export const sampleBikes = [
  { id: 'bike-1', userId: 'usr-1', brand: 'Royal Enfield', model: 'Classic 350', variant: 'Halcyon Green', registrationNumber: 'KA 01 AB 1234', year: 2023, color: 'Green', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '12500', insuranceValidTill: '2027-03-15', notes: 'Primary daily commuter' },
  { id: 'bike-2', userId: 'usr-1', brand: 'KTM', model: 'Duke 390', variant: 'Standard', registrationNumber: 'KA 02 CD 5678', year: 2024, color: 'Orange', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '5200', insuranceValidTill: '2027-06-20', notes: 'Weekend ride' },
  { id: 'bike-3', userId: 'usr-2', brand: 'Yamaha', model: 'R15 V4', variant: 'M', registrationNumber: 'WB 03 EF 9012', year: 2024, color: 'Blue', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '8300', insuranceValidTill: '2027-04-10', notes: 'Track bike, needs racing decals' },
  { id: 'bike-4', userId: 'usr-3', brand: 'Royal Enfield', model: 'Interceptor 650', variant: 'Baker Express', registrationNumber: 'RJ 04 GH 3456', year: 2023, color: 'White', fuelType: 'Petrol', engineType: 'Twin Cylinder', mileage: '15600', insuranceValidTill: '2027-02-28', notes: 'Want custom matte black paint' },
  { id: 'bike-5', userId: 'usr-4', brand: 'Bajaj', model: 'Dominar 400', variant: 'Standard', registrationNumber: 'DL 05 IJ 7890', year: 2022, color: 'Black', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '22100', insuranceValidTill: '2026-12-15', notes: 'Full detailing needed' },
  { id: 'bike-6', userId: 'usr-5', brand: 'Honda', model: 'CB 300R', variant: 'Standard', registrationNumber: 'GJ 06 KL 1234', year: 2024, color: 'Red', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '6700', insuranceValidTill: '2027-05-01', notes: 'Ceramic coating required' },
  { id: 'bike-7', userId: 'usr-6', brand: 'TVS', model: 'Apache RTR 310', variant: 'Standard', registrationNumber: 'TS 07 MN 5678', year: 2024, color: 'Grey', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '4100', insuranceValidTill: '2027-07-10', notes: '' },
  { id: 'bike-8', userId: 'usr-2', brand: 'Suzuki', model: 'Gixxer 250', variant: 'Standard', registrationNumber: 'WB 08 OP 9012', year: 2023, color: 'Blue', fuelType: 'Petrol', engineType: 'Single Cylinder', mileage: '11200', insuranceValidTill: '2027-01-20', notes: 'PPF installation required' },
];

export const sampleBookings = [
  {
    id: 'bk-1', bookingNumber: 'MCD-2026-000124', userId: 'usr-1', bikeId: 'bike-1',
    services: ['Premium Wash', 'Chain Cleaning & Lubrication', 'Paint Polishing'],
    package: null, date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), timeSlot: '10:00 AM',
    status: 'confirmed', subtotal: 3397, discount: 0, tax: 611, total: 4008, advance: 1000, balance: 3008,
    notes: 'Tank has minor scratches, please be careful', pickupDrop: true,
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'bk-2', bookingNumber: 'MCD-2026-000125', userId: 'usr-2', bikeId: 'bike-3',
    services: ['Racing Decals', 'Foam Wash'],
    package: null, date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), timeSlot: '02:00 PM',
    status: 'pending', subtotal: 1998, discount: 199, tax: 324, total: 2123, advance: 500, balance: 1623,
    notes: 'Racing stripe design attached', pickupDrop: false,
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'bk-3', bookingNumber: 'MCD-2026-000126', userId: 'usr-3', bikeId: 'bike-4',
    services: ['Single Color Paint', 'Complete Bike Detailing', 'Basic Ceramic (6H)'],
    package: 'pkg-2', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), timeSlot: '09:00 AM',
    status: 'in-progress', subtotal: 11997, discount: 1200, tax: 1944, total: 12741, advance: 5000, balance: 7741,
    notes: 'Matte black paint, keep the chrome parts', pickupDrop: true,
    createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
  },
  {
    id: 'bk-4', bookingNumber: 'MCD-2026-000127', userId: 'usr-4', bikeId: 'bike-5',
    services: ['Complete Bike Detailing', 'Paint Correction', 'Premium Ceramic (9H)'],
    package: null, date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), timeSlot: '11:00 AM',
    status: 'completed', subtotal: 14497, discount: 1500, tax: 2340, total: 15337, advance: 8000, balance: 0,
    notes: 'Full restoration, bike is in rough shape', pickupDrop: true,
    createdAt: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
  },
  {
    id: 'bk-5', bookingNumber: 'MCD-2026-000128', userId: 'usr-5', bikeId: 'bike-6',
    services: ['Graphene Ceramic', 'Hydrophobic Coating', 'Premium Wash'],
    package: null, date: format(addDays(new Date(), 5), 'yyyy-MM-dd'), timeSlot: '03:00 PM',
    status: 'confirmed', subtotal: 18797, discount: 2000, tax: 3023, total: 19820, advance: 5000, balance: 14820,
    notes: 'New bike, want best protection', pickupDrop: true,
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
  },
  {
    id: 'bk-6', bookingNumber: 'MCD-2026-000129', userId: 'usr-1', bikeId: 'bike-2',
    services: ['Custom Design Paint', 'Full Bike Decal', 'LED Headlight Upgrade'],
    package: null, date: format(addDays(new Date(), 10), 'yyyy-MM-dd'), timeSlot: '10:30 AM',
    status: 'pending', subtotal: 22497, discount: 2500, tax: 3600, total: 23597, advance: 0, balance: 23597,
    notes: 'Want a tribute to my favorite MotoGP rider', pickupDrop: true,
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: 'bk-7', bookingNumber: 'MCD-2026-000130', userId: 'usr-3', bikeId: 'bike-4',
    services: ['Basic Water Wash'],
    package: null, date: format(subDays(new Date(), 20), 'yyyy-MM-dd'), timeSlot: '04:00 PM',
    status: 'completed', subtotal: 299, discount: 0, tax: 54, total: 353, advance: 353, balance: 0,
    notes: '', pickupDrop: false,
    createdAt: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
  },
];

export const sampleJobCards = [
  {
    id: 'jc-1', bookingId: 'bk-3', assignedStaff: ['usr-9', 'usr-10'],
    inspectionNotes: 'Minor dents on left side panel. Existing paint has swirl marks. Chain needs replacement.',
    workNotes: 'Started with sanding. Matte black base coat applied. Waiting for cure time.',
    status: 'in-progress', estimatedCost: 12741, actualCost: null,
    inspectionDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    stageIndex: 5,
  },
  {
    id: 'jc-2', bookingId: 'bk-4', assignedStaff: ['usr-10', 'usr-11'],
    inspectionNotes: 'Heavy swirl marks, water spots on tank. Ceramic was never applied.',
    workNotes: 'Paint correction completed. 3-layer ceramic applied. Final inspection done.',
    status: 'completed', estimatedCost: 15337, actualCost: 15337,
    inspectionDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    stageIndex: 12,
  },
];

export const samplePayments = [
  { id: 'pay-1', bookingId: 'bk-1', amount: 1000, method: 'UPI', transactionId: 'TXN-UPI-20260901', status: 'completed', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { id: 'pay-2', bookingId: 'bk-2', amount: 500, method: 'Cash', transactionId: 'CASH-001', status: 'completed', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { id: 'pay-3', bookingId: 'bk-3', amount: 5000, method: 'UPI', transactionId: 'TXN-UPI-20260826', status: 'completed', date: format(subDays(new Date(), 10), 'yyyy-MM-dd') },
  { id: 'pay-4', bookingId: 'bk-4', amount: 8000, method: 'Card', transactionId: 'TXN-CARD-20260821', status: 'completed', date: format(subDays(new Date(), 15), 'yyyy-MM-dd') },
  { id: 'pay-5', bookingId: 'bk-4', amount: 7337, method: 'UPI', transactionId: 'TXN-UPI-20260901', status: 'completed', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { id: 'pay-6', bookingId: 'bk-5', amount: 5000, method: 'UPI', transactionId: 'TXN-UPI-20260829', status: 'completed', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { id: 'pay-7', bookingId: 'bk-7', amount: 353, method: 'Cash', transactionId: 'CASH-002', status: 'completed', date: format(subDays(new Date(), 20), 'yyyy-MM-dd') },
];

export const sampleReviews = [
  { id: 'rev-1', userId: 'usr-4', bookingId: 'bk-4', rating: 5, comment: 'Amazing work! My Dominar looks brand new. The ceramic coating is incredible. Highly recommend Moto Custom!', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), status: 'approved' },
  { id: 'rev-2', userId: 'usr-3', bookingId: 'bk-7', rating: 4, comment: 'Good basic wash. Quick and affordable. Will come back for detailing.', date: format(subDays(new Date(), 18), 'yyyy-MM-dd'), status: 'approved' },
];

export const sampleInventory = [
  { id: 'inv-1', name: '3M Ceramic Coating 9H', category: 'Ceramic Products', quantity: 15, unit: 'bottles', minimumStock: 5, price: 2800, supplier: '3M India' },
  { id: 'inv-2', name: 'Meguiar\'s Gold Class Shampoo', category: 'Cleaning Products', quantity: 25, unit: 'liters', minimumStock: 10, price: 850, supplier: 'Meguiar\'s India' },
  { id: 'inv-3', name: '3M Paint Protection Film', category: 'PPF', quantity: 8, unit: 'rolls', minimumStock: 3, price: 12000, supplier: '3M India' },
  { id: 'inv-4', name: 'Motul Chain Lube', category: 'Chain Products', quantity: 30, unit: 'cans', minimumStock: 10, price: 350, supplier: 'Motul India' },
  { id: 'inv-5', name: 'Dupont Automotive Paint - Black', category: 'Paint', quantity: 5, unit: 'liters', minimumStock: 3, price: 3500, supplier: 'Dupont India' },
  { id: 'inv-6', name: 'Dupont Automotive Paint - Red', category: 'Paint', quantity: 3, unit: 'liters', minimumStock: 3, price: 3500, supplier: 'Dupont India' },
  { id: 'inv-7', name: 'Grafix Vinyl Wrap - Matte Black', category: 'Stickers & Vinyl', quantity: 12, unit: 'rolls', minimumStock: 5, price: 1800, supplier: 'Grafix India' },
  { id: 'inv-8', name: 'Mothers Mag Polish', category: 'Polish', quantity: 20, unit: 'bottles', minimumStock: 8, price: 650, supplier: 'Mothers Inc' },
  { id: 'inv-9', name: 'Graphene Coating Pro', category: 'Ceramic Products', quantity: 2, unit: 'kits', minimumStock: 3, price: 5500, supplier: 'Gyeon India' },
  { id: 'inv-10', name: 'LED Headlight Kit - H4', category: 'Accessories', quantity: 6, unit: 'pieces', minimumStock: 3, price: 1800, supplier: 'Philips India' },
];

export const sampleCoupons = [
  { id: 'coup-1', code: 'FIRST20', type: 'percentage', value: 20, minimumAmount: 1000, expiryDate: '2026-12-31', usageLimit: 100, usedCount: 23, status: 'active' },
  { id: 'coup-2', code: 'FESTIVE500', type: 'fixed', value: 500, minimumAmount: 3000, expiryDate: '2026-10-31', usageLimit: 50, usedCount: 12, status: 'active' },
  { id: 'coup-3', code: 'CERAMIC15', type: 'percentage', value: 15, minimumAmount: 5000, expiryDate: '2026-11-30', usageLimit: 30, usedCount: 8, status: 'active' },
  { id: 'coup-4', code: 'WELCOME10', type: 'percentage', value: 10, minimumAmount: 500, expiryDate: '2026-12-31', usageLimit: 200, usedCount: 67, status: 'active' },
];

export const monthlyRevenue = [
  { month: 'Apr', revenue: 185000, bookings: 28 },
  { month: 'May', revenue: 220000, bookings: 35 },
  { month: 'Jun', revenue: 195000, bookings: 30 },
  { month: 'Jul', revenue: 260000, bookings: 42 },
  { month: 'Aug', revenue: 310000, bookings: 48 },
  { month: 'Sep', revenue: 275000, bookings: 38 },
];

export const serviceDistribution = [
  { name: 'Washing', value: 35, color: '#3b82f6' },
  { name: 'Detailing', value: 25, color: '#8b5cf6' },
  { name: 'Painting', value: 15, color: '#ef4444' },
  { name: 'Ceramic', value: 12, color: '#f59e0b' },
  { name: 'Stickers', value: 8, color: '#06b6d4' },
  { name: 'Protection', value: 5, color: '#10b981' },
];

export const sampleNotifications = [
  { id: 'not-1', type: 'booking', title: 'Booking Confirmed', message: 'Your booking MCD-2026-000124 for Royal Enfield Classic 350 is confirmed.', date: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm'), read: false, icon: 'CalendarCheck' },
  { id: 'not-2', type: 'service', title: 'Bike Received', message: 'Your KTM Duke 390 has been received at the studio.', date: format(subDays(new Date(), 5), 'yyyy-MM-dd HH:mm'), read: false, icon: 'Wrench' },
  { id: 'not-3', type: 'payment', title: 'Payment Received', message: 'Advance payment of ₹5,000 received for booking MCD-2026-000126.', date: format(subDays(new Date(), 10), 'yyyy-MM-dd HH:mm'), read: false, icon: 'Wallet' },
  { id: 'not-4', type: 'service', title: 'Work Started', message: 'Customization work has started on your Royal Enfield Interceptor 650.', date: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm'), read: true, icon: 'Paintbrush' },
  { id: 'not-5', type: 'reminder', title: 'Appointment Reminder', message: 'Your appointment is tomorrow at 10:00 AM. See you soon!', date: format(subDays(new Date(), 0), 'yyyy-MM-dd HH:mm'), read: false, icon: 'Clock' },
  { id: 'not-6', type: 'invoice', title: 'Invoice Generated', message: 'Invoice for MCD-2026-000127 is ready. Balance due: ₹0.', date: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm'), read: true, icon: 'FileText' },
];

export const beforeAfterShots = [
  {
    id: 'shot-1', bookingId: 'bk-4', bikeName: 'Bajaj Dominar 400',
    before: { front: 'BF1', rear: 'BR1', left: 'BL1', right: 'BRt1', close: 'BC1' },
    after: { front: 'AF1', rear: 'AR1', left: 'AL1', right: 'ARt1', close: 'AC1' },
    services: ['Ceramic Coating', 'Paint Correction'],
    caption: 'Full paint correction + 9H ceramic coating',
  },
  {
    id: 'shot-2', bookingId: 'bk-3', bikeName: 'Royal Enfield Interceptor 650',
    before: { front: 'BF2', rear: 'BR2', left: 'BL2', right: 'BRt2', close: 'BC2' },
    after: { front: 'AF2', rear: 'AR2', left: 'AL2', right: 'ARt2', close: 'AC2' },
    services: ['Matte Black Paint', 'Custom Detailing'],
    caption: 'Full matte black respray transformation',
  },
];

export const workshopStages = [
  { stage: 'Booking', status: 'done' },
  { stage: 'Received', status: 'done' },
  { stage: 'Inspection', status: 'done' },
  { stage: 'Assigned', status: 'done' },
  { stage: 'Customization', status: 'done' },
  { stage: 'Painting', status: 'done' },
  { stage: 'Detailing', status: 'active' },
  { stage: 'Protection', status: 'pending' },
  { stage: 'Quality Check', status: 'pending' },
  { stage: 'Ready', status: 'pending' },
  { stage: 'Completed', status: 'pending' },
];

export const staffSkills = ['Painting', 'Detailing', 'Ceramic Coating', 'Sticker Design', 'PPF Installation', 'Electrical', 'Chain Service', 'Polishing'];

export const popularServices = [
  { name: 'Premium Wash', bookings: 124, revenue: 111486, trend: '+18%' },
  { name: 'Complete Detailing', bookings: 98, revenue: 293902, trend: '+12%' },
  { name: 'Ceramic Coating (9H)', bookings: 64, revenue: 511936, trend: '+27%' },
  { name: 'Paint Polishing', bookings: 57, revenue: 113943, trend: '+9%' },
  { name: 'Custom Paint', bookings: 23, revenue: 184477, trend: '+15%' },
];
