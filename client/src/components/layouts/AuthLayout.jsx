import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-950 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-dark-950 to-red-500/20" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-red-500 flex items-center justify-center mx-auto mb-8">
              <span className="text-black font-black text-2xl">MC</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">MOTO CUSTOM</h1>
            <p className="text-primary-400 font-medium text-lg">PREMIUM DETAILING STUDIO</p>
            <p className="text-dark-400 mt-4 max-w-sm mx-auto">
              Customize. Protect. Detail. Ride.
            </p>
          </motion.div>
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            {[
              { num: '2,500+', label: 'Bikes Serviced' },
              { num: '98%', label: 'Happy Customers' },
              { num: '4.9', label: 'Average Rating' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <p className="text-2xl font-bold text-white">{stat.num}</p>
                <p className="text-xs text-dark-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors group"
          >
            <span className="w-7 h-7 rounded-lg border border-border bg-surface flex items-center justify-center group-hover:border-primary-500/40 group-hover:bg-primary-500/10 transition-all">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            Back to Home
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
