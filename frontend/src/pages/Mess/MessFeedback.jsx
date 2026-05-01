import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare, Star, TrendingUp, BarChart, Activity, User, Calendar } from 'lucide-react';
import api from '../../utils/axiosInstance';

const MessFeedback = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/mess/feedback/summary');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-12 p-4 md:p-12">
            {/* Standard Institutional Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Student <span className="text-amber-500">Feedback</span></h2>
                </div>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl relative z-10">
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{stats?.recentFeedback?.length || 0} New Entries</span>
                </div>
            </header>

            {/* Tactical Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 hover:shadow-2xl hover:shadow-amber-500/5 transition-all group">
                    <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-600 shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Global Satisfaction</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-slate-900 leading-none">{Number(stats?.averageRating || 0).toFixed(1)}</span>
                            <span className="text-lg font-bold text-slate-300 uppercase tracking-widest">/ 5.0</span>
                        </div>
                    </div>
                </div>

                {stats?.mealStats?.map((meal, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group">
                        <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                            <BarChart size={28} />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{meal.meal_type} Precision</span>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-slate-900 leading-none">{Number(meal.avg_rating).toFixed(1)}</span>
                                <Star size={24} fill="#facc15" stroke="none" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Intelligence Feed */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-2 bg-slate-900 text-white rounded-xl">
                        <MessageSquare size={18} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight uppercase tracking-[0.1em]">Intelligence Feed</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                    {stats?.recentFeedback?.map((fb, idx) => (
                        <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden flex flex-col md:flex-row gap-6">
                            <div className="md:w-64 flex-shrink-0 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <User size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900 leading-none">{fb.user_name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-widest">
                                            <Calendar size={14} /> {new Date(fb.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">{fb.meal_type} Session</span>
                                </div>
                            </div>
                            
                            <div className="flex-grow space-y-6">
                                <div className="flex gap-2 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={24} 
                                            fill={i < fb.rating ? "#facc15" : "none"}
                                            stroke={i < fb.rating ? "#facc15" : "#e2e8f0"}
                                            className={i < fb.rating ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : ""}
                                        />
                                    ))}
                                </div>
                                <div className="relative">
                                    <p className="text-sm md:text-sm text-slate-700 italic font-medium leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-slate-100 transition-all">
                                        "{fb.comment}"
                                    </p>
                                    <div className="absolute top-4 right-6 opacity-5">
                                        <MessageSquare size={80} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!stats?.recentFeedback || stats.recentFeedback.length === 0) && (
                        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                            <AlertCircle size={64} className="mx-auto mb-6 text-slate-100" />
                            <p className="text-2xl font-bold text-slate-300 italic uppercase tracking-widest">No Intelligence Gathered</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessFeedback;
