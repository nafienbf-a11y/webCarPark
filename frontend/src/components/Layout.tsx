import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import {
    Car, Users, LayoutDashboard, FileText, Settings, LogOut,
    Clock, Search, Bell, Calculator, ArrowDownLeft, Archive,
    DollarSign, MailOpen, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navGroups = [
    {
        label: 'Operations',
        items: [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Invoicing', path: '/invoicing', icon: Calculator },
            { name: 'Returns', path: '/returns', icon: ArrowDownLeft },
            { name: 'Long Term', path: '/long-term', icon: Archive },
        ],
    },
    {
        label: 'Registry',
        items: [
            { name: 'Customers', path: '/customers', icon: Users },
            { name: 'Vehicles', path: '/vehicles', icon: Car },
            { name: 'Sessions', path: '/sessions', icon: Clock },
        ],
    },
    {
        label: 'Finance',
        items: [
            { name: 'Financials', path: '/finance', icon: DollarSign },
            { name: 'Billing', path: '/billing', icon: MailOpen },
            { name: 'Reports', path: '/reports', icon: FileText },
        ],
    },
    {
        label: 'System',
        items: [
            { name: 'Settings', path: '/settings', icon: Settings },
        ],
    },
];

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) return <Navigate to="/login" />;

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Close sidebar on route change (mobile)
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-surface-bg overflow-hidden font-sans" dir="ltr">

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-ink-heading/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo */}
                <div className="h-[80px] flex items-center px-8 border-b border-gray-50 lg:border-none">
                    <div className="h-10 w-10 rounded-2xl bg-brand-500 flex items-center justify-center mr-3 shadow-brand-glow transition-transform hover:rotate-6 duration-300">
                        <Car className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-ink-heading leading-tight tracking-tight">CarPark<span className="text-brand-500">Pro</span></h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Management OS</p>
                    </div>
                </div>

                {/* Nav */}
                <div className="flex-1 py-8 overflow-y-auto px-4 space-y-8">
                    {navGroups.map(group => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 px-4 mb-3">{group.label}</p>
                            <nav className="space-y-1">
                                {group.items.map(({ name, path, icon: Icon }) => {
                                    const active = location.pathname.startsWith(path);
                                    return (
                                        <Link key={name} to={path}
                                            className={`relative flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group ${active
                                                ? 'text-brand-600'
                                                : 'text-gray-500 hover:text-ink-heading hover:bg-gray-50'
                                                }`}>
                                            {active && (
                                                <motion.div layoutId="active-pill"
                                                    className="absolute inset-0 bg-brand-50/50 border border-brand-100 rounded-2xl"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            <Icon size={18} className={`mr-3 relative z-10 flex-shrink-0 transition-colors duration-300 ${active ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                            <span className="relative z-10">{name}</span>
                                            {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-brand-glow" />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-6 border-t border-gray-50">
                    <button onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group">
                        <LogOut size={18} className="mr-3 text-gray-300 group-hover:text-red-500 transition-colors" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Topbar */}
                <header className="h-[80px] bg-white/80 backdrop-blur-md border-b border-gray-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 z-10">

                    {/* Left: Hamburger + Search */}
                    <div className="flex items-center gap-4 flex-1 max-w-md">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 lg:hidden hover:bg-white transition-all active:scale-95"
                        >
                            <LayoutDashboard size={20} />
                        </button>

                        <div className="relative group flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-500 transition-colors duration-200" />
                            <input type="text" placeholder="Search..."
                                className="w-full pl-11 pr-4 h-11 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm text-ink-body placeholder-gray-400 outline-none focus:bg-white focus:border-brand-500/30 focus:ring-4 focus:ring-brand-500/5 transition-all duration-200" />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 sm:gap-6 ml-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <button className="p-3 rounded-2xl text-gray-400 hover:bg-gray-50 border border-gray-50 hover:border-gray-100 transition-all relative group">
                                <Bell size={20} />
                                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand-500 border-2 border-white animate-pulse" />
                            </button>
                        </div>

                        <div className="hidden sm:block h-8 w-px bg-gray-100" />

                        <div className="flex items-center gap-3 cursor-pointer group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 p-1.5 sm:pr-4 rounded-2xl transition-all duration-300">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xs shadow-brand-glow transform group-hover:rotate-6 transition-transform">
                                AD
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-ink-heading group-hover:text-brand-600 transition-colors leading-none">Admin</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manager</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
