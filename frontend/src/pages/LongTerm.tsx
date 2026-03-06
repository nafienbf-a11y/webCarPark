import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Edit, Trash2, Car, CalendarClock } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerPicker from '../components/CustomerPicker';
import VehiclePicker from '../components/VehiclePicker';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Customer { id: number; name: string; phone: string; email: string; type: string; balance: number; }
interface Vehicle { id: number; plate: string; make: string; model: string; owner: string; ownerId: number | null; status: string; }
interface LTCustomer { id: string; registryNum: string; clientId: number | null; name: string; company: string; regos: string[]; activeSince: string; }

const LongTerm = () => {
    const [customers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [vehicles] = useLocalStorage<Vehicle[]>('cp_vehicles', []);
    const [ltCustomers, setLtCustomers] = useLocalStorage<LTCustomer[]>('cp_lt_customers', []);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<LTCustomer | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LTCustomer | null>(null);
    const [selCustomer, setSelCustomer] = useState<Customer | null>(null);
    const [selVehicle, setSelVehicle] = useState<Vehicle | null>(null);
    const [selectedRegos, setSelectedRegos] = useState<string[]>([]);
    const [company, setCompany] = useState('');
    const [activeSince, setActiveSince] = useState(new Date().toISOString().split('T')[0]);
    const [editForm, setEditForm] = useState({ name: '', company: '', regos: '', activeSince: '' });

    const resetAdd = () => { setSelCustomer(null); setSelVehicle(null); setSelectedRegos([]); setCompany(''); setActiveSince(new Date().toISOString().split('T')[0]); };
    const openEdit = (lt: LTCustomer) => { setEditTarget(lt); setEditForm({ name: lt.name, company: lt.company, regos: lt.regos.join(', '), activeSince: lt.activeSince }); };
    const handleVehicleSelect = (v: Vehicle) => { setSelVehicle(v); if (!selectedRegos.includes(v.plate)) setSelectedRegos([...selectedRegos, v.plate]); };
    const removeRego = (r: string) => setSelectedRegos(selectedRegos.filter(x => x !== r));
    const handleAdd = () => {
        if (!selCustomer) return;
        setLtCustomers([...ltCustomers, { id: `LT-${String(ltCustomers.length + 1).padStart(2, '0')}`, registryNum: String(1031 + ltCustomers.length), clientId: selCustomer.id, name: selCustomer.name, company: company || 'Personal', regos: selectedRegos.length > 0 ? selectedRegos : ['TBD'], activeSince }]);
        setAddModalOpen(false); resetAdd();
    };
    const handleEditSave = () => {
        if (!editTarget) return;
        setLtCustomers(ltCustomers.map(lt => lt.id === editTarget.id ? { ...lt, name: editForm.name, company: editForm.company, regos: editForm.regos.split(',').map(r => r.trim().toUpperCase()).filter(Boolean), activeSince: editForm.activeSince } : lt));
        setEditTarget(null);
    };
    const handleDelete = () => { if (!deleteTarget) return; setLtCustomers(ltCustomers.filter(lt => lt.id !== deleteTarget.id)); setDeleteTarget(null); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="section-title">Permanent Registry (LT)</h1><p className="section-sub">{ltCustomers.length} long-term client(s)</p></div>
                <motion.button onClick={() => { resetAdd(); setAddModalOpen(true); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                    <UserPlus size={16} /> Add LT Client
                </motion.button>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
                {ltCustomers.length === 0 ? (
                    <div className="py-14 text-center text-ink-faint">
                        <UserPlus size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-medium text-ink-muted">No long-term clients yet</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead><tr>{['LT #', 'Client', 'Company', 'Vehicles', 'Since', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-surface-border">
                            {ltCustomers.map(lt => (
                                <tr key={lt.id}>
                                    <td><span className="badge badge-indigo font-mono">LT-{lt.registryNum}</span></td>
                                    <td className="font-semibold text-ink-heading">{lt.name}</td>
                                    <td className="text-ink-muted text-xs uppercase tracking-wider">{lt.company}</td>
                                    <td>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {lt.regos.map((r, idx) => (
                                                <span key={idx} className="flex items-center gap-1 bg-surface-bg border border-surface-border px-2 py-0.5 rounded-lg">
                                                    <Car size={11} className="text-brand-400" />
                                                    <span className="font-mono text-xs font-bold text-ink-heading">{r}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="text-ink-muted text-sm">
                                        <div className="flex items-center gap-1.5"><CalendarClock size={13} className="text-ink-faint" />{lt.activeSince}</div>
                                    </td>
                                    <td className="text-right">
                                        <button onClick={() => openEdit(lt)} className="text-ink-faint hover:text-brand-500 mr-2 transition-colors"><Edit size={15} /></button>
                                        <button onClick={() => setDeleteTarget(lt)} className="text-ink-faint hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Add Modal */}
            <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register Long-Term Client">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Select Client *</label>
                        <CustomerPicker selectedId={selCustomer?.id ?? null} onSelect={c => { setSelCustomer(c); setCompany(c.type === 'Corporate' ? c.type : 'Personal'); }} />
                    </div>
                    {selCustomer && (<>
                        <div>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Add Vehicles</label>
                            <VehiclePicker selectedId={selVehicle?.id ?? null} onSelect={handleVehicleSelect} filterOwner={selCustomer.name} />
                            {selectedRegos.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {selectedRegos.map(r => (
                                        <span key={r} className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg">
                                            <Car size={11} className="text-brand-500" />
                                            <span className="font-mono text-xs font-bold text-brand-600">{r}</span>
                                            <button onClick={() => removeRego(r)} className="text-ink-faint hover:text-red-500 ml-0.5 transition-colors text-xs">✕</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Company</label>
                            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Telstra Corp or Personal" className="field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Active Since</label>
                            <input type="date" value={activeSince} onChange={e => setActiveSince(e.target.value)} className="field" />
                        </div>
                    </>)}
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setAddModalOpen(false)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleAdd} disabled={!selCustomer} className="flex-1 btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed">Register Client</button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit LT Client">
                <div className="space-y-4">
                    {[{ label: 'Name', key: 'name', placeholder: 'Client name' }, { label: 'Company', key: 'company', placeholder: 'Company or Personal' }, { label: 'Regos (comma-separated)', key: 'regos', placeholder: 'ABC123, DEF456' }].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">{label}</label>
                            <input type="text" placeholder={placeholder} value={(editForm as any)[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className="field" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Active Since</label>
                        <input type="date" value={editForm.activeSince} onChange={e => setEditForm({ ...editForm, activeSince: e.target.value })} className="field" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setEditTarget(null)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleEditSave} className="flex-1 btn-primary justify-center">Save Changes</button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Client">
                <p className="text-ink-body text-sm mb-5">Remove <span className="font-semibold text-ink-heading">{deleteTarget?.name}</span> from the permanent registry?</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-ghost justify-center">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 inline-flex items-center justify-center bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition text-sm font-semibold">Delete</button>
                </div>
            </Modal>
        </div>
    );
};
export default LongTerm;
