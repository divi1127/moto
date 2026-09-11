import { create } from 'zustand';
import { sampleUsers, sampleBikes, sampleBookings, sampleJobCards, samplePayments, sampleReviews, sampleInventory, sampleCoupons, serviceCategories, packages, sampleNotifications } from '../data/mockData';

const useStore = create((set, get) => ({
  user: null,
  users: sampleUsers,
  bikes: sampleBikes,
  bookings: sampleBookings,
  jobCards: sampleJobCards,
  payments: samplePayments,
  reviews: sampleReviews,
  inventory: sampleInventory,
  coupons: sampleCoupons,
  serviceCategories: serviceCategories,
  packages: packages,
  customizations: [],
  notifications: sampleNotifications,
  sidebarOpen: true,
  searchQuery: '',

  login: (email, password) => {
    const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      set({ user });
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  logout: () => set({ user: null }),

  updateProfile: (data) => set(state => ({
    user: state.user ? { ...state.user, ...data } : state.user,
    users: state.users.map(u => u.id === state.user?.id ? { ...u, ...data } : u),
  })),

  register: (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      ...userData,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    set(state => ({ users: [...state.users, newUser], user: newUser }));
    return newUser;
  },

  addBike: (bikeData) => {
    const newBike = { id: `bike-${Date.now()}`, ...bikeData };
    set(state => ({ bikes: [...state.bikes, newBike] }));
    return newBike;
  },

  updateBike: (id, data) => {
    set(state => ({
      bikes: state.bikes.map(b => b.id === id ? { ...b, ...data } : b)
    }));
  },

  deleteBike: (id) => {
    set(state => ({ bikes: state.bikes.filter(b => b.id !== id) }));
  },

  createBooking: (bookingData) => {
    const bookings = get().bookings;
    const num = String(bookings.length + 124).padStart(6, '0');
    const newBooking = {
      id: `bk-${Date.now()}`,
      bookingNumber: `MCD-2026-${num}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      ...bookingData,
    };
    set(state => ({ bookings: [...state.bookings, newBooking] }));
    return newBooking;
  },

  updateBooking: (id, data) => {
    set(state => ({
      bookings: state.bookings.map(b => b.id === id ? { ...b, ...data } : b)
    }));
  },

  cancelBooking: (id) => {
    set(state => ({
      bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
    }));
  },

  updateJobCard: (id, data) => {
    set(state => ({
      jobCards: state.jobCards.map(j => j.id === id ? { ...j, ...data } : j)
    }));
  },

  addPayment: (paymentData) => {
    const newPayment = { id: `pay-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...paymentData };
    set(state => ({ payments: [...state.payments, newPayment] }));
    return newPayment;
  },

  addReview: (reviewData) => {
    const newReview = { id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'pending', ...reviewData };
    set(state => ({ reviews: [...state.reviews, newReview] }));
    return newReview;
  },

  addCustomizationRequest: (requestData) => {
    const newRequest = {
      id: `cust-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...requestData,
    };
    set(state => ({ customizations: [newRequest, ...state.customizations] }));
    return newRequest;
  },

  updateCustomization: (id, data) => {
    set(state => ({
      customizations: state.customizations.map(c => c.id === id ? { ...c, ...data } : c)
    }));
  },

  addInventoryItem: (itemData) => {
    const newItem = { id: `inv-${Date.now()}`, ...itemData };
    set(state => ({ inventory: [...state.inventory, newItem] }));
    return newItem;
  },

  updateInventoryItem: (id, data) => {
    set(state => ({
      inventory: state.inventory.map(i => i.id === id ? { ...i, ...data } : i)
    }));
  },

  addCoupon: (couponData) => {
    const newCoupon = { id: `coup-${Date.now()}`, usedCount: 0, ...couponData };
    set(state => ({ coupons: [...state.coupons, newCoupon] }));
    return newCoupon;
  },

  setPackages: (pkgs) => set({ packages: pkgs }),

  addPackage: (pkgData) => {
    const newPkg = { id: `pkg-${Date.now()}`, ...pkgData };
    set(state => ({ packages: [...state.packages, newPkg] }));
    return newPkg;
  },

  updatePackage: (id, data) => {
    set(state => ({
      packages: state.packages.map(p => p.id === id ? { ...p, ...data } : p)
    }));
  },

  deletePackage: (id) => {
    set(state => ({ packages: state.packages.filter(p => p.id !== id) }));
  },

  setServiceCategories: (cats) => set({ serviceCategories: cats }),

  addService: (catId, svcData) => {
    set(state => ({
      serviceCategories: state.serviceCategories.map(c =>
        c.id === catId ? { ...c, services: [...(c.services || []), { id: `svc-${Date.now()}`, category: catId, ...svcData }] } : c
      )
    }));
  },

  updateService: (svcId, catId, data) => {
    set(state => ({
      serviceCategories: state.serviceCategories.map(c =>
        c.id === catId ? { ...c, services: (c.services || []).map(s => s.id === svcId ? { ...s, ...data, category: catId } : s) } : c
      )
    }));
  },

  addStaff: (staffData) => {
    const newStaff = {
      id: `usr-${Date.now()}`,
      role: 'staff',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      ...staffData,
    };
    set(state => ({ users: [...state.users, newStaff] }));
    return newStaff;
  },

  updateUser: (id, data) => {
    set(state => ({
      users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
    }));
  },

  deleteUser: (id) => {
    set(state => ({ users: state.users.filter(u => u.id !== id) }));
  },

  updateCoupon: (id, data) => {
    set(state => ({
      coupons: state.coupons.map(c => c.id === id ? { ...c, ...data } : c)
    }));
  },

  updateReview: (id, data) => {
    set(state => ({
      reviews: state.reviews.map(r => r.id === id ? { ...r, ...data } : r)
    }));
  },

  addNotification: (notification) => {
    const newNotification = { id: `notif-${Date.now()}`, read: false, date: new Date().toISOString(), ...notification };
    set(state => ({ notifications: [newNotification, ...state.notifications] }));
  },

  markNotificationsRead: () => {
    set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
  },

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getCustomerBookings: (userId) => get().bookings.filter(b => b.userId === userId),
  getCustomerBikes: (userId) => get().bikes.filter(b => b.userId === userId),
  getBikeBookings: (bikeId) => get().bookings.filter(b => b.bikeId === bikeId),
  getBookingPayments: (bookingId) => get().payments.filter(p => p.bookingId === bookingId),
  getUserById: (id) => get().users.find(u => u.id === id),
  getBikeById: (id) => get().bikes.find(b => b.id === id),
  getBookingById: (id) => get().bookings.find(b => b.id === id),
}));

export default useStore;
