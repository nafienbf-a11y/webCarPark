import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => (
    <div className="space-y-6">
        <div><h1 className="section-title">System Settings</h1><p className="section-sub">Configuration & admin options</p></div>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="card bg-white/40 backdrop-blur-sm border-dashed border-2 border-gray-100 p-12 flex flex-col items-center justify-center min-h-[450px] text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 text-gray-300">
                <SettingsIcon size={32} />
            </div>
            <h2 className="text-xl font-bold text-ink-heading mb-2">Module Under Development</h2>
            <p className="text-ink-faint font-medium max-w-xs leading-relaxed">
                To be implemented based on the needs of the client.
            </p>
            <div className="mt-8 px-4 py-2 bg-gray-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100">
                Phase 2 Core Update
            </div>
        </motion.div>
    </div>
);
export default Settings;