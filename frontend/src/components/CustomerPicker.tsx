import React, { useState, useRef, useEffect } from 'react';
import { Search, UserPlus, Check, ChevronDown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Customer { id: number; name: string; email: string; phone: string; type: string; balance: number; }
interface Props {
    selectedId: number | null;
    onSelect: (customer: Customer) => void;
}

const CustomerPicker: React.FC<Props> = ({ selectedId, onSelect }) => {
    const [customers, setCustomers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', phone: '', email: '', type: 'Short-Term' });
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

    const selected = customers.find(c => c.id === selectedId);

    const handleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropHeight = 340;
            setDropPos({
                top: spaceBelow >= dropHeight ? rect.bottom + 4 : rect.top - dropHeight - 4,
                left: rect.left,
                width: rect.width,
            });
        }
        setOpen(o => !o);
        setShowNewForm(false);
    };

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!btnRef.current?.closest('[data-picker]')?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        if (!newForm.name.trim()) return;
        const nc: Customer = { id: Date.now(), ...newForm, balance: 0 };
        setCustomers([...customers, nc]);
        onSelect(nc);
        setOpen(false);
        setShowNewForm(false);
        setNewForm({ name: '', phone: '', email: '', type: 'Short-Term' });
        setSearch('');
    };

    return (
        <div className="relative" data-picker>
            <button ref={btnRef} type="button" onClick={handleOpen}
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 outline-none transition">
                {selected
                    ? <span className="text-ink-heading font-medium truncate">{selected.name} <span className="text-ink-muted font-normal">— {selected.phone || selected.email}</span></span>
                    : <span className="text-ink-faint">Select a customer...</span>
                }
                <ChevronDown size={14} className={`text-ink-faint flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
                    className="picker-drop rounded-2xl overflow-hidden">
                    {!showNewForm ? (
                        <>
                            <div className="p-3 border-b border-surface-border">
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                                    <input autoFocus type="text" placeholder="Search name, phone, email..."
                                        value={search} onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-surface-bg border border-surface-border rounded-lg pl-8 pr-3 py-2 text-sm text-ink-body outline-none focus:border-brand-400" />
                                </div>
                            </div>
                            <ul className="max-h-52 overflow-y-auto">
                                {filtered.map(c => (
                                    <li key={c.id}>
                                        <button type="button" onClick={() => { onSelect(c); setOpen(false); setSearch(''); }}
                                            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-surface-hover transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-ink-heading">{c.name}</p>
                                                <p className="text-xs text-ink-muted">{c.phone} {c.email ? `· ${c.email}` : ''}</p>
                                            </div>
                                            {c.id === selectedId && <Check size={14} className="text-brand-500" />}
                                        </button>
                                    </li>
                                ))}
                                {filtered.length === 0 && <li className="px-4 py-4 text-sm text-ink-faint text-center">No customers found</li>}
                            </ul>
                            <div className="p-3 border-t border-surface-border">
                                <button type="button" onClick={() => setShowNewForm(true)}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-xl py-2.5 hover:bg-brand-100 transition">
                                    <UserPlus size={14} /> Create New Customer
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 space-y-3">
                            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">Quick Add Customer</p>
                            {[
                                { key: 'name', label: 'Full Name *', placeholder: 'John Doe' },
                                { key: 'phone', label: 'Phone', placeholder: '0412 345 678' },
                                { key: 'email', label: 'Email', placeholder: 'john@example.com' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-1 font-semibold">{label}</label>
                                    <input type="text" placeholder={placeholder} value={(newForm as any)[key]}
                                        onChange={e => setNewForm({ ...newForm, [key]: e.target.value })}
                                        className="field text-sm" />
                                </div>
                            ))}
                            <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value })} className="select-custom text-sm">
                                <option>Short-Term</option><option>Monthly</option><option>Corporate</option><option>Long-Term</option>
                            </select>
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={() => setShowNewForm(false)} className="flex-1 py-2 btn-ghost text-sm justify-center">Back</button>
                                <button type="button" onClick={handleCreate} className="flex-1 py-2 btn-primary text-sm justify-center">Add & Select</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerPicker;
