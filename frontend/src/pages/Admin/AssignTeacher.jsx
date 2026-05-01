import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Link2, Users, BookOpen, GraduationCap, Trash2, Clock } from 'lucide-react';

const AssignTeacher = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assign, setAssign] = useState({ teacher_id: '', class_id: '', subject: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, tRes, aRes] = await Promise.all([
                api.get(API_PATHS.ADMIN.CLASSES),
                api.get(API_PATHS.ADMIN.TEACHERS),
                api.get(API_PATHS.ADMIN.ASSIGNMENTS)
            ]);
            setClasses(cRes.data);
            setTeachers(tRes.data);
            setAssignments(aRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post(API_PATHS.ADMIN.ASSIGN_SUBJECT, assign);
            setAssign({ teacher_id: '', class_id: '', subject: '' });
            alert('Assignment successful');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error assigning teacher');
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('Remove this assignment?')) return;
        try {
            await api.delete(`${API_PATHS.ADMIN.ASSIGNMENTS}/${id}`);
            fetchData();
            alert('Assignment removed');
        } catch (err) {
            console.error(err);
            alert('Error removing assignment');
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 max-w-5xl mx-auto p-4 md:p-6">
            <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600 w-fit mx-auto md:mx-0">
                        <Link2 size={24} />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">Subject Assignment</h2>
                    </div>
                </div>

                <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Member</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-purple-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all appearance-none cursor-pointer"
                                value={assign.teacher_id}
                                onChange={e => setAssign({ ...assign, teacher_id: e.target.value })}
                                required
                            >
                                <option value="">Select Faculty...</option>
                                {teachers.filter(t => t.role !== 'admin').map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Class</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-purple-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all appearance-none cursor-pointer"
                                value={assign.class_id}
                                onChange={e => setAssign({ ...assign, class_id: e.target.value })}
                                required
                            >
                                <option value="">Select Class...</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-purple-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all"
                                placeholder="e.g. Mathematics"
                                value={assign.subject}
                                onChange={e => setAssign({ ...assign, subject: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3 mt-4">
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl md:rounded-2xl transition-all shadow-xl shadow-purple-100 uppercase text-[10px] md:text-xs tracking-[0.2em] active:scale-[0.98]">
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                        <Link2 size={20} className="text-purple-500" />
                        Active Assignments
                    </h3>
                    <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
                        {assignments.length} Total
                    </span>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Faculty</th>
                                <th className="px-8 py-5">Class</th>
                                <th className="px-8 py-5">Subject Area</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {assignments.map((as, idx) => (
                                <tr key={idx} className="hover:bg-purple-50/30 transition-all group">
                                    <td className="px-8 py-4 font-bold text-slate-700">{as.teacher_name}</td>
                                    <td className="px-8 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest">{as.class_name}</td>
                                    <td className="px-8 py-4">
                                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {as.subject}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button onClick={() => handleDeleteAssignment(as.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50">
                    {assignments.map((as, idx) => (
                        <div key={idx} className="p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black">
                                        {as.teacher_name?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-none mb-1">{as.teacher_name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{as.class_name}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteAssignment(as.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-50">
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">Teaching Subject</span>
                                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{as.subject}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default AssignTeacher;
