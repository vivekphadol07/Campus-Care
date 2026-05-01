import React, { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarDays, PlusCircle, BookOpen, Clock, Calendar, Check, X, TrendingUp } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

const TeacherDashboard = ({ user: propUser }) => {
    const { user: contextUser } = useUser();
    const user = propUser || contextUser;
    const navigate = useNavigate();
    const [isClassTeacher, setIsClassTeacher] = useState(false);
    const [managedClassNames, setManagedClassNames] = useState([]);
    const [stats, setStats] = useState({ assignedSubjects: 0, classesHandled: 0, pendingLeaves: 0, todayStatus: [] });
    const [leaves, setLeaves] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (user?.id) fetchStats();
        const onFocus = () => { if (user?.id) fetchStats(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [user]);

    const fetchStats = async () => {
        try {
            const [statsRes, leavesRes, classesRes] = await Promise.all([
                api.get(`${API_PATHS.STATS.TEACHER}/${user.id}`),
                api.get(API_PATHS.LEAVES),
                api.get(API_PATHS.ADMIN.CLASSES)
            ]);

            const managed = classesRes.data.filter(c => String(c.class_teacher_id) === String(user.id));
            setIsClassTeacher(managed.length > 0);
            setManagedClassNames(managed.map(c => c.name));

            if (managed.length > 0) {
                const studentsRes = await api.get(`${API_PATHS.STUDENTS}?class_id=${managed[0].id}`);
                const sortedStudents = studentsRes.data.sort((a, b) => 
                    String(a.roll_number).localeCompare(String(b.roll_number), undefined, { numeric: true, sensitivity: 'base' })
                );
                setStudents(sortedStudents);
            }

            const pendingLeaves = leavesRes.data.filter(l => l.status === 'pending').slice(0,5); // only take a few for dashboard
            setLeaves(pendingLeaves);

            setStats({
                ...statsRes.data,
                pendingLeaves: pendingLeaves.length
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Class Teacher Layout
    const renderClassTeacher = () => (
        <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                        {managedClassNames[0]?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Class {managedClassNames.join(', ')}</h3>
                        <p className="text-xs text-slate-500">Class Teacher</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/teacher/mark-attendance" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <UserCheck size={16} /> Mark Attendance
                    </Link>
                    <Link to="/teacher/add-student" className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <PlusCircle size={16} /> Add Student
                    </Link>
                </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Attendance Overview Chart */}
                    <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500"/> Class Attendance Overview</h3>
                        <div className="h-48 flex items-end gap-2 px-2 pb-2 border-b border-l border-slate-100">
                            {[90, 92, 88, 95, 85].map((val, i) => (
                                <div key={i} className="flex-1 bg-emerald-100 rounded-t relative hover:bg-emerald-200" style={{ height: `${val}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-semibold text-slate-400 px-2">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                        </div>
                    </div>

                    {/* Leave Requests */}
                    <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><CalendarDays size={18} className="text-amber-500"/> Leave Requests</h3>
                            <Link to="/teacher/leaves" className="text-xs font-semibold text-indigo-600">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {leaves.length > 0 ? leaves.map((leave, i) => (
                                <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{leave.student_name}</p>
                                        <p className="text-xs text-slate-500">{leave.date} • {leave.reason}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Check size={14}/></button>
                                        <button className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"><X size={14}/></button>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-slate-400 italic">No pending leave requests.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Student List */}
                    <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[300px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-blue-500"/> Student List</h3>
                            <Link to="/teacher/students" className="text-xs font-semibold text-indigo-600">Full Roster</Link>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {students.length > 0 ? students.map((student, i) => (
                                <div key={student.id} className="p-3 hover:bg-slate-50 rounded-xl flex justify-between items-center border border-transparent hover:border-slate-100 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex justify-center items-center text-xs font-bold text-slate-600">
                                            {student.name ? student.name[0] : 'S'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{student.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Roll: {student.roll_number}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-slate-400 italic">No students assigned.</p>}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-purple-500"/> Upcoming Events</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 flex items-center gap-3">
                                <CalendarDays size={20} />
                                <div>
                                    <p className="text-sm font-bold">Science Exhibition</p>
                                    <p className="text-xs opacity-80">Tomorrow, Main Hall</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Subject Teacher Layout
    const renderSubjectTeacher = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
                {/* Mark Attendance Primary Focus */}
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-8 rounded-[22px] shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                            <UserCheck size={24} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Mark Attendance</h3>
                        <p className="text-indigo-100 text-sm mb-8">Record attendance for your assigned classes seamlessly.</p>
                        <Link to="/teacher/mark-attendance" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                            Initialize Registry
                        </Link>
                    </div>
                </div>

                {/* Subject Performance */}
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={18} className="text-emerald-500"/> Subject Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Attendance</p>
                            <p className="text-2xl font-black text-slate-800">88%</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Classes Done</p>
                            <p className="text-2xl font-black text-slate-800">{stats.classesHandled}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* Today's Classes */}
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-[350px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-blue-500"/> Today's Classes</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {stats.todayStatus.length > 0 ? stats.todayStatus.map((lecture, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${lecture.is_marked ? 'bg-slate-50 border-slate-100' : 'bg-blue-50/50 border-blue-100'} flex items-center justify-between`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-10 rounded-full ${lecture.is_marked ? 'bg-slate-300' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{lecture.subject}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{lecture.class_name} • {(lecture.start_time || "").slice(0,5)}</p>
                                    </div>
                                </div>
                                {lecture.is_marked ? (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Marked</span>
                                ) : (
                                    <button onClick={() => navigate('/teacher/mark-attendance')} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                        <PlusCircle size={16}/>
                                    </button>
                                )}
                            </div>
                        )) : <p className="text-sm text-slate-400 italic">No classes scheduled today.</p>}
                    </div>
                </div>

                {/* Events */}
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-purple-500"/> Events</h3>
                    <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 text-sm font-semibold">
                        Department Meeting at 3 PM
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 p-4 md:p-6">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Instructor Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">Welcome back, {user.name}</p>
            </header>

            {isClassTeacher ? renderClassTeacher() : renderSubjectTeacher()}
        </div>
    );
};

export default TeacherDashboard;
