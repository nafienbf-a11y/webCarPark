import React, { useState, useRef, useEffect } from 'react';
import { Search, PlusCircle, Check, ChevronDown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Vehicle { id: number; plate: string; make: string; model: string; owner: string; ownerId: number | null; status: string; }
interface Props {
    selectedId: number | null;
    onSelect: (vehicle: Vehicle) => void;
    filterOwner?: string;
}

const VehiclePicker: React.FC<Props> = ({ selectedId, onSelect, filterOwner }) => {
    const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('cp_vehicles', []);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newForm, setNewForm] = useState({ plate: '', make: '', model: '', status: 'In Yard' });
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

    const selected = vehicles.find(v => v.id === selectedId);
    const pool = filterOwner ? vehicles.filter(v => v.owner.toLowerCase() === filterOwner.toLowerCase()) : vehicles;
    const filtered = pool.filter(v =>
        v.plate.toLowerCase().includes(search.toLowerCase()) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.owner.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropHeight = 340;
            setDropPos({ top: spaceBelow >= dropHeight ? rect.bottom + 4 : rect.top - dropHeight - 4, left: rect.left, width: rect.width });
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

    const handleCreate = (ownerName?: string) => {
        if (!newForm.plate.trim()) return;
        const nv: Vehicle = { id: Date.now(), ...newForm, plate: newForm.plate.toUpperCase(), owner: ownerName || '', ownerId: null };
        setVehicles([...vehicles, nv]);
        onSelect(nv);
        setOpen(false);
        setShowNewForm(false);
        setNewForm({ plate: '', make: '', model: '', status: 'In Yard' });
        setSearch('');
    };

    return (
        <div className="relative" data-picker>
            <button ref={btnRef} type="button" onClick={handleOpen}
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 outline-none transition">
                {selected
                    ? <span className="text-ink-heading font-mono font-bold">{selected.plate} <span className="font-normal text-ink-muted">{selected.make} {selected.model}</span></span>
                    : <span className="text-ink-faint">Select a vehicle...</span>
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
                                    <input autoFocus type="text" placeholder="Search plate, make..."
                                        value={search} onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-surface-bg border border-surface-border rounded-lg pl-8 pr-3 py-2 text-sm text-ink-body outline-none focus:border-brand-400" />
                                </div>
                            </div>
                            <ul className="max-h-52 overflow-y-auto">
                                {filtered.map(v => (
                                    <li key={v.id}>
                                        <button type="button" onClick={() => { onSelect(v); setOpen(false); setSearch(''); }}
                                            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-surface-hover transition-colors">
                                            <div>
                                                <p className="text-sm font-mono font-bold text-ink-heading">{v.plate}</p>
                                                <p className="text-xs text-ink-muted">{v.make} {v.model} {v.owner ? `· ${v.owner}` : ''}</p>
                                            </div>
                                            {v.id === selectedId && <Check size={14} className="text-brand-500" />}
                                        </button>
                                    </li>
                                ))}
                                {filtered.length === 0 && (
                                    <li className="px-4 py-4 text-sm text-ink-faint text-center">
                                        {filterOwner ? `No vehicles for ${filterOwner}` : 'No vehicles found'}
                                    </li>
                                )}
                            </ul>
                            <div className="p-3 border-t border-surface-border">
                                <button type="button" onClick={() => setShowNewForm(true)}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 hover:bg-emerald-100 transition">
                                    <PlusCircle size={14} /> Add New Vehicle
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 space-y-3">
                            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">Quick Add Vehicle</p>
                            {[
                                { key: 'plate', label: 'Plate *', placeholder: 'ABC123' },
                                { key: 'make', label: 'Make', placeholder: 'Toyota' },
                                { key: 'model', label: 'Model', placeholder: 'Camry' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-1 font-semibold">{label}</label>
                                    <input type="text" placeholder={placeholder} value={(newForm as any)[key]}
                                        onChange={e => setNewForm({ ...newForm, [key]: e.target.value })}
                                        className="field text-sm" />
                                </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={() => setShowNewForm(false)} className="flex-1 py-2 btn-ghost text-sm justify-center">Back</button>
                                <button type="button" onClick={() => handleCreate(filterOwner)}
                                    className="flex-1 py-2 inline-flex items-center justify-center bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition">
                                    Add & Select
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehiclePicker;
