import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Customer { id: number; name: string; email: string; phone: string; type: string; balance: number; }
const defaultForm = { name: '', email: '', phone: '', type: 'Monthly', balance: 0 };

const typeBadge: Record<string, string> = {
    'Short-Term': 'badge-gray', Monthly: 'badge-indigo',
    Corporate: 'badge-indigo', 'Long-Term': 'badge-indigo',
};

const Customers = () => {
    const [customers, setCustomers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Customer | null>(null);
    const [form, setForm] = useState<typeof defaultForm>(defaultForm);
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

    const openAdd = () => { setEditTarget(null); setForm(defaultForm); setModalOpen(true); };
    const openEdit = (c: Customer) => { setEditTarget(c); setForm({ name: c.name, email: c.email, phone: c.phone, type: c.type, balance: c.balance }); setModalOpen(true); };
    const handleSave = () => {
        if (!form.name.trim()) return;
        if (editTarget) setCustomers(customers.map(c => c.id === editTarget.id ? { ...editTarget, ...form } : c));
        else setCustomers([...customers, { id: Date.now(), ...form }]);
        setModalOpen(false);
    };
    const handleDelete = () => { if (deleteTarget) { setCustomers(customers.filter(c => c.id !== deleteTarget.id)); setDeleteTarget(null); } };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="section-title">Manage Customers</h1><p className="section-sub">{customers.length} registered</p></div>
                <motion.button onClick={openAdd} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                    <UserPlus size={16} /> Add Customer
                </motion.button>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                <div className="overflow-x-auto">
                    {customers.length === 0 ? (
                        <div className="py-16 text-center text-ink-faint">
                            <UserPlus size={32} className="mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-ink-muted">No customers yet</p>
                            <p className="text-xs mt-1">Click "Add Customer" to get started</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead><tr>
                                {['Name', 'Phone', 'Email', 'Type', 'Balance', ''].map(h => <th key={h}>{h}</th>)}
                            </tr></thead>
                            <tbody className="divide-y divide-surface-border">
                                {customers.map(c => (
                                    <tr key={c.id}>
                                        <td className="font-semibold text-ink-heading whitespace-nowrap">{c.name}</td>
                                        <td className="text-ink-muted whitespace-nowrap">{c.phone}</td>
                                        <td className="text-ink-muted whitespace-nowrap">{c.email}</td>
                                        <td><span className={typeBadge[c.type] || 'badge-gray'}>{c.type}</span></td>
                                        <td className="font-semibold text-ink-body whitespace-nowrap">${Number(c.balance).toFixed(2)}</td>
                                        <td className="text-right whitespace-nowrap">
                                            <button onClick={() => openEdit(c)} className="text-ink-faint hover:text-brand-500 mr-3 transition-colors"><Edit size={15} /></button>
                                            <button onClick={() => setDeleteTarget(c)} className="text-ink-faint hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Customer' : 'Add New Customer'}>
                <div className="space-y-4">
                    {[{ label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Doe' }, { label: 'Phone', key: 'phone', type: 'text', placeholder: '0412 345 678' }, { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' }].map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">{label}</label>
                            <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="field" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Account Type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="field">
                            <option>Short-Term</option><option>Monthly</option><option>Corporate</option><option>Long-Term</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Opening Balance ($)</label>
                        <input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: Number(e.target.value) })} className="field" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleSave} className="flex-1 btn-primary justify-center">{editTarget ? 'Save Changes' : 'Add Customer'}</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer">
                <p className="text-ink-body text-sm mb-5">Delete <span className="font-semibold text-ink-heading">{deleteTarget?.name}</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-ghost justify-center">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 inline-flex items-center justify-center bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition text-sm font-semibold">Delete</button>
                </div>
            </Modal>
        </div>
    );
};
export default Customers;
