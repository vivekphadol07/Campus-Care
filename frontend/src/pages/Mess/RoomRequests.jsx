import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, XCircle, Clock, MapPin, User, Activity, Filter, Search, ChevronRight } from 'lucide-react';
import api from '../../utils/axiosInstance';

const RoomRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/api/mess/requests');
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/api/mess/requests/${id}/status`, { status });
            fetchRequests();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'delivered': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
            </div>
        </div>
    );

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-12 p-4 md:p-12">
            {/* Standard Institutional Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Room <span className="text-indigo-600">Requests</span></h2>
                </div>
                <div className="flex flex-col items-center md:items-end gap-3 relative z-10">
                    <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                        <Truck size={18} className="text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">{pendingCount} Active Missions</span>
                    </div>
                </div>
            </header>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 p-4 rounded-[2rem] border border-slate-100 backdrop-blur-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input placeholder="Search Rooms / IDs..." className="w-full pl-12 pr-6 py-3 rounded-xl bg-white border border-slate-100 outline-none text-xs font-bold focus:border-indigo-500 transition-all shadow-sm" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600 transition-colors shadow-sm"><Filter size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-6 py-3 rounded-bl-[1.5rem] text-xs font-bold uppercase tracking-widest border-b border-l shadow-sm z-20 ${getStatusStyles(req.status)}`}>
                            {req.status}
                        </div>
                        
                        <div className="mb-10">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">R-{req.room_number}</h3>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 mt-2">Target Destination</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                        {req.student_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 leading-none">{req.student_name}</p>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{req.roll_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <Clock size={18} className="text-amber-500" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Session Protocol</p>
                                        <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{req.meal_type} • {new Date(req.request_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/30 p-6 rounded-[1.5rem] border border-indigo-50/50 group-hover:bg-white transition-colors">
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 px-1">Health Intelligence</p>
                                <p className="text-xs text-slate-700 italic font-bold leading-relaxed">"{req.reason}"</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {req.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button 
                                        className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white py-4 md:py-5 rounded-2xl font-bold text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                                        onClick={() => handleStatusUpdate(req.id, 'approved')}
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button 
                                        className="bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 px-6 rounded-2xl transition-all shadow-sm active:scale-95"
                                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            )}
                            {req.status === 'approved' && (
                                <button 
                                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 md:py-5 rounded-2xl font-bold text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                                    onClick={() => handleStatusUpdate(req.id, 'delivered')}
                                >
                                    <Truck size={20} /> Initiate Distribution
                                </button>
                            )}
                            {req.status === 'delivered' && (
                                <div className="w-full bg-slate-50 text-slate-300 py-4 md:py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] text-center flex items-center justify-center gap-3 border border-slate-100 italic">
                                    <CheckCircle size={16} className="text-emerald-400 opacity-50" /> Protocol Archived
                                </div>
                            )}
                            {req.status === 'rejected' && (
                                <div className="w-full bg-rose-50 text-rose-300 py-4 md:py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] text-center flex items-center justify-center gap-3 border border-rose-100 italic">
                                    <XCircle size={16} className="text-rose-400 opacity-50" /> Protocol Terminated
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <div className="col-span-full py-40 text-center flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <Truck size={48} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-300 italic uppercase tracking-widest">No Active Logistics</p>
                            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Awaiting new distribution directives</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomRequests;
