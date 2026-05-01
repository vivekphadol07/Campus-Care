import React, { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Save, CheckCircle, XCircle, Clock, BookOpen, Users, Calendar, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/userContext';

const Attendance = () => {
    const { user } = useUser();
    const location = useLocation();
    const { class_id: initialClassId, class_name: initialClassName, subject: initialSubject, start_time: initialStartTime } = location.state || {};

    const [assignments, setAssignments] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(initialClassId || '');
    const [selectedSubject, setSelectedSubject] = useState(initialSubject || '');
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [pendingChanges, setPendingChanges] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [metaLoading, setMetaLoading] = useState(true);
    const [timetable, setTimetable] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [studentStats, setStudentStats] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMetaData();
        }
    }, [user]);

    const fetchMetaData = async () => {
        try {
            setMetaLoading(true);
            if (user.role === 'teacher') {
                const [aRes, tRes] = await Promise.all([
                    api.get(API_PATHS.TEACHER.ASSIGNMENTS(user.id)),
                    api.get(`${API_PATHS.TIMETABLE}?teacher_id=${user.id}`)
                ]);

                // Standardize times to HH:mm
                const standardizedTimetable = tRes.data.map(t => ({
                    ...t,
                    start_time: t.start_time?.slice(0, 5) || '',
                    end_time: t.end_time?.slice(0, 5) || ''
                }));
                const standardizedAssignments = aRes.data.map(a => ({
                    ...a,
                    start_time: a.start_time?.slice(0, 5) || '',
                    end_time: a.end_time?.slice(0, 5) || ''
                }));

                setTimetable(standardizedTimetable);
                setAssignments(standardizedTimetable.length > 0 ? standardizedTimetable : standardizedAssignments);

                // Priority: Deep-link state > Timetable > Assignments
                if (initialClassId) {
                    setSelectedClassId(initialClassId);
                    setSelectedSubject(initialSubject || '');
                    const time = initialStartTime?.slice(0, 5) || '';
                    setSelectedStartTime(time);

                    // Try matching session ID
                    const match = standardizedTimetable.find(t =>
                        t.class_id == initialClassId &&
                        t.subject === initialSubject &&
                        t.start_time === time
                    );
                    if (match) setSelectedSessionId(match.id);
                } else if (standardizedTimetable.length > 0) {
                    const first = standardizedTimetable[0];
                    setSelectedClassId(first.class_id);
                    setSelectedSubject(first.subject);
                    setSelectedStartTime(first.start_time);
                    setSelectedSessionId(first.id);
                } else if (standardizedAssignments.length > 0) {
                    const first = standardizedAssignments[0];
                    setSelectedClassId(first.class_id);
                    setSelectedSubject(first.subject);
                    setSelectedStartTime(first.start_time);
                }
            } else if (user.role === 'admin') {
                const [cRes, tRes] = await Promise.all([
                    api.get(API_PATHS.ADMIN.CLASSES),
                    api.get(API_PATHS.TIMETABLE)
                ]);

                const standardizedTimetable = tRes.data.map(t => ({
                    ...t,
                    start_time: t.start_time?.slice(0, 5) || '',
                    end_time: t.end_time?.slice(0, 5) || ''
                }));

                setAllClasses(cRes.data);
                setTimetable(standardizedTimetable);
                setAssignments(standardizedTimetable);

                if (initialClassId) {
                    setSelectedClassId(initialClassId);
                    setSelectedSubject(initialSubject || '');
                    setSelectedStartTime(initialStartTime?.slice(0, 5) || '');
                } else if (cRes.data.length > 0) {
                    setSelectedClassId(cRes.data[0].id);
                    const classAss = standardizedTimetable.find(a => a.class_id == cRes.data[0].id);
                    if (classAss) {
                        setSelectedSubject(classAss.subject);
                        setSelectedStartTime(classAss.start_time);
                        setSelectedSessionId(classAss.id);
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching metadata:", err);
        } finally {
            setMetaLoading(false);
        }
    };

    const [studentSubjects, setStudentSubjects] = useState([]);
    const [studentRecords, setStudentRecords] = useState([]);

    useEffect(() => {
        if (selectedClassId || user?.role === 'student') {
            fetchStudentsAndAttendance();
            if (user?.role === 'student') {
                if (user.class_id) fetchStudentSubjects();
                fetchStudentStats();
            }
        } else {
            setStudents([]);
            setAttendance({});
        }
        setPendingChanges({});
        setIsEditing(false);
    }, [date, selectedSubject, selectedClassId, selectedStartTime, user]);

    const fetchStudentStats = async () => {
        try {
            const res = await api.get(`${API_PATHS.STATS.STUDENT}/${user.id}`);
            setStudentStats(res.data);
            // If class_id was missing in user context, fetch subjects now
            if (!user.class_id && res.data.classId) {
                fetchStudentSubjects(res.data.classId);
            }
        } catch (err) {
            console.error("Error fetching student stats:", err);
        }
    };

    const fetchStudentSubjects = async (fallbackClassId) => {
        const classId = user.class_id || fallbackClassId;
        if (!classId) return;
        try {
            const res = await api.get(`${API_PATHS.TIMETABLE}?class_id=${classId}`);
            const subjects = Array.from(new Set(res.data.map(t => t.subject)));
            setStudentSubjects(subjects);
        } catch (err) {
            console.error("Error fetching student subjects:", err);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        try {
            setLoading(true);
            if (user.role === 'student') {
                // Personal history view for student - show all by default
                let url = `${API_PATHS.ATTENDANCE}?student_id=${user.id}`;
                if (selectedSubject) url += `&subject=${selectedSubject}`;
                // Removed date filter for student history view as per request
                // if (date) url += `&date=${date}`;

                const res = await api.get(url);
                setStudentRecords(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } else {
                // Class register view for teacher/admin
                const studentsRes = await api.get(`${API_PATHS.STUDENTS}?class_id=${selectedClassId}`);
                const filteredStudents = studentsRes.data
                    .sort((a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true, sensitivity: 'base' }));
                setStudents(filteredStudents);

                let attendanceUrl = `${API_PATHS.ATTENDANCE}?date=${date}`;
                if (selectedSubject) attendanceUrl += `&subject=${selectedSubject}`;
                if (selectedStartTime) attendanceUrl += `&start_time=${selectedStartTime}`;

                const attendanceRes = await api.get(attendanceUrl);
                const attendanceMap = {};
                attendanceRes.data.forEach(record => {
                    attendanceMap[record.student_id] = record.status;
                });
                setAttendance(attendanceMap);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Derived state
    const classesToPick = user?.role === 'admin' ? allClasses :
        Array.from(new Set(assignments.map(a => JSON.stringify({ id: a.class_id, name: a.class_name }))))
            .map(s => JSON.parse(s));

    const getAvailableSessions = () => {
        if (!selectedClassId || !selectedSubject) return [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDay = days[new Date(date).getDay()];

        return assignments.filter(a =>
            a.class_id == selectedClassId &&
            a.subject === selectedSubject &&
            a.day_of_week === selectedDay
        );
    };

    const availableSessions = getAvailableSessions();

    // Handlers
    const handleSessionChange = (sessionId) => {
        setSelectedSessionId(sessionId);
        if (sessionId === 'manual') return;
        const session = assignments.find(s => s.id == sessionId);
        if (session) {
            setSelectedStartTime(session.start_time);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setPendingChanges(prev => ({ ...prev, [studentId]: status }));
    };

    const submitBatchUpdate = async () => {
        setSaving(true);
        try {
            const promises = Object.entries(pendingChanges).map(([student_id, status]) => {
                // Find end_time for this session if it exists
                const session = assignments.find(a =>
                    a.class_id == selectedClassId &&
                    a.subject === selectedSubject &&
                    a.start_time === selectedStartTime
                );

                return api.post(API_PATHS.ATTENDANCE, {
                    student_id,
                    status,
                    date,
                    subject: selectedSubject,
                    start_time: selectedStartTime,
                    end_time: session?.end_time || null
                });
            });

            await Promise.all(promises);
            setAttendance(prev => ({ ...prev, ...pendingChanges }));
            setPendingChanges({});
            setIsEditing(false);
            alert("Attendance updated successfully!");
        } catch (err) {
            console.error("Failed to save attendance:", err);
            alert(err.response?.data?.error || "Error saving attendance");
        } finally {
            setSaving(false);
        }
    };

    // Personal student view
    if (user?.role === 'student') {
        const groupedRecords = studentRecords.reduce((acc, record) => {
            if (record.status === 'leave') return acc;
            if (!acc[record.subject]) acc[record.subject] = [];
            acc[record.subject].push(record);
            return acc;
        }, {});

        // Ensure all assigned subjects are present even if no attendance marked
        studentSubjects.forEach(sub => {
            if (!groupedRecords[sub]) groupedRecords[sub] = [];
        });

        return (
            <div className="space-y-4 md:space-y-8 max-w-6xl mx-auto p-4 md:p-6">
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 bg-white p-5 md:p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="text-center md:text-left">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Attendance <span className="text-indigo-600">Analytics</span></h2>
                    </div>
                    {studentStats && (
                        <div className="w-full md:w-auto bg-slate-50/50 px-6 py-4 rounded-[1.2rem] md:rounded-[1.8rem] border border-indigo-50 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Global Status</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl md:text-3xl font-bold text-slate-900">{studentStats.overallPercentage}%</span>
                                    {studentStats.leaveBonus > 0 && (
                                        <span className="text-[9px] md:text-xs font-bold text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                                            <span>✨</span> +{studentStats.leaveBonus}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                <div className="space-y-3 md:space-y-4">
                    {Object.keys(groupedRecords).sort().map((subName) => {
                        const records = groupedRecords[subName];
                        const presentCount = records.filter(r => r.status === 'present').length;
                        const percentage = records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0.0";
                        const isExpanded = expandedSubject === subName;

                        return (
                            <div key={subName} className={`bg-white rounded-[1.2rem] md:rounded-[22px] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-200 shadow-xl shadow-indigo-500/5' : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50/30'}`}>
                                <button
                                    onClick={() => setExpandedSubject(isExpanded ? null : subName)}
                                    className="w-full p-5 md:p-8 flex items-center justify-between text-left group"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-500 ${isExpanded ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                                            <BookOpen size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm md:text-lg leading-none mb-1.5">{subName}</h3>
                                            <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">{records.length} Recorded Sessions</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 md:gap-10">
                                        <div className="text-right">
                                            <div className={`text-lg md:text-2xl font-bold tracking-tighter ${parseFloat(percentage) >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {percentage}%
                                            </div>
                                            <div className="text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-widest">Marked Presence</div>
                                        </div>
                                        <div className={`p-2 rounded-xl transition-all duration-500 ${isExpanded ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'text-slate-200'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-5 md:px-8 pb-5 md:pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-slate-50/50 rounded-2xl md:rounded-3xl p-1 md:p-2 border border-slate-100/50 overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">
                                                        <th className="py-4 px-4">Calendar Date</th>
                                                        <th className="py-4 px-4">Time Interval</th>
                                                        <th className="py-4 px-4 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100/50">
                                                    {records.length > 0 ? (
                                                        records.map((record) => (
                                                            <tr key={record.id} className="group/row">
                                                                <td className="py-4 px-4 font-bold text-slate-700 text-[11px] md:text-xs">
                                                                    {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </td>
                                                                <td className="py-4 px-4 text-slate-400 font-bold text-[9px] md:text-[11px] uppercase tracking-tight">
                                                                    {record.start_time?.slice(0, 5)} - {record.end_time?.slice(0, 5)}
                                                                </td>
                                                                <td className="py-4 px-4 text-center">
                                                                    <span className={`px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                        {record.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="py-12 text-center">
                                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                                    <Calendar size={40} className="text-slate-400" />
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No session records available</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Leave Credit Section */}
                    {studentStats?.leaveBonus > 0 && (
                        <div className="bg-white rounded-[22px] border border-amber-100 shadow-lg shadow-amber-500/5 p-5 md:p-6 flex items-center justify-between mt-12 group">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 scale-110">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base md:text-xl leading-none mb-1.5">Leave Credits Applied</h3>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Institutional application bonus
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl md:text-4xl font-bold text-amber-500 tracking-tighter">
                                    +{studentStats.leaveBonus}%
                                </div>
                                <div className="text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-widest">Stat Enhancement</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Register</span></h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-100 group focus-within:bg-white focus-within:border-indigo-500 transition-all">
                    <Calendar size={20} className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent outline-none font-bold text-slate-700 text-xs md:text-sm cursor-pointer"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-white p-5 md:p-6 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <div className="p-2 bg-indigo-50 rounded-lg"><Users size={18} /></div>
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-widest">Academic Group</h3>
                    </div>
                    <div className="relative">
                        <select
                            className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                            value={selectedClassId}
                            onChange={(e) => {
                                setSelectedClassId(e.target.value);
                                const firstAss = assignments.find(a => a.class_id == e.target.value);
                                setSelectedSubject(firstAss?.subject || '');
                                setSelectedStartTime(firstAss?.start_time || '');
                            }}
                        >
                            <option value="">Select Target Class...</option>
                            {classesToPick.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                    </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <div className="p-2 bg-indigo-50 rounded-lg"><BookOpen size={18} /></div>
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-widest">Subject Context</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                            <select
                                className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="">Subject...</option>
                                {Array.from(new Set(assignments.filter(a => a.class_id == selectedClassId).map(a => a.subject))).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                        </div>

                        <div className="relative">
                            <select
                                className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 text-xs md:text-sm appearance-none cursor-pointer transition-all"
                                value={selectedSessionId}
                                onChange={(e) => handleSessionChange(e.target.value)}
                            >
                                {availableSessions.length > 0 ? (
                                    <>
                                        <option value="">Choose Slot...</option>
                                        {availableSessions.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.start_time} - {s.end_time}
                                            </option>
                                        ))}
                                        <option value="manual">Manual Entry...</option>
                                    </>
                                ) : (
                                    <option value="">No Schedule</option>
                                )}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Timetable Validation Message */}
            {(() => {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const selectedDay = days[new Date(date).getDay()];
                const isScheduled = assignments.some(a =>
                    a.class_id == selectedClassId &&
                    a.subject === selectedSubject &&
                    a.start_time === selectedStartTime &&
                    a.day_of_week === selectedDay
                );

                if (selectedClassId && selectedSubject && selectedStartTime && !isScheduled && students.length > 0 && Object.keys(attendance).length === 0) {
                    return (
                        <div className="bg-amber-50 border border-amber-100 p-4 md:p-6 rounded-2xl flex items-center gap-4 text-amber-700 animate-in slide-in-from-top-4 duration-500">
                            <div className="p-2 bg-amber-100 rounded-xl"><Clock size={24} /></div>
                            <p className="text-xs md:text-sm font-bold uppercase tracking-widest">
                                Notice: No lecture scheduled for this specific time/day ({selectedDay}).
                            </p>
                        </div>
                    );
                }
                return null;
            })()}

            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Roll Identifer</th>
                                <th className="px-8 py-5">Full Student Name</th>
                                <th className="px-8 py-5 text-center">Engagement Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="3" className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Synchronizing records...</td></tr>
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-all group">
                                        <td className="px-8 py-4 font-bold text-slate-400 text-xs">{student.roll_number}</td>
                                        <td className="px-8 py-4 font-bold text-slate-700 text-sm md:text-base">{student.name}</td>
                                        <td className="px-8 py-4">
                                            {user?.role === 'teacher' ? (
                                                <div className="flex justify-center items-center gap-3">
                                                    {!isEditing ? (
                                                        <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${(pendingChanges[student.id] || attendance[student.id]) === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                            (pendingChanges[student.id] || attendance[student.id]) === 'absent' ? 'bg-rose-100 text-rose-700' :
                                                                (pendingChanges[student.id] || attendance[student.id]) === 'leave' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {(pendingChanges[student.id] || attendance[student.id]) || 'Awaiting'}
                                                        </span>
                                                    ) : (pendingChanges[student.id] || attendance[student.id]) === 'leave' ? (
                                                        <div className="bg-amber-50 text-amber-600 px-5 py-2 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 border border-amber-100">
                                                            <Clock size={14} />
                                                            On Approved Leave
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(student.id, 'present')}
                                                                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 ${(pendingChanges[student.id] || attendance[student.id]) === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50'}`}
                                                            >
                                                                <CheckCircle size={18} />
                                                                <span className="text-[10px] font-bold uppercase">Present</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(student.id, 'absent')}
                                                                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 ${(pendingChanges[student.id] || attendance[student.id]) === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 text-slate-400 hover:bg-rose-50'}`}
                                                            >
                                                                <XCircle size={18} />
                                                                <span className="text-[10px] font-bold uppercase">Absent</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${attendance[student.id] === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                        attendance[student.id] === 'absent' ? 'bg-rose-100 text-rose-700' :
                                                            attendance[student.id] === 'leave' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-400'
                                                        }`}>
                                                        {attendance[student.id] || 'N/A'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Users size={48} className="text-slate-300" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                {selectedClassId ? "No students linked to this class." : "Select academic group to load registry."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Synchronizing...</div>
                    ) : students.length > 0 ? (
                        students.map((student) => (
                            <div key={student.id} className="p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                            {student.roll_number}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-none mb-1">{student.name}</h4>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Student</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center pt-1">
                                    {user?.role === 'teacher' ? (
                                        <div className="w-full">
                                            {!isEditing ? (
                                                <div className={`w-full text-center py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] ${(pendingChanges[student.id] || attendance[student.id]) === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                                    (pendingChanges[student.id] || attendance[student.id]) === 'absent' ? 'bg-rose-50 text-rose-600' :
                                                        (pendingChanges[student.id] || attendance[student.id]) === 'leave' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-slate-50 text-slate-400'
                                                    }`}>
                                                    {(pendingChanges[student.id] || attendance[student.id]) || 'Awaiting Marking'}
                                                </div>
                                            ) : (pendingChanges[student.id] || attendance[student.id]) === 'leave' ? (
                                                <div className="w-full text-center py-3 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <Clock size={14} /> ON LEAVE
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3 w-full">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'present')}
                                                        className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${(pendingChanges[student.id] || attendance[student.id]) === 'present' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                                    >
                                                        <CheckCircle size={16} />
                                                        <span className="text-[10px] font-bold uppercase">Present</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'absent')}
                                                        className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${(pendingChanges[student.id] || attendance[student.id]) === 'absent' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                                    >
                                                        <XCircle size={16} />
                                                        <span className="text-[10px] font-bold uppercase">Absent</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`w-full text-center py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest ${attendance[student.id] === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                            attendance[student.id] === 'absent' ? 'bg-rose-50 text-rose-600' :
                                                attendance[student.id] === 'leave' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-slate-50 text-slate-400'
                                            }`}>
                                            {attendance[student.id] || 'Not Marked'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[8px]">No data</div>
                    )}
                </div>

                {user?.role === 'teacher' && students.length > 0 && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            {isEditing ? (
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Queue: <span className="text-indigo-600">{Object.keys(pendingChanges).length}</span> student records modified
                                </p>
                            ) : (
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-300">
                                    Registry Status: Read-Only
                                </p>
                            )}
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setPendingChanges({});
                                            setIsEditing(false);
                                        }}
                                        className="flex-1 md:w-32 py-4 bg-white border-2 border-slate-200 text-slate-500 font-bold rounded-xl md:rounded-2xl transition-all uppercase text-[10px] tracking-widest active:scale-95"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={submitBatchUpdate}
                                        disabled={saving || Object.keys(pendingChanges).length === 0}
                                        className="flex-[2] md:px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl md:rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase text-[10px] tracking-[0.15em] active:scale-95"
                                    >
                                        <Save size={18} />
                                        {saving ? 'Syncing...' : 'Push Records'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full md:px-12 py-4 bg-white border-2 border-indigo-500 text-indigo-600 font-bold rounded-xl md:rounded-2xl hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group uppercase text-[10px] tracking-[0.2em] active:scale-95 shadow-lg shadow-indigo-100"
                                >
                                    <Save size={18} className="group-hover:scale-125 transition-transform" />
                                    Modify Registry
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Attendance;

