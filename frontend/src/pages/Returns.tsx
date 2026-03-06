import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, CarFront, UserCheck, ShieldAlert, PlusCircle, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerPicker from '../components/CustomerPicker';
import VehiclePicker from '../components/VehiclePicker';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Customer { id: number; name: string; phone: string; email: string; type: string; balance: number; }
interface Vehicle { id: number; plate: string; make: string; model: string; owner: string; ownerId: number | null; status: string; }
interface ReturnEntry { id: string; customerId: number | null; name: string; rego: string; flight: string; key: string; status: string; doNotMove: boolean; staff: string; date: string; }

const defaultForm = { customerId: null as number | null, vehicleId: null as number | null, name: '', rego: '', flight: '', key: '', status: 'Car In Yard', doNotMove: false, staff: '', date: 'Today' };

const statusStyle: Record<string, string> = { 'Car In Yard': 'badge badge-indigo', 'Ready at Front': 'badge badge-green', 'Departed': 'badge badge-gray' };

const Returns = () => {
    const [customers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [vehicles] = useLocalStorage<Vehicle[]>('cp_vehicles', []);
    const [returns, setReturns] = useLocalStorage<ReturnEntry[]>('cp_returns', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [dayFilter, setDayFilter] = useState('Today');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ReturnEntry | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [selCustomer, setSelCustomer] = useState<Customer | null>(null);
    const [selVehicle, setSelVehicle] = useState<Vehicle | null>(null);

    const handleCustomerSelect = (c: Customer) => { setSelCustomer(c); setForm(f => ({ ...f, customerId: c.id, name: c.name, rego: '' })); setSelVehicle(null); };
    const handleVehicleSelect = (v: Vehicle) => { setSelVehicle(v); setForm(f => ({ ...f, vehicleId: v.id, rego: v.plate })); };
    const handleAdd = () => {
        if (!form.name.trim() || !form.rego.trim()) return;
        setReturns([...returns, { id: String(Date.now()).slice(-4).toUpperCase(), customerId: form.customerId, name: form.name, rego: form.rego.toUpperCase(), flight: form.flight, key: form.key, status: form.status, doNotMove: form.doNotMove, staff: form.staff, date: form.date }]);
        setAddModalOpen(false); setForm(defaultForm); setSelCustomer(null); setSelVehicle(null);
    };
    const handleStatusChange = (id: string, newStatus: string) => setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const handleStaffChange = (id: string, newStaff: string) => setReturns(returns.map(r => r.id === id ? { ...r, staff: newStaff } : r));
    const handleComplete = (id: string) => setReturns(returns.filter(r => r.id !== id));
    const handleDelete = () => { if (!deleteTarget) return; setReturns(returns.filter(r => r.id !== deleteTarget.id)); setDeleteTarget(null); };
    const filtered = returns.filter(r => [r.name, r.rego, r.id].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())) && (dayFilter === 'All' || r.date === dayFilter));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div><h1 className="section-title">Daily Car Returns</h1><p className="section-sub">{returns.length} scheduled</p></div>
                <div className="flex gap-3 flex-wrap items-center">
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Name, rego..."
                            className="pl-10 pr-4 py-2.5 bg-surface-bg border border-surface-border rounded-xl text-sm text-ink-body outline-none focus:border-brand-400 w-44" />
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="select-custom text-xs font-bold w-36">
                            <option value="All">All Days</option><option value="Today">Today</option><option value="Tomorrow">Tomorrow</option>
                        </select>
                    </div>
                    <motion.button onClick={() => { setForm(defaultForm); setSelCustomer(null); setSelVehicle(null); setAddModalOpen(true); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                        <PlusCircle size={16} /> Schedule Return
                    </motion.button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                <div className="overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="py-14 text-center">
                            <p className="font-medium text-ink-muted">{searchQuery ? 'No results' : 'No returns scheduled'}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead><tr>{['Customer & Flight', 'Vehicle', 'Status', 'Staff', ''].map(h => <th key={h} className="whitespace-nowrap">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-surface-border">
                                {filtered.map(ret => (
                                    <tr key={ret.id}>
                                        <td className="whitespace-nowrap">
                                            <p className="font-semibold text-ink-heading">{ret.name}</p>
                                            <p className="text-xs text-violet-600 mt-0.5">{ret.flight} · {ret.date}</p>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <CarFront size={13} className="text-ink-faint" />
                                                <span className="font-mono font-bold text-ink-heading bg-surface-bg border border-surface-border px-2 py-0.5 rounded-lg text-xs">{ret.rego}</span>
                                            </div>
                                            {ret.key && <p className="text-xs text-amber-600 mt-0.5 font-medium">Key #{ret.key}</p>}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <select value={ret.status} onChange={e => handleStatusChange(ret.id, e.target.value)}
                                                className="select-custom text-[11px] font-bold h-9 w-40 px-3">
                                                <option>Car In Yard</option><option>Ready at Front</option><option>Departed</option>
                                            </select>
                                            {ret.doNotMove && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg w-max mt-1">
                                                    <ShieldAlert size={10} /> Do Not Move
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-ink-muted">
                                                <UserCheck size={13} />
                                                <select value={ret.staff} onChange={e => handleStaffChange(ret.id, e.target.value)} className="select-custom text-[11px] font-bold h-9 w-32 px-3">
                                                    <option value="">Unassigned</option><option>Flo</option><option>Judy</option><option>Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleComplete(ret.id)} className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">Complete</button>
                                                <button onClick={() => setDeleteTarget(ret)} className="text-ink-faint hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>

            {/* Schedule Modal */}
            <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Schedule a Return">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Customer *</label>
                        <CustomerPicker selectedId={form.customerId} onSelect={handleCustomerSelect} />
                    </div>
                    {form.customerId && (
                        <div>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Vehicle *</label>
                            <VehiclePicker selectedId={form.vehicleId} onSelect={handleVehicleSelect} filterOwner={selCustomer?.name} />
                        </div>
                    )}
                    {[{ label: 'Return Flight', key: 'flight', placeholder: 'QF45 10:30 AM' }, { label: 'Key Number', key: 'key', placeholder: '04' }].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">{label}</label>
                            <input type="text" placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="field" />
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Day</label>
                            <select value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="select-custom">
                                <option>Today</option><option>Tomorrow</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Staff</label>
                            <select value={form.staff} onChange={e => setForm({ ...form, staff: e.target.value })} className="select-custom">
                                <option value="">Unassigned</option><option>Flo</option><option>Judy</option><option>Admin</option>
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setForm(f => ({ ...f, doNotMove: !f.doNotMove }))}>
                        <div className={`w-9 h-5 rounded-full transition-colors ${form.doNotMove ? 'bg-red-500' : 'bg-gray-300'} relative flex-shrink-0`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.doNotMove ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Do Not Move Car</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setAddModalOpen(false)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleAdd} disabled={!form.name || !form.rego} className="flex-1 btn-primary justify-center disabled:opacity-40">Schedule Return</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Entry">
                <p className="text-ink-body text-sm mb-5">Remove return for <span className="font-semibold text-ink-heading">{deleteTarget?.name}</span>?</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-ghost justify-center">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 inline-flex items-center justify-center bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition text-sm font-semibold">Delete</button>
                </div>
            </Modal>
        </div>
    );
};
export default Returns;
