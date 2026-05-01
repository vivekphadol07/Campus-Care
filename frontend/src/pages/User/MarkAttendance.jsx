import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { CheckCircle, XCircle, Clock, Save, Search, BookOpen, Users, Calendar } from 'lucide-react';
import { useUser } from '../../context/userContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MarkAttendance = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { class_id: passedClassId, subject: passedSubject, start_time: passedStartTime, end_time: passedEndTime } = location.state || {};
    const { user } = useUser();
    const [assignments, setAssignments] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAssignments();
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            const [assRes, timeRes] = await Promise.all([
                api.get(API_PATHS.TEACHER.ASSIGNMENTS(user.id)),
                api.get(`${API_PATHS.TIMETABLE}?teacher_id=${user.id}`)
            ]);

            setAssignments(assRes.data);
            const standardizedTimetable = timeRes.data.map(t => ({
                ...t,
                start_time: t.start_time?.slice(0, 5) || '',
                end_time: t.end_time?.slice(0, 5) || ''
            }));
            setTimetable(standardizedTimetable);

            if (passedSubject && passedClassId && passedStartTime) {
                // Priority: Deep-link state from dashboard
                setSelectedClass(passedClassId);
                setSelectedSubject(passedSubject);
                setStartTime(passedStartTime.slice(0, 5));
                setEndTime(passedEndTime?.slice(0, 5) || '');

                // Try to find if this matches a session ID
                const match = standardizedTimetable.find(t =>
                    t.class_id == passedClassId &&
                    t.subject === passedSubject &&
                    t.start_time === passedStartTime.slice(0, 5)
                );
                if (match) setSelectedSessionId(match.id);
            } else if (assRes.data.length > 0) {
                // Default to first assignment
                const first = assRes.data[0];
                setSelectedClass(first.class_id);
                setSelectedSubject(first.subject);
            }
        } catch (err) {
            console.error("Error fetching assignments:", err);
        }
    };

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedClass, selectedSubject, date, startTime]);

    // Calculate available sessions based on date, class, and subject
    const getAvailableSessions = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDay = days[new Date(date).getDay()];

        return timetable.filter(t =>
            t.class_id == selectedClass &&
            t.subject === selectedSubject &&
            t.day_of_week === selectedDay
        );
    };

    const availableSessions = getAvailableSessions();

    const handleSessionChange = (sessionId) => {
        setSelectedSessionId(sessionId);
        const session = timetable.find(t => t.id == sessionId);
        if (session) {
            setStartTime(session.start_time);
            setEndTime(session.end_time);
        }
    };

    const fetchStudents = async () => {
        setFetchingStudents(true);
        try {
            const res = await api.get(`${API_PATHS.STUDENTS}?class_id=${selectedClass}`);
            const filtered = res.data; // Backend already filters now
            const sorted = filtered.sort((a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true, sensitivity: 'base' }));
            setStudents(sorted);

            // Fetch existing attendance for this date, subject, and time
            let attendanceUrl = `${API_PATHS.ATTENDANCE}?date=${date}`;
            if (selectedSubject) attendanceUrl += `&subject=${selectedSubject}`;
            if (startTime) attendanceUrl += `&start_time=${startTime}`;
            const attRes = await api.get(attendanceUrl);

            const initial = {};
            if (attRes.data.length > 0) {
                setIsAlreadyMarked(true);
                // Load existing status
                attRes.data.forEach(r => {
                    initial[r.student_id] = r.status;
                });
                // Find any students not in the attendance list and default them to present
                filtered.forEach(s => {
                    if (!initial[s.id]) initial[s.id] = 'present';
                });
            } else {
                setIsAlreadyMarked(false);
                // Default everyone to present
                filtered.forEach(s => initial[s.id] = 'present');
            }
            setAttendance(initial);
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleMark = (id, status) => {
        setAttendance({ ...attendance, [id]: status });
    };

    const handleSave = async () => {
        if (!selectedSubject) {
            alert("Please select a subject");
            return;
        }

        if (!startTime || !endTime) {
            alert("Please select start and end times");
            return;
        }

        // Validate duration is at least 60 minutes
        const [sH, sM] = startTime.split(':').map(Number);
        const [eH, eM] = endTime.split(':').map(Number);
        const diff = (eH * 60 + eM) - (sH * 60 + sM);

        if (diff < 60 && diff >= 0) {
            alert("Lecture duration must be at least 1 hour (60 minutes)");
            return;
        }
        if (diff < 0) {
            alert("End time cannot be before start time");
            return;
        }

        setLoading(true);
        try {
            const promises = Object.entries(attendance).map(([student_id, status]) =>
                api.post(API_PATHS.ATTENDANCE, {
                    student_id,
                    status,
                    date,
                    subject: selectedSubject,
                    start_time: startTime,
                    end_time: endTime
                })
            );
            await Promise.all(promises);
            const timeStr = startTime ? ` (${startTime} - ${endTime})` : '';
            alert(`Attendance recorded successfully for ${selectedSubject}${timeStr}`);
            setIsAlreadyMarked(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error saving attendance');
        } finally {
            setLoading(false);
        }
    };

    // Get unique classes from assignments
    const uniqueClasses = Array.from(new Set(assignments.map(a => JSON.stringify({ id: a.class_id, name: a.class_name }))))
        .map(s => JSON.parse(s));

    // Get subjects for selected class
    const availableSubjects = assignments.filter(a => a.class_id == selectedClass).map(a => a.subject);

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-12 p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Registry</span></h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-100 group focus-within:bg-white focus-within:border-indigo-500 transition-all">
                    <Calendar size={20} className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="date"
                        value={date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent outline-none font-black text-slate-700 text-xs md:text-sm cursor-pointer"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                <div className="md:col-span-3 bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Users size={18} />
                        <h2 className="font-black text-[10px] md:text-xs uppercase tracking-widest">Academic Group</h2>
                    </div>
                    <select
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            const firstSub = assignments.find(a => a.class_id == e.target.value)?.subject;
                            setSelectedSubject(firstSub || '');
                        }}
                        className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Choose Class...</option>
                        {uniqueClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-3 bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <BookOpen size={18} />
                        <h2 className="font-black text-[10px] md:text-xs uppercase tracking-widest">Subject Context</h2>
                    </div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!selectedClass}
                        className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="">Subject...</option>
                        {availableSubjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-6 bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Clock size={18} />
                        <h2 className="font-black text-[10px] md:text-xs uppercase tracking-widest">Temporal Window</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            {availableSessions.length > 0 ? (
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => handleSessionChange(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Session...</option>
                                    {availableSessions.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.start_time} - {s.end_time} (Live)
                                        </option>
                                    ))}
                                    <option value="manual">Manual Entry...</option>
                                </select>
                            ) : (
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 text-center">
                                    No Scheduled Sequence
                                </div>
                            )}
                        </div>

                        {(availableSessions.length === 0 || selectedSessionId === 'manual') && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        setStartTime(e.target.value);
                                        const [h, m] = e.target.value.split(':').map(Number);
                                        const nextH = (h + 1) % 24;
                                        setEndTime(`${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                                    }}
                                    className="flex-1 px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs transition-all"
                                />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="flex-1 px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs transition-all"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAlreadyMarked && (
                <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in duration-700">
                    <div className="flex items-center gap-6 text-emerald-700 text-center md:text-left">
                        <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl md:text-2xl tracking-tight leading-none mb-2">Registry Finalized</h3>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-70">Records successfully synchronized with main server</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/teacher/attendance', {
                            state: {
                                class_id: selectedClass,
                                subject: selectedSubject,
                                start_time: startTime
                            }
                        })}
                        className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 uppercase text-[10px] tracking-widest active:scale-95"
                    >
                        View Official Logs
                    </button>
                </div>
            )}

            {!isAlreadyMarked && (
                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Identity</th>
                                    <th className="px-8 py-6">Unique Roll No</th>
                                    <th className="px-8 py-6 text-center">Status Assignment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {fetchingStudents ? (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 animate-pulse">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><Users size={24}/></div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Roster...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-indigo-50/30 transition-all group">
                                            <td className="px-8 py-5 font-black text-slate-900 text-sm md:text-base">{student.name}</td>
                                            <td className="px-8 py-5 font-black text-slate-400 text-xs">{student.roll_number}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button
                                                        onClick={() => handleMark(student.id, 'present')}
                                                        className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 ${attendance[student.id] === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50'}`}
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span className="text-[10px] font-black uppercase">Present</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMark(student.id, 'absent')}
                                                        className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 ${attendance[student.id] === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 text-slate-400 hover:bg-rose-50'}`}
                                                    >
                                                        <XCircle size={18} />
                                                        <span className="text-[10px] font-black uppercase">Absent</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Users size={64} className="text-slate-300" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                                    {selectedClass ? "Roster Empty" : "Awaiting Division Selection"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y divide-slate-50">
                        {fetchingStudents ? (
                             <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Synchronizing...</div>
                        ) : students.length > 0 ? (
                            students.map((student) => (
                                <div key={student.id} className="p-6 flex flex-col gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">
                                            {student.roll_number}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-none mb-1.5">{student.name}</h4>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrolled Member</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleMark(student.id, 'present')}
                                            className={`py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${attendance[student.id] === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400'}`}
                                        >
                                            <CheckCircle size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Present</span>
                                        </button>
                                        <button
                                            onClick={() => handleMark(student.id, 'absent')}
                                            className={`py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${attendance[student.id] === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 text-slate-400'}`}
                                        >
                                            <XCircle size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Absent</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-300 font-black uppercase tracking-widest text-[8px]">No Members Found</div>
                        )}
                    </div>

                    <div className="p-6 md:p-10 bg-slate-50/50 border-t border-slate-100 flex justify-center md:justify-end">
                        <button
                            disabled={loading || students.length === 0}
                            onClick={handleSave}
                            className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase text-[10px] tracking-[0.2em] active:scale-95"
                        >
                            <Save size={22} />
                            {loading ? 'Transmitting...' : 'Commit Records'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
