import React from 'react';
import { motion } from 'framer-motion';

const Reports = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div><h1 className="section-title">Reports & Analytics</h1><p className="section-sub">Export and review activity summaries</p></div>
            <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-ghost">Export CSV</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">Export PDF</motion.button>
            </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="card p-10 flex items-center justify-center min-h-[400px]">
            <p className="text-ink-faint font-medium">To be implemented based on the needs of the client</p>
        </motion.div>
    </div>
);
export default Reports;