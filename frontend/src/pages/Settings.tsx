import React from 'react';
import { motion } from 'framer-motion';

const Settings = () => (
    <div className="space-y-6">
        <div><h1 className="section-title">System Settings</h1><p className="section-sub">Configuration & admin options</p></div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="card p-10 flex items-center justify-center min-h-[400px]">
            <p className="text-ink-faint font-medium">To be implemented based on the needs of the client</p>
        </motion.div>
    </div>
);
export default Settings;