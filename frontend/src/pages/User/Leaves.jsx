import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Calendar, Check, X, Clock, FileText, User, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/userContext';

const Leaves = () => {
    const { user } = useUser();
    const [leaves, setLeaves] = useState([]);
    const [activeTab, setActiveTab] = useState(user?.role === 'student' ? 'apply' : 'requests');

    // Form state
    const [students, setStudents] = useState([]);
    const [application, setApplication] = useState({
        student_id: user?.role === 'student' ? user.id : '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    useEffect(() => {
        if (user) {
            fetchLeaves();
            if (user?.role === 'teacher') {
                fetchStudents();
            }
            // Ensure student application has correct ID
            if (user?.role === 'student') {
                setApplication(prev => ({ ...prev, student_id: user.id }));
            }
        }
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const res = await api.get(API_PATHS.LEAVES);
            setLeaves(res.data); // Backend now filters by role
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get(API_PATHS.STUDENTS);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post(API_PATHS.LEAVES, application);
            alert('Leave application submitted');
            setApplication(prev => ({ ...prev, start_date: '', end_date: '', reason: '' }));
            if (user?.role === 'teacher') setApplication(prev => ({ ...prev, student_id: '' }));

            fetchLeaves();
            if (user?.role === 'student') setActiveTab('requests'); // Switch to view status
        } catch (err) {
            alert('Failed to submit application');
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`${API_PATHS.LEAVES}/${id}/status`, { status });
            fetchLeaves();
        } catch (err) {
            alert('Failed to update status');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'rejected': return 'bg-rose-100 text-rose-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 max-w-5xl mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="text-center md:text-left">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Leave <span className="text-indigo-600">Management</span></h2>
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-xl md:rounded-2xl border border-slate-100 w-full md:w-fit">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'requests' ? 'bg-white shadow-xl shadow-slate-200 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {user?.role === 'student' ? 'My Status' : 'Permit Queue'}
                    </button>
                    {user?.role === 'student' && (
                        <button
                            onClick={() => setActiveTab('apply')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'apply' ? 'bg-white shadow-xl shadow-slate-200 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Apply
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'requests' || user?.role !== 'student' ? (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {leaves.map((leave) => (
                        <div key={leave.id} className="bg-white p-5 md:p-8 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                        {leave.student_name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base md:text-lg leading-none">{leave.student_name}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                                            <Calendar size={12} className="text-slate-300" />
                                            <span>{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs md:text-sm font-medium leading-relaxed italic relative">
                                    <FileText size={14} className="absolute right-4 top-4 text-slate-200" />
                                    {leave.reason}
                                </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-none border-slate-50">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${getStatusColor(leave.status)}`}>
                                    {leave.status}
                                </span>
                                {user?.role === 'teacher' && leave.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(leave.id, 'approved')}
                                            className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                                            title="Approve Permit"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                            className="bg-rose-500 text-white p-3 rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100 active:scale-95 transition-all"
                                            title="Decline Permit"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {leaves.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[22px] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                <Clock size={32} />
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">No permit records found</p>
                                <p className="text-slate-300 text-[10px] mt-1 font-medium italic">Queue is currently clear.</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-8 relative">
                        <div className="p-3.5 bg-indigo-100 text-indigo-600 rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-none">New Protocol</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Please provide accurate reason and dates</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleApply} className="space-y-6 relative">
                        {user?.role === 'teacher' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Student</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <select
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                                        value={application.student_id}
                                        onChange={(e) => setApplication({ ...application, student_id: e.target.value })}
                                    >
                                        <option value="">Select Student...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Effective Date</label>
                                <input
                                    type="date" required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all"
                                    value={application.start_date}
                                    onChange={(e) => setApplication({ ...application, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Conclusion Date</label>
                                <input
                                    type="date" required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all"
                                    value={application.end_date}
                                    onChange={(e) => setApplication({ ...application, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Rationale</label>
                            <textarea
                                required rows="4"
                                placeholder="State the reason for your absence clearly..."
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all resize-none"
                                value={application.reason}
                                onChange={(e) => setApplication({ ...application, reason: e.target.value })}
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-5 rounded-xl md:rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] md:text-xs">
                            Submit Permit Application
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Leaves;

