import React from 'react';
import { motion } from 'framer-motion';

const Sessions = () => (
    <div className="space-y-6">
        <div><h1 className="section-title">Parking Sessions</h1><p className="section-sub">Active and historical sessions</p></div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="card p-10 flex items-center justify-center min-h-[400px]">
            <p className="text-ink-faint font-medium">Active parking sessions will appear here</p>
        </motion.div>
    </div>
);
export default Sessions;
