import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { BookOpen, UserCircle, Plus, Pencil, Trash2 } from 'lucide-react';

const AddClass = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', class_teacher_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, tRes] = await Promise.all([
                api.get(API_PATHS.ADMIN.CLASSES),
                api.get(API_PATHS.ADMIN.TEACHERS)
            ]);
            setClasses(cRes.data);
            setTeachers(tRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`${API_PATHS.ADMIN.CLASSES}/${editId}`, form);
                alert('Class updated successfully');
            } else {
                await api.post(API_PATHS.ADMIN.CLASSES, form);
                alert('Class created successfully');
            }
            setForm({ name: '', class_teacher_id: '' });
            setEditId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error saving class');
        }
    };

    const handleEdit = (c) => {
        setEditId(c.id);
        setForm({ name: c.name, class_teacher_id: c.class_teacher_id || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await api.delete(`${API_PATHS.ADMIN.CLASSES}/${id}`);
            fetchData();
            alert('Class deleted');
        } catch (err) {
            console.error(err);
            alert('Error deleting class');
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 max-w-5xl mx-auto p-4 md:p-6">
            <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
                    <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 w-fit mx-auto md:mx-0">
                        <Plus size={24} />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">{editId ? 'Update Class' : 'Create New Class'}</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class Name</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-indigo-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all"
                                placeholder="e.g. 10-A"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class Teacher (Optional)</label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-indigo-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all appearance-none cursor-pointer"
                                value={form.class_teacher_id}
                                onChange={e => setForm({ ...form, class_teacher_id: e.target.value })}
                            >
                                <option value="">None / Not Assigned</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4 flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl md:rounded-2xl transition-all shadow-xl shadow-indigo-100 uppercase text-[10px] md:text-xs tracking-widest active:scale-[0.98]">
                            {editId ? 'Update Class Details' : 'Create New Class'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setForm({ name: '', class_teacher_id: '' }); }}
                                className="sm:w-48 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-xl md:rounded-2xl transition-all text-[10px] md:text-xs uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-black text-base md:text-lg text-slate-900 flex items-center gap-2">
                        <BookOpen size={20} className="text-emerald-500" />
                        Class Registry
                    </h3>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Academic Group</th>
                                <th className="px-8 py-5">Lead Faculty</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {classes.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-8 py-4 font-bold text-slate-700">{c.name}</td>
                                    <td className="px-8 py-4 text-slate-500 font-medium text-sm">
                                        {c.class_teacher_name || <span className="text-slate-300 italic">Not Assigned</span>}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit Class"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete Class"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50">
                    {classes.map(c => (
                        <div key={c.id} className="p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black">
                                        {c.name?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-none mb-1">{c.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.class_teacher_name || 'No Lead Faculty'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Pencil size={16}/></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddClass;
