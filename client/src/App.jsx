import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Landing = lazy(() => import('./pages/Landing'));
const AuthLayout = lazy(() => import('./components/layouts/AuthLayout'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const CustomerLayout = lazy(() => import('./components/layouts/CustomerLayout'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));

const Dashboard = lazy(() => import('./pages/customer/Dashboard'));
const MyBikes = lazy(() => import('./pages/customer/MyBikes'));
const BikeDetail = lazy(() => import('./pages/customer/BikeDetail'));
const Services = lazy(() => import('./pages/customer/Services'));
const BookService = lazy(() => import('./pages/customer/BookService'));
const MyBookings = lazy(() => import('./pages/customer/MyBookings'));
const Payments = lazy(() => import('./pages/customer/Payments'));
const Invoices = lazy(() => import('./pages/customer/Invoices'));
const ServiceHistory = lazy(() => import('./pages/customer/ServiceHistory'));
const TrackService = lazy(() => import('./pages/customer/TrackService'));
const Reviews = lazy(() => import('./pages/customer/Reviews'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Customization = lazy(() => import('./pages/customer/Customization'));
const ThreeCustomBuilder = lazy(() => import('./pages/customer/ThreeCustomBuilder'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminJobCards = lazy(() => import('./pages/admin/AdminJobCards'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminBikes = lazy(() => import('./pages/admin/AdminBikes'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminPackages = lazy(() => import('./pages/admin/AdminPackages'));
const AdminCustomization = lazy(() => import('./pages/admin/AdminCustomization'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminInvoices = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminOffers = lazy(() => import('./pages/admin/AdminOffers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-bikes" element={<MyBikes />} />
            <Route path="/my-bikes/:id" element={<BikeDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book-service" element={<BookService />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/service-history" element={<ServiceHistory />} />
            <Route path="/track-service" element={<TrackService />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/customization" element={<Customization />} />
    <Route path="/customization/3d" element={<ThreeCustomBuilder />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/calendar" element={<AdminCalendar />} />
            <Route path="/admin/job-cards" element={<AdminJobCards />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/bikes" element={<AdminBikes />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/customization" element={<AdminCustomization />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1c1f26', color: '#f1f3f5', border: '1px solid #2d3039', borderRadius: '12px' },
          success: { iconTheme: { primary: '#f59e0b', secondary: '#14161a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#14161a' } },
        }}
      />
    </BrowserRouter>
  );
}

export default App;