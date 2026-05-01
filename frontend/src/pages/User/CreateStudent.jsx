import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserPlus, GraduationCap, Mail, Hash, BookOpen, Pencil, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../../context/userContext';

const CreateStudent = () => {
    const { user } = useUser();
    const [classes, setClasses] = useState([]);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', roll_number: '', email: '', class_id: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [cRes, sRes] = await Promise.all([
                api.get(API_PATHS.ADMIN.CLASSES),
                api.get(API_PATHS.STUDENTS)
            ]);
            const classesData = cRes.data;
            setClasses(classesData);
            setStudents(sRes.data.sort((a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true, sensitivity: 'base' })));

            // Default class for teacher - use string comparison for IDs
            if (user?.role === 'teacher') {
                const assignedClass = classesData.find(c => String(c.class_teacher_id) === String(user.id));
                if (assignedClass) {
                    setForm(prev => ({ ...prev, class_id: String(assignedClass.id) }));
                }
            }
        } catch (err) {
            console.error("Fetch Data Error:", err);
        }
    };

    const resetForm = () => {
        setEditId(null);
        let defaultClassId = '';
        if (user?.role === 'teacher') {
            const assignedClass = classes.find(c => String(c.class_teacher_id) === String(user.id));
            if (assignedClass) defaultClassId = String(assignedClass.id);
        }
        setForm({ name: '', roll_number: '', email: '', class_id: defaultClassId, password: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`${API_PATHS.STUDENTS}/${editId}`, form);
                alert('Student updated successfully');
            } else {
                await api.post(API_PATHS.STUDENTS, form);
                alert('Student created successfully');
            }
            resetForm();
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error saving student');
        }
    };

    const handleEdit = (s) => {
        setEditId(s.id);
        setForm({ name: s.name, roll_number: s.roll_number, email: s.email, class_id: s.class_id || '', password: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await api.delete(`${API_PATHS.STUDENTS}/${id}`);
            fetchData();
            alert('Student deleted');
        } catch (err) {
            console.error(err);
            alert('Error deleting student');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-12 p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Enrollment</span></h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                    <UserPlus size={18} className="text-indigo-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Registrar Active</span>
                </div>
            </header>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap size={14} /> Full Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Alice Wonderland"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-xs transition-all"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash size={14} /> Roll Number
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. S1001"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-xs transition-all"
                            value={form.roll_number}
                            onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={14} /> Email Address
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="alice@school.com"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-xs transition-all"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Lock size={14} /> Credential
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={editId ? "Update password (optional)" : "Assign access code"}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-xs transition-all pr-12"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={14} /> Division
                        </label>
                        <select
                            className="w-full px-5 py-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-indigo-900 text-xs md:text-xs transition-all appearance-none cursor-pointer"
                            required
                            value={String(form.class_id || '')}
                            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                        >
                            {user?.role === 'admin' && <option value="">Select Division...</option>}
                            {classes
                                .filter(c => user?.role === 'admin' || String(c.class_teacher_id) === String(user?.id))
                                .map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2 pt-6 flex flex-col sm:flex-row gap-4">
                        <button type="submit" className="flex-1 px-10 py-5 bg-indigo-600 text-white font-bold rounded-xl md:rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-wider active:scale-95">
                            <UserPlus size={20} /> {editId ? 'Apply Updates' : 'Confirm Enrollment'}
                        </button>
                        {(editId || form.name || form.roll_number || form.email) && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-500 font-bold rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest active:scale-95"
                            >
                                Reset Form
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h3 className="font-bold text-slate-900 text-lg uppercase tracking-widest">Active Roster</h3>
                </div>
                
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Full Name</th>
                                <th className="px-8 py-5">Roll Identifer</th>
                                <th className="px-8 py-5">Division</th>
                                <th className="px-8 py-5 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.map((s, idx) => (
                                <tr key={idx} className="hover:bg-indigo-50/30 transition-all group">
                                    <td className="px-8 py-5 font-bold text-slate-900 text-xs md:text-xs">{s.name}</td>
                                    <td className="px-8 py-5 font-bold text-indigo-600 text-xs bg-indigo-50/20">{s.roll_number}</td>
                                    <td className="px-8 py-5 font-bold text-slate-500 text-xs uppercase tracking-widest">{classes.find(c => c.id === s.class_id)?.name || 'Unassigned'}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-3">
                                            {(user?.role === 'admin' || (user?.role === 'teacher' && classes.find(c => c.id === s.class_id)?.class_teacher_id === user?.id)) ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(s)}
                                                        className="p-3 bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Edit Profile"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s.id)}
                                                        className="p-3 bg-slate-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Revoke Enrollment"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Immutable</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50">
                    {students.map((s, idx) => (
                        <div key={idx} className="p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900 leading-none mb-1.5">{s.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-widest">{s.roll_number}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{classes.find(c => c.id === s.class_id)?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(user?.role === 'admin' || (user?.role === 'teacher' && classes.find(c => c.id === s.class_id)?.class_teacher_id === user?.id)) && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl active:scale-95"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl active:scale-95"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreateStudent;
