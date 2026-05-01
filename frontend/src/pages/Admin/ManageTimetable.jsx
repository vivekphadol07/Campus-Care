import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit2, Save, X, BookOpen, User } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ManageTimetable = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newEntry, setNewEntry] = useState({
        teacher_id: '',
        subject: '',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00'
    });

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchTimetable();
        }
    }, [selectedClass]);

    const fetchMetadata = async () => {
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
            console.error("Error fetching metadata:", err);
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API_PATHS.TIMETABLE}?class_id=${selectedClass}`);
            setTimetable(res.data);
        } catch (err) {
            console.error("Error fetching timetable:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEntry = async () => {
        try {
            if (editingId) {
                await api.put(`${API_PATHS.TIMETABLE}/${editingId}`, newEntry);
            } else {
                await api.post(API_PATHS.TIMETABLE, { ...newEntry, class_id: selectedClass });
            }
            setShowAddModal(false);
            setEditingId(null);
            fetchTimetable();
            setNewEntry({
                teacher_id: '',
                subject: '',
                day_of_week: 'Monday',
                start_time: '09:00',
                end_time: '10:00'
            });
        } catch (err) {
            alert(err.response?.data?.error || "Error saving entry");
        }
    };

    const handleEditClick = (item) => {
        setNewEntry({
            teacher_id: item.teacher_id,
            subject: item.subject,
            day_of_week: item.day_of_week,
            start_time: item.start_time.slice(0, 5),
            end_time: item.end_time.slice(0, 5)
        });
        setEditingId(item.id);
        setShowAddModal(true);
    };

    const handleDeleteEntry = async (id) => {
        if (!window.confirm("Delete this timetable entry?")) return;
        try {
            await api.delete(`${API_PATHS.TIMETABLE}/${id}`);
            fetchTimetable();
        } catch (err) {
            console.error("Error deleting entry:", err);
        }
    };

    // Filter subjects based on selected teacher and current class
    const availableSubjects = assignments
        .filter(a => a.teacher_id == newEntry.teacher_id && a.class_id == selectedClass)
        .map(a => a.subject);

    return (
        <div className="space-y-6 md:space-y-10 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Master <span className="text-indigo-600">Timetable</span></h1>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-grow">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Select Target Class...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    {selectedClass && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setNewEntry({
                                    teacher_id: '',
                                    subject: '',
                                    day_of_week: 'Monday',
                                    start_time: '09:00',
                                    end_time: '10:00'
                                });
                                setShowAddModal(true);
                            }}
                            className="bg-indigo-600 text-white px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 uppercase text-[10px] md:text-xs tracking-widest active:scale-95"
                        >
                            <Plus size={18} />
                            Add Lecture
                        </button>
                    )}
                </div>
            </header>

            {!selectedClass ? (
                <div className="bg-white p-12 md:p-24 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm text-center">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-6 md:mb-8">
                        <Calendar size={48} md:size={64} />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Select a Class</h2>
                    <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Choose an academic group to view or modify schedule</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 md:gap-6">
                    {daysOfWeek.map(day => (
                        <div key={day} className="bg-white rounded-[1.2rem] md:rounded-[1.8rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group/day">
                            <div className="bg-slate-50 p-4 text-center border-b border-slate-100 group-hover/day:bg-indigo-50 transition-colors">
                                <span className="font-black text-slate-900 uppercase text-[9px] tracking-[0.2em]">{day}</span>
                            </div>
                            <div className="p-3 md:p-4 space-y-3 flex-grow min-h-[300px] md:min-h-[500px]">
                                {timetable.filter(t => t.day_of_week === day).map(item => (
                                    <div key={item.id} className="group p-3 md:p-4 bg-slate-50/50 rounded-xl md:rounded-2xl border-2 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all relative">
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEntry(item.id)}
                                                className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div className="font-black text-slate-800 text-[10px] md:text-xs tracking-tight mb-0.5">{item.subject}</div>
                                        <div className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3 truncate">{item.teacher_name}</div>
                                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-indigo-600 font-black bg-indigo-50/50 px-2 py-1 rounded-lg w-fit border border-indigo-100/50">
                                            <Clock size={12} />
                                            {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                        </div>
                                    </div>
                                ))}
                                {timetable.filter(t => t.day_of_week === day).length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                                        {(day === 'Saturday' || day === 'Sunday') ? (
                                            <div className="flex flex-col items-center">
                                                <div className="text-slate-200 font-black text-2xl tracking-tighter mb-1 uppercase">OFF</div>
                                                <div className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">Weekend</div>
                                            </div>
                                        ) : (
                                            <div className="italic text-slate-200 font-black text-[10px] uppercase tracking-widest">Free Slot</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6">
                    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        
                        <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 relative">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                                        {editingId ? 'Modify Lecture' : 'New Schedule Entry'}
                                    </h2>
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure time and faculty</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-slate-600 transition-all"><X size={24} /></button>
                        </div>
                        <div className="p-6 md:p-10 space-y-5 md:space-y-6 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day of Week</label>
                                    <select
                                        value={newEntry.day_of_week}
                                        onChange={(e) => setNewEntry({ ...newEntry, day_of_week: e.target.value })}
                                        className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                                    >
                                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Member</label>
                                    <select
                                        value={newEntry.teacher_id}
                                        onChange={(e) => setNewEntry({ ...newEntry, teacher_id: e.target.value, subject: '' })}
                                        className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">Select Faculty...</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lecture Subject</label>
                                <select
                                    value={newEntry.subject}
                                    onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                                    disabled={!newEntry.teacher_id}
                                    className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all disabled:opacity-50"
                                >
                                    <option value="">{newEntry.teacher_id ? 'Select Subject...' : 'Please select teacher first'}</option>
                                    {availableSubjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
                                </select>
                                {newEntry.teacher_id && availableSubjects.length === 0 && (
                                    <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-1 ml-1 flex items-center gap-1"><X size={10}/> No subjects assigned for this class.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Clock size={12}/> From</label>
                                    <input
                                        type="time"
                                        value={newEntry.start_time}
                                        onChange={(e) => {
                                            const start = e.target.value;
                                            if (!start) return;
                                            const [hours, minutes] = start.split(':').map(Number);
                                            const endHours = (hours + 1) % 24;
                                            const endStr = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                            setNewEntry({ ...newEntry, start_time: start, end_time: endStr });
                                        }}
                                        className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Clock size={12}/> To</label>
                                    <input
                                        type="time"
                                        value={newEntry.end_time}
                                        onChange={(e) => setNewEntry({ ...newEntry, end_time: e.target.value })}
                                        className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                <button
                                    onClick={handleSaveEntry}
                                    disabled={!newEntry.subject || !newEntry.teacher_id}
                                    className="flex-[2] py-4 md:py-5 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase text-[10px] md:text-xs tracking-[0.2em] active:scale-[0.98] disabled:opacity-50 order-1 sm:order-2"
                                >
                                    {editingId ? 'Update Schedule' : 'Confirm Entry'}
                                </button>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 md:py-5 bg-slate-100 text-slate-400 hover:text-slate-600 font-black rounded-xl md:rounded-2xl transition-all uppercase text-[10px] md:text-xs tracking-widest order-2 sm:order-1"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTimetable;
