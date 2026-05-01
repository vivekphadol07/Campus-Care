import React, { useState, useEffect } from 'react';
import { Utensils, Star, AlertCircle, BarChart3, ArrowRight, Activity, MessageSquare, DoorOpen, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosInstance';

const MessAdmin = () => {
    const [stats, setStats] = useState({ total_feedback: 0, avg_rating: 0, reviews: [] });
    const [menu, setMenu] = useState({ breakfast: '', lunch: '', dinner: '' });
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchStats();
    }, []);

    const cleanMenu = (str) => {
        if (!str) return '';
        try {
            let cleaned = String(str).replace(/\\"/g, '"').replace(/^"(.*)"$/, '$1').replace(/\\/g, '');
            if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
                try {
                    const parsed = JSON.parse(cleaned);
                    if (Array.isArray(parsed)) return parsed.join(', ');
                } catch { return cleaned; }
            }
            return cleaned;
        } catch {
            return String(str);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/mess/feedback/summary');
            setStats({
                avg_rating: res.data?.averageRating || 0,
                total_feedback: res.data?.recentFeedback?.length || 0,
                reviews: res.data?.recentFeedback || []
            });
            const menuRes = await api.get(`/api/mess/menu?date=${today}`);
            if (menuRes.data) {
                setMenu({
                    breakfast: menuRes.data.breakfast || '',
                    lunch: menuRes.data.lunch || '',
                    dinner: menuRes.data.dinner || ''
                });
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 p-4 md:p-6">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mess Operations Console</h2>
                <p className="text-sm text-slate-500 mt-1">Manage daily dining operations</p>
            </header>

            {/* Top: Today's Menu (Editable Card look) */}
            <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Utensils size={18} className="text-amber-500"/> Today's Menu Registry</h3>
                    <Link to="/mess-owner/menu-update" className="text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2">
                        Edit Menu <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">Breakfast</span>
                        <p className="text-sm font-semibold text-slate-800">{cleanMenu(menu.breakfast) || 'Not updated'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">Lunch</span>
                        <p className="text-sm font-semibold text-slate-800">{cleanMenu(menu.lunch) || 'Not updated'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">Dinner</span>
                        <p className="text-sm font-semibold text-slate-800">{cleanMenu(menu.dinner) || 'Not updated'}</p>
                    </div>
                </div>
            </div>

            {/* Middle: Feedback List & Room Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback List */}
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={18} className="text-blue-500"/> Recent Feedback</h3>
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                            <Star size={14} className="text-yellow-500 fill-yellow-500"/> {Number(stats.avg_rating).toFixed(1)} Avg
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] custom-scrollbar pr-2">
                        {stats.reviews.length > 0 ? stats.reviews.map((rev, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < rev.rating ? "currentColor" : "none"} />)}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(rev.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-700">{rev.comments || 'No comments'}</p>
                            </div>
                        )) : <p className="text-sm text-slate-400 italic">No recent feedback available.</p>}
                    </div>
                </div>

                {/* Room Requests Table Mix */}
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><DoorOpen size={18} className="text-emerald-500"/> Room Delivery Requests</h3>
                        <Link to="/mess-owner/room-requests" className="text-xs font-semibold text-emerald-600">Manage All</Link>
                    </div>
                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-3">Room</th>
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Meal</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {/* Mock Data */}
                                {[
                                    { room: 'A-102', student: 'John Doe', meal: 'Lunch', status: 'Pending' },
                                    { room: 'B-205', student: 'Jane Smith', meal: 'Lunch', status: 'Delivered' },
                                    { room: 'C-301', student: 'Mike Ross', meal: 'Dinner', status: 'Pending' }
                                ].map((req, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-3 font-semibold">{req.room}</td>
                                        <td className="p-3">{req.student}</td>
                                        <td className="p-3">{req.meal}</td>
                                        <td className="p-3">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${req.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom: Inventory / Updates */}
            <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Package size={18} className="text-indigo-500"/> Inventory & Updates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <span className="text-xs font-bold text-indigo-600 uppercase">Stock Alert</span>
                        <p className="text-sm font-semibold text-slate-800 mt-1">Rice supplies running low (Estimated: 2 days left)</p>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="text-xs font-bold text-emerald-600 uppercase">Supplier Delivery</span>
                        <p className="text-sm font-semibold text-slate-800 mt-1">Vegetables delivery scheduled for tomorrow 6:00 AM</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                        <button className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                            + Log Inventory Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessAdmin;
