import React from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Calculator, ArrowDownLeft, Archive, Settings, TrendingUp, Users, Car, Percent } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, subDays, parseISO, isToday } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IntakeRecord {
    id: number; name: string; email: string; phone: string;
    make: string; model: string; rego: string; keyNumber: string;
    dateIn: string; returnDate: string; returnFlight: string;
    total: number; timestamp: string; paymentMethod?: string; status?: string;
}
interface Customer { id: number; name: string; email: string; phone: string; type: string; balance: number; }
interface Vehicle { id: number; plate: string; make: string; model: string; owner: string; ownerId: number | null; status: string; }

const Dashboard = () => {
    const [timeRange, setTimeRange] = React.useState('This Week');
    const [intakes] = useLocalStorage<IntakeRecord[]>('cp_intakes', []);
    const [customers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [vehicles] = useLocalStorage<Vehicle[]>('cp_vehicles', []);

    const totalRevenue = intakes.reduce((s, i) => s + (i.total || 0), 0);
    const carsInYard = vehicles.filter(v => v.status === 'In Yard' || v.status === 'Checked In').length;
    const occupancyPct = vehicles.length === 0 ? 0 : Math.round((carsInYard / vehicles.length) * 100);
    const revenueToday = intakes.filter(i => { try { return isToday(parseISO(i.timestamp)); } catch { return false; } }).reduce((s, i) => s + i.total, 0);

    const buildDailyRevenue = (days: number) => {
        const labels: string[] = [], data: number[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = subDays(new Date(), i);
            labels.push(format(d, days <= 7 ? 'EEE' : 'MMM d'));
            data.push(intakes.filter(r => { try { return r.timestamp?.startsWith(format(d, 'yyyy-MM-dd')); } catch { return false; } }).reduce((s, r) => s + r.total, 0));
        }
        return { labels, data };
    };

    const days = timeRange === 'This Week' ? 7 : timeRange === 'Last Week' ? 14 : 30;
    const { labels: rawLabels, data: rawData } = buildDailyRevenue(days);

    const chartData = {
        labels: timeRange === 'Last Week' ? rawLabels.slice(0, 7) : rawLabels,
        datasets: [{
            label: 'Revenue ($)',
            data: timeRange === 'Last Week' ? rawData.slice(0, 7) : rawData,
            backgroundColor: '#6366f1',
            borderRadius: 12,
            borderSkipped: false,
            barThickness: 24,
        }, {
            label: 'Last Period',
            data: (timeRange === 'Last Week' ? rawData.slice(7) : rawData.map(() => 0)),
            backgroundColor: '#e0e7ff',
            borderRadius: 12,
            borderSkipped: false,
            barThickness: 24,
        }],
    };

    const chartOptions: any = {
        interaction: { intersect: false, mode: 'index' },
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#111827',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 13, weight: '700', family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter', weight: '500' } }
            },
            y: {
                grid: { color: '#f9fafb', drawBorder: false },
                ticks: { color: '#9ca3af', font: { size: 11, family: 'Inter' }, callback: (v: any) => `$${v}` },
                border: { display: false, dash: [4, 4] }
            },
        },
    };

    const stats = [
        { icon: TrendingUp, label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: `$${revenueToday.toFixed(2)} today`, color: 'text-brand-500', bg: 'bg-brand-50', border: 'border-brand-100' },
        { icon: Users, label: 'Customers', value: customers.length.toString(), sub: 'active members', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        { icon: Car, label: 'Cars in Yard', value: carsInYard.toString(), sub: 'real-time count', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { icon: Percent, label: 'Occupancy', value: vehicles.length === 0 ? '—' : `${occupancyPct}%`, sub: `${vehicles.length} slots total`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    ];

    return (
        <div className="relative space-y-10 pb-20">
            {/* Background Blobs */}
            <div className="blob blob-indigo w-[500px] h-[500px] -top-48 -left-24" />
            <div className="blob blob-purple w-[400px] h-[400px] top-96 -right-24" />

            <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-heading tracking-tight">Overview</h1>
                <p className="section-sub">Live monitoring · {format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 sm:gap-4 flex-wrap relative z-10">
                {[
                    { to: '/invoicing', icon: Calculator, label: 'New Intake', className: 'btn-primary' },
                    { to: '/returns', icon: ArrowDownLeft, label: 'Car Returns', className: 'btn-ghost' },
                    { to: '/long-term', icon: Archive, label: 'Long Term', className: 'btn-ghost' },
                    { to: '/settings', icon: Settings, label: 'Settings', className: 'btn-ghost' },
                ].map(({ to, icon: Icon, label, className }) => (
                    <motion.div key={to} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="flex-1 min-w-[140px] sm:flex-none">
                        <Link to={to} className={`${className} w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6`}>
                            <Icon size={16} className="sm:w-[18px]" />{label}
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                {stats.map(({ icon: Icon, label, value, sub, color, bg, border }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                        className="card p-6 sm:p-8 group overflow-hidden">
                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${bg} rounded-full opacity-40 group-hover:scale-110 transition-transform duration-500 blur-2xl`} />
                        <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl ${bg} border ${border} mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}>
                            <Icon size={24} className={color} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{label}</p>
                        <p className="text-4xl font-extrabold text-ink-heading tracking-tight">{value}</p>
                        <div className="flex items-center gap-1.5 mt-3">
                            <div className={`w-1 h-1 rounded-full ${color} animate-pulse`} />
                            <p className="text-[11px] font-medium text-gray-400">{sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-5 sm:p-8 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-ink-heading tracking-tight">Financial Pulse</h3>
                        <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-1">Revenue distribution over selected timeframe</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
                            className="select-custom text-xs font-bold w-full sm:w-40">
                            <option value="This Week">This Week</option>
                            <option value="Last Week">Last Week</option>
                            <option value="This Month">This Month</option>
                        </select>
                    </div>
                </div>
                {intakes.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-gray-100 mb-4 shadow-card">
                            <TrendingUp size={24} className="text-gray-300" />
                        </div>
                        <p className="font-bold text-ink-heading">No Transaction Flow</p>
                        <p className="text-xs text-gray-400 mt-1">Record your first intake to unlock analytics</p>
                    </div>
                ) : (
                    <div className="h-64 sm:h-80"><Bar options={chartOptions} data={chartData} /></div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
