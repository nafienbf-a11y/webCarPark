import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Printer, Mail, Percent, Car, User, Calendar, Plane, CheckCircle, AlertCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import CustomerPicker from '../components/CustomerPicker';
import VehiclePicker from '../components/VehiclePicker';

interface Customer { id: number; name: string; phone: string; email: string; type: string; balance: number; }
interface Vehicle { id: number; plate: string; make: string; model: string; owner: string; ownerId: number | null; status: string; }
interface IntakeRecord { id: number; name: string; email: string; phone: string; make: string; model: string; rego: string; keyNumber: string; dateIn: string; returnDate: string; returnFlight: string; total: number; timestamp: string; }

const emptyForm = { name: '', email: '', phone: '', make: '', model: '', rego: '', keyNumber: '', dateIn: '', returnDate: '', returnFlight: '' };

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`block text-[11px] uppercase tracking-wider font-semibold text-ink-muted mb-1.5 ${className}`}>{children}</span>
);

const Invoicing = () => {
    const [formData, setFormData] = useState(emptyForm);
    const [dailyRate, setDailyRate] = useState(25);
    const [discountActive, setDiscountActive] = useState(false);
    const [intakes, setIntakes] = useLocalStorage<IntakeRecord[]>('cp_intakes', []);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState('');
    const [lastIntake, setLastIntake] = useState<IntakeRecord | null>(null);
    const [selCustomerId, setSelCustomerId] = useState<number | null>(null);
    const [selVehicleId, setSelVehicleId] = useState<number | null>(null);
    const [selCustomerName, setSelCustomerName] = useState('');

    const handleCustomerSelect = (c: Customer) => {
        setSelCustomerId(c.id); setSelCustomerName(c.name);
        setFormData(f => ({ ...f, name: c.name, email: c.email, phone: c.phone }));
        setSelVehicleId(null); setFormData(f => ({ ...f, make: '', model: '', rego: '' }));
    };
    const handleVehicleSelect = (v: Vehicle) => { setSelVehicleId(v.id); setFormData(f => ({ ...f, make: v.make, model: v.model, rego: v.plate })); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const calculateTotal = () => {
        if (!formData.dateIn || !formData.returnDate) return 0;
        const days = differenceInDays(parseISO(formData.returnDate), parseISO(formData.dateIn));
        if (days < 0) return 0;
        const base = (days === 0 ? 1 : days) * dailyRate;
        return discountActive ? base * 0.9 : base;
    };

    const handlePrint = () => {
        if (!lastIntake && (!formData.name || !formData.rego)) { setErrorModal('Complete an intake first before printing.'); return; }
        window.print();
    };
    const handleEmail = () => {
        if (!formData.email) { setErrorModal('Customer email is required.'); return; }
        setErrorModal(`Receipt queued for ${formData.email}.`);
    };
    const handleComplete = () => {
        if (!formData.name || !formData.rego) { setErrorModal('Customer name and rego plate are required.'); return; }
        const record: IntakeRecord = { id: Date.now(), ...formData, rego: formData.rego.toUpperCase(), total: calculateTotal(), timestamp: new Date().toISOString() };
        setIntakes([...intakes, record]); setLastIntake(record); setSuccessModal(true);
        setFormData(emptyForm); setDiscountActive(false); setSelCustomerId(null); setSelVehicleId(null); setSelCustomerName('');
    };

    const dayCount = formData.dateIn && formData.returnDate ? differenceInDays(parseISO(formData.returnDate), parseISO(formData.dateIn)) || 1 : null;

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div><h1 className="text-2xl sm:text-3xl font-extrabold text-ink-heading tracking-tight">New Intake</h1><p className="section-sub">{intakes.length} total recorded</p></div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <motion.button onClick={handlePrint} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-ghost flex-1 sm:flex-none py-2.5 px-3 px-4">
                            <Printer size={15} /> <span className="hidden xs:inline">Print</span>
                        </motion.button>
                        <motion.button onClick={handleEmail} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-ghost flex-1 sm:flex-none text-brand-600 border-brand-200 bg-brand-50 hover:bg-brand-100 py-2.5 px-3 sm:px-4">
                            <Mail size={15} /> <span className="hidden xs:inline">Email</span>
                        </motion.button>
                        <motion.button onClick={handleComplete} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary flex-1 sm:flex-none py-2.5 px-3 sm:px-6">
                            Complete
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Forms — left 2/3 */}
                    <div className="xl:col-span-2 space-y-5">
                        {/* Customer */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="card p-5 sm:p-6">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border">
                                <div className="h-8 w-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center"><User size={15} className="text-brand-500" /></div>
                                <span className="font-bold text-ink-heading text-sm">Customer Details</span>
                            </div>
                            <div className="mb-4">
                                <Label>Select Existing Customer</Label>
                                <CustomerPicker selectedId={selCustomerId} onSelect={handleCustomerSelect} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Full Name</Label><input name="name" value={formData.name} onChange={handleChange} className="field" placeholder="John Doe" /></div>
                                <div><Label>Phone</Label><input name="phone" value={formData.phone} onChange={handleChange} className="field" placeholder="0412 345 678" /></div>
                                <div className="md:col-span-2"><Label>Email</Label><input name="email" type="email" value={formData.email} onChange={handleChange} className="field" placeholder="john@example.com" /></div>
                            </div>
                        </motion.div>

                        {/* Vehicle */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-5 sm:p-6">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border">
                                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center"><Car size={15} className="text-emerald-600" /></div>
                                <span className="font-bold text-ink-heading text-sm">Vehicle Information</span>
                            </div>
                            <div className="mb-4">
                                <Label>Select Existing Vehicle</Label>
                                <VehiclePicker selectedId={selVehicleId} onSelect={handleVehicleSelect} filterOwner={selCustomerName || undefined} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div><Label>Make</Label><input name="make" value={formData.make} onChange={handleChange} className="field" placeholder="Toyota" /></div>
                                <div><Label>Model</Label><input name="model" value={formData.model} onChange={handleChange} className="field" placeholder="Camry" /></div>
                                <div><Label>Registration (Rego)</Label><input name="rego" value={formData.rego} onChange={handleChange} className="field uppercase" placeholder="XYZ123" /></div>
                                <div className="md:col-span-3">
                                    <Label className="text-amber-600">Key Box Number</Label>
                                    <input name="keyNumber" value={formData.keyNumber} onChange={handleChange} className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-ink-heading placeholder-amber-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition" placeholder="e.g. 04, 25" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Logistics */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card p-5 sm:p-6">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border">
                                <div className="h-8 w-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><Calendar size={15} className="text-violet-600" /></div>
                                <span className="font-bold text-ink-heading text-sm">Itinerary & Flights</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Date In</Label><input type="date" name="dateIn" value={formData.dateIn} onChange={handleChange} className="field" /></div>
                                <div><Label>Expected Return Date</Label><input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} className="field" /></div>
                                <div className="md:col-span-2">
                                    <Label><Plane size={12} className="inline mr-1" />Return Flight Info</Label>
                                    <input name="returnFlight" value={formData.returnFlight} onChange={handleChange} className="field" placeholder="QF400 3:00PM" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Pricing Sidebar */}
                    <div>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="card p-5 sm:p-6 xl:sticky xl:top-6">
                            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-surface-border">
                                <div className="h-8 w-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center"><Calculator size={15} className="text-brand-500" /></div>
                                <span className="font-bold text-ink-heading text-sm">Pricing</span>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-muted">Daily Rate ($)</span>
                                    <input type="number" value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))}
                                        className="w-20 bg-surface-bg border border-surface-border rounded-lg px-3 py-1.5 text-right text-ink-heading font-bold outline-none focus:border-brand-400" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-muted">Duration</span>
                                    <span className="font-bold text-ink-heading">{dayCount != null ? `${dayCount} day(s)` : '—'}</span>
                                </div>
                                <button onClick={() => setDiscountActive(!discountActive)}
                                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${discountActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-bg text-ink-muted border-surface-border hover:bg-surface-hover'}`}>
                                    <Percent size={13} /> {discountActive ? '✓ 10% Discount Applied' : 'Apply 10% Discount'}
                                </button>
                                <div className="h-px bg-surface-border" />
                                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                                    <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Total Due</p>
                                    <p className="text-3xl font-bold text-brand-700 mt-1">${calculateTotal().toFixed(2)}</p>
                                </div>
                                <p className="text-[10px] text-ink-faint text-center">Pricing updates automatically. Invoice generated on completion.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal isOpen={successModal} onClose={() => setSuccessModal(false)} title="Intake Completed">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <CheckCircle size={24} />
                        <span className="font-semibold text-ink-heading text-base">Intake saved successfully!</span>
                    </div>
                    {lastIntake && (
                        <div className="bg-surface-bg rounded-xl border border-surface-border p-4 space-y-2 text-sm font-mono">
                            {[['Customer', lastIntake.name], ['Rego', lastIntake.rego], ['Return Flight', lastIntake.returnFlight || '—']].map(([k, v]) => (
                                <div key={k} className="flex justify-between"><span className="text-ink-muted">{k}:</span><span className="text-ink-heading font-medium">{v}</span></div>
                            ))}
                            <div className="h-px bg-surface-border" />
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase tracking-widest text-ink-muted font-bold">Total Due</span>
                                <span className="text-2xl font-bold text-brand-600">${lastIntake.total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button onClick={() => setSuccessModal(false)} className="flex-1 btn-ghost justify-center">Close</button>
                        <button onClick={() => { window.print(); setSuccessModal(false); }} className="flex-1 btn-primary justify-center">Print Receipt</button>
                    </div>
                </div>
            </Modal>

            {/* Notice Modal */}
            <Modal isOpen={!!errorModal} onClose={() => setErrorModal('')} title="Notice">
                <div className="space-y-5">
                    <div className="flex items-start gap-3 text-amber-500">
                        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                        <p className="text-ink-body text-sm">{errorModal}</p>
                    </div>
                    <button onClick={() => setErrorModal('')} className="w-full btn-primary justify-center">Got it</button>
                </div>
            </Modal>
        </>
    );
};
export default Invoicing;
