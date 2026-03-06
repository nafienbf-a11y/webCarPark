import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, CalendarClock, CheckCircle, AlertCircle, Send, RefreshCw, FileText, DollarSign, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import { format, differenceInDays } from 'date-fns';

interface IntakeRecord { id: number; name: string; email: string; phone: string; rego: string; dateIn: string; returnDate: string; total: number; timestamp: string; paymentMethod?: string; status?: string; billed?: boolean; }
interface Customer { id: number; name: string; email: string; phone: string; type: string; balance: number; }
interface BillingLog { id: string; customerId: number; customerName: string; email: string; amount: number; sentAt: string; status: 'sent' | 'pending' | 'paid'; paymentLink: string; }

const Billing = () => {
    const [intakes] = useLocalStorage<IntakeRecord[]>('cp_intakes', []);
    const [customers] = useLocalStorage<Customer[]>('cp_customers', []);
    const [billingLogs, setBillingLogs] = useLocalStorage<BillingLog[]>('cp_billing_logs', []);
    const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(null);
    const [runModal, setRunModal] = useState(false);
    const [runResult, setRunResult] = useState<{ sent: number } | null>(null);

    const today = new Date();
    const dayOfMonth = today.getDate();
    const nextBillingDate = new Date(today.getFullYear(), today.getMonth(), 20);
    if (nextBillingDate < today) nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    const daysUntilBilling = differenceInDays(nextBillingDate, today);

    const customerBalances = useMemo(() => customers.map(c => {
        const myIntakes = intakes.filter(i => i.name?.toLowerCase() === c.name?.toLowerCase() && !i.billed);
        const balance = myIntakes.reduce((s, i) => s + (i.total || 0), 0);
        const alreadyBilled = billingLogs.some(l => l.customerId === c.id && l.status !== 'paid');
        return { customer: c, balance, intakeCount: myIntakes.length, alreadyBilled };
    }).filter(x => x.balance > 0 || x.alreadyBilled), [customers, intakes, billingLogs]);

    const totalOwing = customerBalances.reduce((s, x) => s + x.balance, 0);
    const unbilledCount = customerBalances.filter(x => !x.alreadyBilled && x.balance > 0).length;
    const generatePaymentLink = (id: number, amount: number) => `https://pay.carpark.local/${id}?amount=${amount.toFixed(2)}&ref=${Date.now()}`;

    const handleSendAll = () => {
        const logs: BillingLog[] = [];
        customerBalances.forEach(({ customer, balance, alreadyBilled }) => {
            if (alreadyBilled || balance <= 0 || !customer.email) return;
            logs.push({ id: `BL-${Date.now()}-${customer.id}`, customerId: customer.id, customerName: customer.name, email: customer.email, amount: balance, sentAt: new Date().toISOString(), status: 'sent', paymentLink: generatePaymentLink(customer.id, balance) });
        });
        setBillingLogs([...billingLogs, ...logs]); setRunResult({ sent: logs.length }); setRunModal(false);
    };
    const handleSendOne = (customer: Customer, balance: number) => {
        if (billingLogs.find(l => l.customerId === customer.id && l.status !== 'paid')) return;
        setBillingLogs([...billingLogs, { id: `BL-${Date.now()}-${customer.id}`, customerId: customer.id, customerName: customer.name, email: customer.email, amount: balance, sentAt: new Date().toISOString(), status: 'sent', paymentLink: generatePaymentLink(customer.id, balance) }]);
        setPreviewCustomer(null);
    };
    const markPaid = (logId: string) => setBillingLogs(billingLogs.map(l => l.id === logId ? { ...l, status: 'paid' } : l));
    const getCustomerLog = (id: number) => billingLogs.find(l => l.customerId === id && l.status !== 'paid');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div><h1 className="section-title">Automated Billing</h1><p className="section-sub">Monthly invoicing — runs on the 20th</p></div>
                <motion.button onClick={() => setRunModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                    <Send size={16} /> Run Billing Now
                </motion.button>
            </div>

            {/* Status Banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${dayOfMonth === 20 ? 'bg-emerald-50 border-emerald-200' : 'card'}`}>
                <CalendarClock size={26} className={dayOfMonth === 20 ? 'text-emerald-600' : 'text-brand-500'} />
                <div>
                    <p className="font-semibold text-ink-heading">{dayOfMonth === 20 ? '🎉 Today is billing day!' : `Next billing: ${format(nextBillingDate, 'dd MMMM yyyy')}`}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{dayOfMonth === 20 ? `${unbilledCount} customer(s) will be invoiced automatically.` : `${daysUntilBilling} day(s) until emails are sent · ${unbilledCount} customer(s) pending`}</p>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { icon: DollarSign, label: 'Total Owing', value: `$${totalOwing.toFixed(2)}`, color: 'text-brand-500', bg: 'bg-brand-50' },
                    { icon: Clock, label: 'Pending Invoices', value: unbilledCount.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
                    { icon: CheckCircle, label: 'Sent This Month', value: billingLogs.filter(l => l.sentAt.startsWith(format(today, 'yyyy-MM'))).length.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(({ icon: Icon, label, value, color, bg }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-5">
                        <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${bg} mb-3`}><Icon size={18} className={color} /></div>
                        <p className="text-xs text-ink-muted uppercase tracking-widest font-semibold">{label}</p>
                        <p className="text-3xl font-bold text-ink-heading mt-1">{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Balances Table */}
            <div>
                <h2 className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-3">Customer Balances</h2>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card overflow-hidden">
                    {customerBalances.length === 0 ? (
                        <div className="py-14 text-center"><CheckCircle size={30} className="mx-auto mb-3 text-gray-300" /><p className="font-medium text-ink-muted">All balances are clear!</p></div>
                    ) : (
                        <table className="data-table">
                            <thead><tr>{['Customer', 'Email', 'Intakes', 'Balance', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-surface-border">
                                {customerBalances.map(({ customer, balance, intakeCount, alreadyBilled }) => {
                                    const log = getCustomerLog(customer.id);
                                    return (
                                        <tr key={customer.id}>
                                            <td className="font-semibold text-ink-heading">{customer.name}</td>
                                            <td className="text-ink-muted text-xs">{customer.email || <span className="italic">No email</span>}</td>
                                            <td className="text-ink-muted">{intakeCount}</td>
                                            <td className="font-bold text-ink-heading">${balance.toFixed(2)}</td>
                                            <td>{log ? <span className="badge badge-indigo"><Mail size={10} /> Sent</span> : <span className="badge badge-orange"><Clock size={10} /> Pending</span>}</td>
                                            <td><button onClick={() => setPreviewCustomer(customer)} className="btn-ghost text-xs px-3 py-1.5"><FileText size={12} /> Preview</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </motion.div>
            </div>

            {/* Billing History */}
            {billingLogs.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-3">Billing History</h2>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
                        <table className="data-table">
                            <thead><tr>{['Ref', 'Customer', 'Email', 'Amount', 'Sent', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-surface-border">
                                {[...billingLogs].reverse().map(log => (
                                    <tr key={log.id}>
                                        <td className="font-mono text-xs text-ink-faint">{log.id.slice(-8)}</td>
                                        <td className="font-medium text-ink-heading">{log.customerName}</td>
                                        <td className="text-ink-muted text-xs">{log.email}</td>
                                        <td className="font-bold text-ink-heading">${log.amount.toFixed(2)}</td>
                                        <td className="text-ink-muted text-xs">{format(new Date(log.sentAt), 'dd MMM yyyy HH:mm')}</td>
                                        <td>{log.status === 'paid' ? <span className="badge badge-green"><CheckCircle size={10} /> Paid</span> : <span className="badge badge-indigo"><Mail size={10} /> Sent</span>}</td>
                                        <td>{log.status !== 'paid' && <button onClick={() => markPaid(log.id)} className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">Mark Paid</button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            )}

            {/* Preview Modal */}
            {previewCustomer && (() => {
                const cb = customerBalances.find(x => x.customer.id === previewCustomer.id);
                const balance = cb?.balance ?? 0;
                const myIntakes = intakes.filter(i => i.name?.toLowerCase() === previewCustomer.name?.toLowerCase() && !i.billed);
                const log = getCustomerLog(previewCustomer.id);
                const payLink = generatePaymentLink(previewCustomer.id, balance);
                return (
                    <Modal isOpen onClose={() => setPreviewCustomer(null)} title="Invoice Preview">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div><p className="font-bold text-ink-heading">{previewCustomer.name}</p><p className="text-xs text-ink-muted">{previewCustomer.email || 'No email'}</p></div>
                                <div className="text-right"><p className="text-[10px] text-ink-faint uppercase tracking-widest">Invoice Date</p><p className="text-xs text-ink-muted">{format(today, 'dd MMMM yyyy')}</p></div>
                            </div>
                            <div className="bg-surface-bg rounded-xl border border-surface-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-surface-border"><th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Vehicle</th><th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted">Date In</th><th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-muted">Amount</th></tr></thead>
                                    <tbody className="divide-y divide-surface-border">
                                        {myIntakes.map(r => <tr key={r.id}><td className="px-4 py-2.5 font-mono text-ink-body text-xs">{r.rego || '—'}</td><td className="px-4 py-2.5 text-ink-muted text-xs">{r.dateIn || '—'}</td><td className="px-4 py-2.5 text-right font-semibold text-ink-heading">${r.total.toFixed(2)}</td></tr>)}
                                        {myIntakes.length === 0 && <tr><td colSpan={3} className="px-4 py-3 text-center text-ink-faint text-xs">No unbilled intakes</td></tr>}
                                    </tbody>
                                </table>
                                <div className="flex justify-between items-center px-4 py-3 bg-surface-bg border-t border-surface-border">
                                    <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total Due</span>
                                    <span className="text-xl font-bold text-brand-600">${balance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="bg-brand-50 border border-brand-200 rounded-xl p-3">
                                <p className="text-[10px] uppercase tracking-widest text-brand-600 font-bold mb-1">Payment Link</p>
                                <p className="font-mono text-xs text-ink-muted break-all">{payLink}</p>
                            </div>
                            {!previewCustomer.email && <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3"><AlertCircle size={14} /><p className="text-xs">No email on file — add one in Manage Customers first.</p></div>}
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setPreviewCustomer(null)} className="flex-1 btn-ghost justify-center">Close</button>
                                <button onClick={() => handleSendOne(previewCustomer, balance)} disabled={!previewCustomer.email || !!log || balance <= 0} className="flex-1 btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed"><Mail size={14} />{log ? 'Already Sent' : 'Send Invoice'}</button>
                            </div>
                        </div>
                    </Modal>
                );
            })()}

            {/* Run Modal */}
            <Modal isOpen={runModal} onClose={() => setRunModal(false)} title="Run Monthly Billing">
                <div className="space-y-4">
                    <div className="bg-surface-bg rounded-xl border border-surface-border p-4 space-y-2 text-sm">
                        {[['Customers to invoice', unbilledCount, 'text-ink-heading'], ['Total to collect', `$${totalOwing.toFixed(2)}`, 'text-brand-600'], ['No email (skipped)', customerBalances.filter(x => !x.customer.email && !x.alreadyBilled).length, 'text-amber-600']].map(([l, v, c]) => (
                            <div key={l as string} className="flex justify-between"><span className="text-ink-muted">{l as string}</span><span className={`font-bold ${c as string}`}>{String(v)}</span></div>
                        ))}
                    </div>
                    <p className="text-ink-muted text-sm">This will send invoice emails with payment links to all eligible customers.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setRunModal(false)} className="flex-1 btn-ghost justify-center">Cancel</button>
                        <button onClick={handleSendAll} className="flex-1 btn-primary justify-center"><Send size={14} /> Send All</button>
                    </div>
                </div>
            </Modal>

            {/* Result Modal */}
            <Modal isOpen={!!runResult} onClose={() => setRunResult(null)} title="Billing Complete">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-600"><CheckCircle size={24} /><p className="font-semibold text-ink-heading">{runResult?.sent} invoice(s) sent!</p></div>
                    <p className="text-ink-muted text-sm">Track payment status in the Billing History table.</p>
                    <button onClick={() => setRunResult(null)} className="w-full btn-primary justify-center">Done</button>
                </div>
            </Modal>
        </div>
    );
};
export default Billing;
