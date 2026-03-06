import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, User } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { identifier, password });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="blob blob-indigo w-[600px] h-[600px] -top-24 -right-24" />
            <div className="blob blob-purple w-[500px] h-[500px] -bottom-24 -left-24" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px] relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center justify-center h-20 w-20 rounded-[2rem] bg-brand-500 shadow-brand-glow mb-6 group"
                    >
                        <Car className="text-white group-hover:scale-110 transition-transform duration-500" size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-4xl font-extrabold text-ink-heading tracking-tight"
                    >
                        CarPark <span className="text-brand-500">Pro</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mt-3"
                    >
                        Secure Staff Authentication
                    </motion.p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="glass-panel rounded-[2.5rem] p-10 border-white/60 shadow-glass"
                >
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-red-600 text-[11px] font-bold uppercase tracking-wider text-center bg-red-50 border border-red-100 p-4 rounded-2xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Identity</label>
                            <div className="relative group">
                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-500 transition-colors duration-200" />
                                <input type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                                    className="field pl-14 h-14" placeholder="Username or Email" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Secret Key</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-500 transition-colors duration-200" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    className="field pl-14 h-14" placeholder="••••••••" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full btn-primary h-14 text-base shadow-brand-glow"
                            >
                                Access Dashboard
                            </motion.button>
                        </div>
                    </form>
                </motion.div>

                {/* Footer Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8 text-xs text-gray-400 font-medium"
                >
                    Lost your credentials? <span className="text-brand-500 cursor-pointer hover:underline">Contact System Admin</span>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Login;
