import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerPicker from '../components/CustomerPicker';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Customer { id: number; name: string; email: string; phone: string; type: string; balance: number; }
interface Vehicle { id: number; plate: string; make: string; model: string; owner: string; ownerId: number | null; status: string; }
const defaultForm = { plate: '', make: '', model: '', owner: '', ownerId: null as number | null, status: 'In Yard' };
const statusBadge: Record<string, string> = { 'In Yard': 'badge-green', 'Departed': 'badge-gray', 'Checked In': 'badge-indigo' };

const Vehicles = () => {
    const [customers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('cp_vehicles', []);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [selCustomerId, setSelCustomerId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

    const filtered = vehicles.filter(v =>
        v.plate.toLowerCase().includes(search.toLowerCase()) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.owner.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setEditTarget(null); setForm(defaultForm); setSelCustomerId(null); setModalOpen(true); };
    const openEdit = (v: Vehicle) => { setEditTarget(v); setForm({ plate: v.plate, make: v.make, model: v.model, owner: v.owner, ownerId: v.ownerId, status: v.status }); setSelCustomerId(v.ownerId); setModalOpen(true); };
    const handleCustomerSelect = (c: Customer) => { setSelCustomerId(c.id); setForm(f => ({ ...f, owner: c.name, ownerId: c.id })); };
    const handleSave = () => {
        if (!form.plate.trim()) return;
        const veh = { ...form, plate: form.plate.toUpperCase() };
        if (editTarget) setVehicles(vehicles.map(v => v.id === editTarget.id ? { ...editTarget, ...veh } : v));
        else setVehicles([...vehicles, { id: Date.now(), ...veh }]);
        setModalOpen(false);
    };
    const handleDelete = () => { if (deleteTarget) { setVehicles(vehicles.filter(v => v.id !== deleteTarget.id)); setDeleteTarget(null); } };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div><h1 className="section-title">Manage Vehicles</h1><p className="section-sub">{vehicles.length} registered</p></div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <input placeholder="Search plate, make, owner..." value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-surface-bg border border-surface-border rounded-xl text-sm text-ink-body placeholder-ink-faint outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 transition w-64" />
                    </div>
                    <motion.button onClick={openAdd} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary"><Plus size={16} /> Add Vehicle</motion.button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                <div className="overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="font-medium text-ink-muted">{search ? 'No results found' : 'No vehicles registered yet'}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead><tr>{['Plate', 'Make / Model', 'Owner', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-surface-border">
                                {filtered.map(v => (
                                    <tr key={v.id}>
                                        <td className="font-mono font-bold text-ink-heading whitespace-nowrap">{v.plate}</td>
                                        <td className="text-ink-body whitespace-nowrap">{v.make} {v.model}</td>
                                        <td className="text-ink-muted whitespace-nowrap">{v.owner || '—'}</td>
                                        <td><span className={statusBadge[v.status] || 'badge-gray'}>{v.status}</span></td>
                                        <td className="text-right whitespace-nowrap">
                                            <button onClick={() => openEdit(v)} className="text-ink-faint hover:text-brand-500 mr-3 transition-colors"><Edit size={15} /></button>
                                            <button onClick={() => setDeleteTarget(v)} className="text-ink-faint hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Vehicle' : 'Add Vehicle'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Owner (Customer)</label>
                        <CustomerPicker selectedId={selCustomerId} onSelect={handleCustomerSelect} />
                    </div>
                    {[{ label: 'Plate *', key: 'plate', mono: true }, { label: 'Make', key: 'make', mono: false }, { label: 'Model', key: 'model', mono: false }].map(({ label, key, mono }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">{label}</label>
                            <input className={`field ${mono ? 'font-mono uppercase' : ''}`} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Status</label>
                        <select className="select-custom" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            <option>In Yard</option><option>Departed</option><option>Checked In</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleSave} className="flex-1 btn-primary justify-center">{editTarget ? 'Save Changes' : 'Add Vehicle'}</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Vehicle">
                <p className="text-ink-body text-sm mb-5">Remove <span className="font-mono font-bold text-ink-heading">{deleteTarget?.plate}</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-ghost justify-center">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 inline-flex items-center justify-center bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition text-sm font-semibold">Remove</button>
                </div>
            </Modal>
        </div>
    );
};
export default Vehicles;
