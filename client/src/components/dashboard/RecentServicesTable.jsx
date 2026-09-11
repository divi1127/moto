import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatDate } from '../../pages/customer/customerShared';
import { formatCurrency } from '../../utils/helpers';

export default function RecentServicesTable({ rows, bikeMap }) {
  const navigate = useNavigate();

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-dark-400">No services yet.</p>
        <p className="text-sm text-dark-500 mt-1">Your completed and upcoming services will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-light/40">
              {['Booking', 'Bike', 'Services', 'Amount', 'Status'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-dark-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate('/my-bookings')}
                className="border-b border-border/50 last:border-b-0 hover:bg-surface-light/50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-4 align-top">
                  <p className="font-medium text-white">{row.bookingNumber}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{formatDate(row.date)}</p>
                </td>
                <td className="px-5 py-4 align-top text-white/80">
                  {bikeMap?.[row.bikeId]
                    ? `${bikeMap[row.bikeId].brand} ${bikeMap[row.bikeId].model}`
                    : <span className="text-dark-600">—</span>}
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {(row.services || []).slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-2 py-1 rounded-md bg-surface-lighter text-dark-200 border border-border whitespace-nowrap">
                        {s}
                      </span>
                    ))}
                    {(row.services || []).length > 3 && (
                      <span className="text-xs text-dark-500">+{(row.services || []).length - 3} more</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 align-top font-medium text-white whitespace-nowrap">{formatCurrency(row.total)}</td>
                <td className="px-5 py-4 align-top"><StatusBadge status={row.status} size="sm" /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-border/50">
        {rows.map((row, i) => (
          <motion.button
            key={row.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate('/my-bookings')}
            className="w-full text-left px-5 py-4 hover:bg-surface-light/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{row.bookingNumber}</p>
                <p className="text-xs text-dark-500 mt-0.5">{formatDate(row.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-white whitespace-nowrap">{formatCurrency(row.total)}</span>
                <StatusBadge status={row.status} size="sm" />
              </div>
            </div>
            <p className="mt-2 text-xs text-dark-400 flex items-center justify-between gap-2">
              <span className="truncate">{(row.services || []).join(', ')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-dark-600 flex-shrink-0" />
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}