import React, { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Plus, Search, Trash2, Eye, Users } from 'lucide-react';
import { useUser } from '../../context/userContext';
import { Link } from 'react-router-dom';

const Students = () => {
    const { user } = useUser();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get(API_PATHS.STUDENTS);
            const sorted = res.data.sort((a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true, sensitivity: 'base' }));
            setStudents(sorted);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await api.delete(`${API_PATHS.STUDENTS}/${id}`);
            fetchStudents();
            alert('Student deleted safely');
        } catch (err) {
            console.error(err);
            alert('Error deleting student. It might have associated attendance or leave records.');
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Institutional <span className="text-blue-600">Students Records</span></h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 relative z-10">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-[10px] md:text-xs font-black text-slate-600 uppercase tracking-widest">{students.length} Verified Records</span>
                </div>
            </header>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-6 border-b border-slate-100">Student Name</th>
                                <th className="px-8 py-6 border-b border-slate-100">Roll No</th>
                                <th className="px-8 py-6 border-b border-slate-100">Class</th>
                                <th className="px-8 py-6 border-b border-slate-100">Email Address</th>
                                <th className="px-8 py-6 border-b border-slate-100 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                                    {student.name?.[0]}
                                                </div>
                                                <span className="font-bold text-slate-700">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">{student.roll_number}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {student.class_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 text-xs font-medium">{student.email}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {(user?.role === 'admin' || (user?.role === 'teacher' && String(user.id) === String(student.class_teacher_id))) ? (
                                                    <>
                                                        <Link
                                                            to={`/${user.role}/profile/${student.id}`}
                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="View Profile"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(student.id)}
                                                            className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Restricted</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200"><Users size={32} /></div>
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No student records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {students.length > 0 ? (
                        students.map((student) => (
                            <div key={student.id} className="p-5 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                            {student.name?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm leading-none mb-1">{student.name}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.roll_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {(user?.role === 'admin' || (user?.role === 'teacher' && String(user.id) === String(student.class_teacher_id))) ? (
                                            <>
                                                <Link
                                                    to={`/${user.role}/profile/${student.id}`}
                                                    className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-rose-600 bg-rose-50 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Restricted</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Class</span>
                                        <span className="text-xs font-bold text-slate-700">{student.class_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{student.email}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200"><Users size={24} /></div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No records</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;
