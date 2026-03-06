import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div key="backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-ink-heading/20 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div key="modal"
                        initial={{ opacity: 0, scale: 0.97, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 16 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-lg bg-surface-panel border border-surface-border rounded-2xl shadow-[0_20px_60px_rgba(17,24,39,0.15)] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                                <h2 className="text-base font-bold text-ink-heading tracking-tight">{title}</h2>
                                <button onClick={onClose}
                                    className="text-ink-faint hover:text-ink-heading bg-surface-hover border border-surface-border p-1.5 rounded-lg transition-colors">
                                    <X size={15} />
                                </button>
                            </div>
                            {/* Body */}
                            <div className="px-6 py-5">{children}</div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
