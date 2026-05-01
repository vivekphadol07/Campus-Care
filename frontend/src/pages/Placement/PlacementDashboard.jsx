import React, { useState, useEffect } from 'react';
import { Activity, Briefcase, CheckCircle, Clock, XCircle, Bell, ChevronRight, IndianRupee, Star, Sparkles, TrendingUp, Users, Building } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useUser } from '../../context/userContext';
import { Link } from 'react-router-dom';

const PlacementDashboard = () => {
    const { user } = useUser();
    const [data, setData] = useState({ stats: { total: 0, shortlisted: 0, selected: 0, rejected: 0 }, recentJobs: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/api/placement/dashboard');
            setData(res.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 p-4 md:p-6">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Analytics Hub</h2>
                <p className="text-sm text-slate-500 mt-1">Track recruitment drives and student performance</p>
            </header>

            {/* Top: Placement Stats (Placed vs Unplaced, etc) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Batch '26</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">120</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Eligible</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{data.stats.selected || 45}</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Placed Students</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-amber-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">75</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Unplaced (Seeking)</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-purple-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building size={20} /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{data.recentJobs.length || 8}</h3>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Active Companies</p>
                    </div>
                </div>
            </div>

            {/* Middle: Company List & Upcoming Drives */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[350px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Briefcase size={18} className="text-blue-500"/> Active Companies</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {data.recentJobs.length > 0 ? data.recentJobs.map((job) => (
                            <div key={job.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center hover:border-blue-200 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                                        {job.company[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{job.company}</p>
                                        <p className="text-xs text-slate-500">{job.role} • {job.package}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wider">{new Date(job.deadline).toLocaleDateString()}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-400 italic">No active company postings.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[350px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-amber-500"/> Upcoming Drives</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {/* Mock data for upcoming drives */}
                        {[
                            { company: 'TechCorp', date: 'Next Monday', type: 'Online Test' },
                            { company: 'Innovate LLC', date: 'Oct 20', type: 'Technical Interview' },
                            { company: 'Global Solutions', date: 'Oct 25', type: 'Pre-Placement Talk' },
                        ].map((drive, i) => (
                            <div key={i} className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{drive.company}</p>
                                    <p className="text-xs text-amber-700 font-semibold">{drive.type}</p>
                                </div>
                                <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded shadow-sm">{drive.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: Student Tracker (table) */}
            <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Activity size={18} className="text-emerald-500"/> Placement Tracker List</h3>
                    <Link to={`/${user?.role === 'placement_cell' ? 'placement-cell' : user?.role + '/placement'}/tracker`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Open Full Tracker</Link>
                </div>
                <div className="overflow-hidden border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-3">Student Name</th>
                                <th className="p-3">Roll No</th>
                                <th className="p-3">Company</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {/* Mock Data */}
                            {[
                                { name: 'Alex Johnson', roll: 'CS2021001', company: 'Google', status: 'Shortlisted' },
                                { name: 'Sarah Smith', roll: 'CS2021002', company: 'Microsoft', status: 'Selected' },
                                { name: 'Michael Brown', roll: 'CS2021003', company: 'Amazon', status: 'Applied' }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-semibold">{row.name}</td>
                                    <td className="p-3 text-slate-500">{row.roll}</td>
                                    <td className="p-3 font-medium">{row.company}</td>
                                    <td className="p-3">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase 
                                            ${row.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' : 
                                              row.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' : 
                                              'bg-slate-100 text-slate-600'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-wider">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlacementDashboard;
