import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Users, GraduationCap, Calendar, CheckCircle, TrendingUp, BookOpen, Clock, Settings, UserPlus, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        pendingLeaves: 0,
        presentToday: 0,
        activityTrend: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get(API_PATHS.STATS.OVERALL);
            // Simulating total classes if not returned
            setStats({...res.data, totalClasses: res.data.totalClasses || 12 });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 p-4 md:p-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Command Center</h2>
                    <p className="text-sm text-slate-500 mt-1">System Overview & Management</p>
                </div>
            </header>

            {/* Top Metrics - 4 column compact grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><GraduationCap size={20} /></div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">+4%</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{stats.totalStudents}</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Students</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20} /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{stats.totalTeachers}</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Teachers</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-purple-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BookOpen size={20} /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{stats.totalClasses}</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Classes</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-rose-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Clock size={20} /></div>
                        {stats.pendingLeaves > 0 && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{stats.pendingLeaves}</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Pending Requests</p>
                    </div>
                </div>
            </div>

            {/* Middle Section - Activity & Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" /> Activity Overview
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.activityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value}%`, 'Attendance']}
                                />
                                <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                                    {stats.activityTrend.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.attendance > 75 ? '#818cf8' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-500" /> Upcoming Events
                    </h3>
                    <div className="flex-1 space-y-4">
                        <div className="p-4 rounded-xl border border-slate-100 flex gap-4 items-center">
                            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg text-center min-w-[50px]">
                                <span className="block text-xs font-bold uppercase">Oct</span>
                                <span className="block text-lg font-black">12</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Faculty Meeting</h4>
                                <p className="text-xs text-slate-500">10:00 AM - Main Hall</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-100 flex gap-4 items-center">
                            <div className="bg-rose-50 text-rose-600 p-2 rounded-lg text-center min-w-[50px]">
                                <span className="block text-xs font-bold uppercase">Oct</span>
                                <span className="block text-lg font-black">15</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Mid-term Exams</h4>
                                <p className="text-xs text-slate-500">All Campuses</p>
                            </div>
                        </div>
                    </div>
                    <Link to="/admin/events" className="mt-4 text-center text-sm font-semibold text-blue-600 hover:text-blue-700">View All Events</Link>
                </div>
            </div>

            {/* Bottom Section - Quick Management Actions */}
            <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Management Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Link to="/admin/add-teacher" className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100">
                        <UserPlus size={16} /> Add Teacher
                    </Link>
                    <Link to="/admin/add-class" className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100">
                        <PlusCircle size={16} /> Create Class
                    </Link>
                    <Link to="/admin/students" className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100">
                        <Users size={16} /> Manage Students
                    </Link>
                    <Link to="/admin/settings" className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100">
                        <Settings size={16} /> System Settings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
