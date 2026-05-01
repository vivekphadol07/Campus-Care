import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserPlus, Mail, Lock, Shield, Users, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const AddTeacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await api.get(API_PATHS.ADMIN.TEACHERS);
            setTeachers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`${API_PATHS.ADMIN.TEACHERS}/${editId}`, form);
                alert('Teacher updated successfully');
            } else {
                await api.post(API_PATHS.ADMIN.TEACHERS, form);
                alert('Teacher created successfully');
            }
            setForm({ name: '', email: '', password: '', role: 'teacher' });
            setEditId(null);
            fetchTeachers();
        } catch (err) {
            console.error(err);
            alert('Error saving teacher');
        }
    };

    const handleEdit = (teacher) => {
        setEditId(teacher.id);
        setForm({ name: teacher.name, email: teacher.email, password: '', role: teacher.role });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) return;
        try {
            await api.delete(`${API_PATHS.ADMIN.TEACHERS}/${id}`);
            fetchTeachers();
            alert('Teacher deleted');
        } catch (err) {
            console.error(err);
            alert('Error deleting teacher');
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 max-w-5xl mx-auto p-4 md:p-6">
            <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 w-fit mx-auto md:mx-0">
                        <UserPlus size={24} />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">{editId ? 'Update Faculty' : 'Faculty Registration'}</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all"
                                placeholder="e.g. John Doe"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all"
                                placeholder="teacher@school.com"
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                className="w-full pl-12 pr-12 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all"
                                placeholder={editId ? "Keep existing..." : "••••••••"}
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required={!editId}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Role</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-bold text-xs md:text-sm transition-all appearance-none cursor-pointer"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="teacher">Teacher</option>
                                <option value="admin">Administrator</option>
                                <option value="mess_owner">Mess Manager</option>
                                <option value="placement_cell">Placement Cell</option>
                            </select>
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4 flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl md:rounded-2xl transition-all shadow-xl shadow-emerald-100 uppercase text-[10px] md:text-xs tracking-widest active:scale-[0.98]">
                            {editId ? 'Update Faculty Record' : 'Register New Faculty'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setForm({ name: '', email: '', password: '', role: 'teacher' }); }}
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
                        <Users size={20} className="text-emerald-500" />
                        Faculty Registry
                    </h3>
                    <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
                        {teachers.length} Members
                    </span>
                </div>
                
                {/* Desktop List */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Full Name</th>
                                <th className="px-8 py-5">Email Address</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {teachers.map(t => (
                                <tr key={t.id} className="hover:bg-emerald-50/30 transition-all group">
                                    <td className="px-8 py-4 font-bold text-slate-700">{t.name}</td>
                                    <td className="px-8 py-4 text-slate-500 font-medium text-sm">{t.email}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {t.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit Faculty"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Remove Faculty"
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

                {/* Mobile List */}
                <div className="md:hidden divide-y divide-slate-50">
                    {teachers.map(t => (
                        <div key={t.id} className="p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black">
                                        {t.name?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-none mb-1">{t.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{t.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(t.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-lg">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authority Level</span>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${t.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {t.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddTeacher;
