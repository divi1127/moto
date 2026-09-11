import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn, formatCurrency } from '../../utils/helpers';
import useStore from '../../store/useStore';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-blue-400',
  'in-progress': 'bg-orange-400',
  completed: 'bg-emerald-400',
  cancelled: 'bg-red-400',
  received: 'bg-purple-400',
  painting: 'bg-red-400',
  detailing: 'bg-purple-400',
  ceramic: 'bg-amber-400',
  'quality-check': 'bg-cyan-400',
  ready: 'bg-green-400',
  inspection: 'bg-cyan-400',
  approved: 'bg-emerald-400',
};

export default function AdminCalendar() {
  const { bookings, users, bikes } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    const days = [];
    let day = calStart;
    const calEndDate = calEnd;
    while (day <= calEndDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  }, [calStart, calEnd]);

  const getBookingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => b.date === dateStr);
  };

  const selectedDayBookings = getBookingsForDate(selectedDate);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weekViewDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-dark-400 mt-1">View and manage scheduled bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-light rounded-xl p-1">
            <button onClick={() => setView('month')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer', view === 'month' ? 'bg-primary-500 text-black' : 'text-dark-400 hover:text-white')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('week')} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer', view === 'week' ? 'bg-primary-500 text-black' : 'text-dark-400 hover:text-white')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-surface-lighter rounded-xl transition-colors cursor-pointer">
                <ChevronLeft className="w-5 h-5 text-dark-400" />
              </button>
              <h2 className="text-lg font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-surface-lighter rounded-xl transition-colors cursor-pointer">
                <ChevronRight className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {view === 'month' ? (
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-dark-400 py-2">{day}</div>
                ))}
                {calendarDays.map((day, i) => {
                  const dayBookings = getBookingsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'relative min-h-[80px] p-2 rounded-xl border text-left transition-all cursor-pointer',
                        isCurrentMonth ? 'border-border/50 hover:border-primary-500/30' : 'border-transparent opacity-30',
                        isSelected && 'border-primary-500 bg-primary-500/5',
                        isToday && !isSelected && 'border-primary-500/30'
                      )}
                    >
                      <span className={cn(
                        'text-sm font-medium',
                        isToday ? 'text-primary-400' : isCurrentMonth ? 'text-white' : 'text-dark-500'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayBookings.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayBookings.slice(0, 3).map((b, j) => (
                            <span key={j} className={cn('w-2 h-2 rounded-full', statusColors[b.status] || 'bg-dark-500')} />
                          ))}
                          {dayBookings.length > 3 && (
                            <span className="text-[10px] text-dark-400">+{dayBookings.length - 3}</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {weekViewDays.map((day) => {
                  const dayBookings = getBookingsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <motion.button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left cursor-pointer',
                        isSelected ? 'border-primary-500 bg-primary-500/5' : 'border-border/50 hover:border-primary-500/30'
                      )}
                    >
                      <div className={cn('text-center min-w-[50px]', isToday && 'text-primary-400')}>
                        <p className="text-xs text-dark-400">{format(day, 'EEE')}</p>
                        <p className="text-lg font-bold">{format(day, 'd')}</p>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {dayBookings.length === 0 ? (
                          <span className="text-sm text-dark-500">No bookings</span>
                        ) : (
                          dayBookings.map((b) => {
                            const user = users.find(u => u.id === b.userId);
                            return (
                              <div key={b.id} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-light border border-border/50">
                                <span className={cn('w-2 h-2 rounded-full', statusColors[b.status] || 'bg-dark-500')} />
                                <span className="text-xs text-white">{user?.name}</span>
                                <span className="text-xs text-dark-400">{b.timeSlot}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <span className="text-xs text-dark-400">{dayBookings.length} bookings</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">{format(selectedDate, 'EEEE, MMM d')}</h3>
            </div>

            {selectedDayBookings.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                <p className="text-sm text-dark-400">No bookings for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayBookings.map((booking) => {
                  const user = users.find(u => u.id === booking.userId);
                  const bike = bikes.find(b => b.id === booking.bikeId);
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-xl bg-surface-light border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-primary-400">{booking.timeSlot}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm font-medium text-white">{user?.name || 'Unknown'}</p>
                      <p className="text-xs text-dark-400">{bike ? `${bike.brand} ${bike.model}` : 'Unknown bike'}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {booking.services?.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">{s}</span>
                        ))}
                        {booking.services?.length > 2 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-dark-300">+{booking.services.length - 2}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                        <span className="text-xs text-dark-400">{formatCurrency(booking.total)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
