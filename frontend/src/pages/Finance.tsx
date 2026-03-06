import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, Building, DollarSign, SplitSquareHorizontal, CheckCircle, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import { format, isToday, parseISO } from 'date-fns';

interface IntakeRecord {
    id: number; name: string; email: string; phone: string;
    make: string; model: string; rego: string; keyNumber: string;
    dateIn: string; returnDate: string; returnFlight: string;
    total: number; timestamp: string; paymentMethod?: string; status?: string;
    splitEftpos?: number; splitCash?: number;
}

const Finance = () => {
    const [intakes, setIntakes] = useLocalStorage<IntakeRecord[]>('cp_intakes', []);
    const [splitTarget, setSplitTarget] = useState<IntakeRecord | null>(null);
    const [splitEftpos, setSplitEftpos] = useState('');
    const [splitCash, setSplitCash] = useState('');
    const [splitMethod, setSplitMethod] = useState<'eftpos' | 'cash' | 'account' | 'split'>('eftpos');
    const [endDayModal, setEndDayModal] = useState(false);

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayIntakes = intakes.filter(i => i.timestamp?.startsWith(today));
    const totalEftpos = todayIntakes.filter(i => i.paymentMethod === 'eftpos' || !i.paymentMethod).reduce((s, i) => s + i.total, 0);
    const totalCash = todayIntakes.filter(i => i.paymentMethod === 'cash').reduce((s, i) => s + i.total, 0);
    const totalAccount = todayIntakes.filter(i => i.paymentMethod === 'account').reduce((s, i) => s + i.total, 0);
    const grandTotal = todayIntakes.reduce((s, i) => s + i.total, 0);

    const openSplit = (rec: IntakeRecord) => { setSplitTarget(rec); setSplitEftpos(''); setSplitCash(''); setSplitMethod('eftpos'); };
    const handleSaveSplit = () => {
        if (!splitTarget) return;
        setIntakes(intakes.map(i => i.id !== splitTarget.id ? i :
            splitMethod === 'split' ? { ...i, paymentMethod: 'split', splitEftpos: Number(splitEftpos), splitCash: Number(splitCash) } : { ...i, paymentMethod: splitMethod }
        ));
        setSplitTarget(null);
    };
    const handleEndDay = () => { setIntakes(intakes.map(i => i.timestamp?.startsWith(today) ? { ...i, status: 'reconciled' } : i)); setEndDayModal(false); };

    const paymentBadge = (rec: IntakeRecord) => {
        const m = rec.paymentMethod;
        if (m === 'cash') return <span className="badge badge-orange">Cash</span>;
        if (m === 'account') return <span className="badge badge-indigo">Account</span>;
        if (m === 'split') return <div className="flex flex-col gap-0.5"><span className="badge badge-green">Eftpos ${rec.splitEftpos}</span><span className="badge badge-orange">Cash ${rec.splitCash}</span></div>;
        return <span className="badge badge-green">Eftpos</span>;
    };

    const cards = [
        { label: 'Eftpos', value: totalEftpos, icon: CreditCard, color: 'text-brand-500', bg: 'bg-brand-50' },
        { label: 'Cash', value: totalCash, icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'On Account', value: totalAccount, icon: Building, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: "Today's Revenue", value: grandTotal, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="section-title">Financials & End Day</h1><p className="section-sub">{todayIntakes.length} transaction(s) today</p></div>
                <motion.button onClick={() => setEndDayModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                    <RefreshCw size={16} /> End Day
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-6">
                        <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${bg} mb-4`}>
                            <Icon size={18} className={color} />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
                        <p className="text-2xl font-bold text-ink-heading mt-1">${value.toFixed(2)}</p>
                    </motion.div>
                ))}
            </div>

            <h2 className="text-sm font-bold text-ink-muted uppercase tracking-widest pt-1">Today's Transactions</h2>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card overflow-hidden">
                {todayIntakes.length === 0 ? (
                    <div className="py-14 text-center">
                        <DollarSign size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-medium text-ink-muted">No transactions today</p>
                        <p className="text-xs text-ink-faint mt-1">Complete intakes in Invoicing to see them here</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead><tr>{['Invoice #', 'Customer', 'Rego', 'Amount', 'Payment', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-surface-border">
                            {todayIntakes.map(rec => (
                                <tr key={rec.id}>
                                    <td className="font-mono text-xs text-ink-muted">INV-{String(rec.id).slice(-4)}</td>
                                    <td className="font-medium text-ink-heading">{rec.name}</td>
                                    <td className="font-mono text-ink-muted">{rec.rego || '—'}</td>
                                    <td className="font-bold text-ink-heading">${rec.total.toFixed(2)}</td>
                                    <td>{paymentBadge(rec)}</td>
                                    <td>{rec.status === 'reconciled' ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle size={12} /> Done</span> : <span className="text-ink-faint text-xs">Pending</span>}</td>
                                    <td><button onClick={() => openSplit(rec)} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition"><SplitSquareHorizontal size={12} /> Set Payment</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Split Payment Modal */}
            <Modal isOpen={!!splitTarget} onClose={() => setSplitTarget(null)} title="Set Payment Method">
                {splitTarget && <div className="space-y-4">
                    <div className="bg-surface-bg rounded-xl border border-surface-border p-4">
                        <p className="text-sm text-ink-muted">Invoice for <span className="font-semibold text-ink-heading">{splitTarget.name}</span></p>
                        <p className="text-2xl font-bold text-ink-heading mt-1">${splitTarget.total.toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[['eftpos', 'Eftpos', 'brand'], ['cash', 'Cash', 'amber'], ['account', 'On Account', 'violet'], ['split', 'Split', 'emerald']].map(([k, l]) => (
                            <button key={k} onClick={() => setSplitMethod(k as any)}
                                className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${splitMethod === k ? 'bg-brand-50 text-brand-600 border-brand-300' : 'bg-surface-bg text-ink-muted border-surface-border hover:bg-surface-hover'}`}>{l}</button>
                        ))}
                    </div>
                    {splitMethod === 'split' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Eftpos ($)</label>
                                <input type="number" value={splitEftpos} onChange={e => { setSplitEftpos(e.target.value); setSplitCash(String(splitTarget.total - Number(e.target.value))); }} className="field" /></div>
                            <div><label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1.5">Cash ($)</label>
                                <input type="number" value={splitCash} onChange={e => { setSplitCash(e.target.value); setSplitEftpos(String(splitTarget.total - Number(e.target.value))); }} className="field" /></div>
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button onClick={() => setSplitTarget(null)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleSaveSplit} className="flex-1 btn-primary justify-center">Save</button>
                    </div>
                </div>}
            </Modal>

            {/* End Day Modal */}
            <Modal isOpen={endDayModal} onClose={() => setEndDayModal(false)} title="End Day Reconciliation">
                <div className="space-y-5">
                    <div className="bg-surface-bg rounded-xl border border-surface-border p-4 space-y-2 text-sm">
                        {[['Eftpos', totalEftpos, 'text-brand-600'], ['Cash', totalCash, 'text-amber-600'], ['On Account', totalAccount, 'text-violet-600']].map(([l, v, c]) => (
                            <div key={l as string} className="flex justify-between"><span className="text-ink-muted">{l as string}</span><span className={`font-bold ${c as string}`}>${(v as number).toFixed(2)}</span></div>
                        ))}
                        <div className="border-t border-surface-border pt-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total</span>
                            <span className="text-2xl font-bold text-ink-heading">${grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <p className="text-ink-muted text-sm">Mark all {todayIntakes.length} transaction(s) as <span className="text-emerald-600 font-semibold">Reconciled</span>?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setEndDayModal(false)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleEndDay} className="flex-1 btn-primary justify-center">Confirm End Day</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
export default Finance;
