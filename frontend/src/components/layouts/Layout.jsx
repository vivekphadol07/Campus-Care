import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { LogOut, Menu, X, Search, Bell, User } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-[#F8F7F4] min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 md:h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 md:px-12 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">C</div>
                            <span className="text-lg font-bold text-slate-900 tracking-tight">CampusCare</span>
                        </div>
                        
                    </div>
                    <div className="flex items-center gap-2 md:gap-8">
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-[#F8F7F4] px-4 py-2 rounded-full border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Search size={16} className="text-slate-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent border-none outline-none text-sm w-48 focus:w-64 transition-all"
                            />
                        </div>

                        {/* Notification Icon */}
                        <button className="p-2 relative text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                        </button>

                        {/* User Profile Avatar */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                            </div>
                        </div>
                        
                        <button 
                            onClick={logout} 
                            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
