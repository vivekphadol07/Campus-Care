import React, { useEffect, useState } from 'react';
import { UserCheck, CalendarClock, Clock, BookOpen, MapPin, Utensils, Briefcase, ChevronRight, PieChart, CheckCircle, Bus } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Link } from 'react-router-dom';
import AdminDashboard from '../Admin/AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import { useUser } from '../../context/userContext';

const Dashboard = ({ user: propUser }) => {
    const { user: contextUser } = useUser();
    const user = propUser || contextUser;
    const [studentStats, setStudentStats] = useState(null);
    const [todayTimetable, setTodayTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'student') {
            Promise.all([fetchStudentStats(), fetchTodayTimetable()]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchStudentStats = async () => {
        try {
            const res = await api.get(`${API_PATHS.STATS.STUDENT}/${user.id}`);
            setStudentStats(res.data);
            if (!user.class_id && res.data.classId) {
                fetchTodayTimetable(res.data.classId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTodayTimetable = async (fallbackClassId) => {
        const classId = user.class_id || fallbackClassId;
        if (!classId) return;

        try {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = days[new Date().getDay()];
            const res = await api.get(`${API_PATHS.TIMETABLE}?class_id=${classId}`);
            const filtered = res.data.filter(t => t.day_of_week === today);
            setTodayTimetable(filtered);
        } catch (err) {
            console.error("Error fetching timetable:", err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'teacher') return <TeacherDashboard user={user} />;

    const attendancePct = studentStats?.overallPercentage || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 p-4 md:p-6">
            {/* Header / Greeting section */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-8 rounded-[18px] md:rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Hello, <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">{user.name}</span>! 👋</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Ready for a great day of learning?</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-semibold text-slate-600 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">{user.roll_number || 'Registry ID'}</p>
                </div>
            </header>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Top Row: Attendance % */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-[22px] border border-blue-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute top-4 right-4 text-blue-300 group-hover:text-blue-500 transition-colors"><PieChart size={24} /></div>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" className="text-blue-200 stroke-current" strokeWidth="12" fill="transparent" />
                            <circle cx="64" cy="64" r="56" className="text-blue-500 stroke-current drop-shadow-md" strokeWidth="12" strokeDasharray="351.86" strokeDashoffset={351.86 - (351.86 * attendancePct) / 100} fill="transparent" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-800">{attendancePct}%</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-600 mt-4 uppercase tracking-widest">Attendance Status</h3>
                </div>

                {/* Top Row: Today's Classes */}
                <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-blue-500"/> Today's Classes</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3 custom-scrollbar pr-2">
                        {todayTimetable.length > 0 ? (
                            todayTimetable.map((t, i) => (
                                <div key={i} className="flex gap-4 items-start relative">
                                    {i !== todayTimetable.length - 1 && <div className="absolute left-1.5 top-6 bottom-0 w-0.5 bg-slate-100 -mb-3"></div>}
                                    <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5 z-10 ring-4 ring-white"></div>
                                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-700">{t.subject}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{t.start_time?.slice(0,5)} - {t.end_time?.slice(0,5)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic text-center mt-8">No classes scheduled today.</p>
                        )}
                    </div>
                </div>

                {/* Top Row: Leave Status */}
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-6 rounded-[22px] border border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><CalendarClock size={18} className="text-rose-500"/> Leave Status</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        <CheckCircle size={48} className="text-emerald-400 mb-4 drop-shadow-sm" />
                        <p className="text-sm font-bold text-slate-700">No active leaves</p>
                        <p className="text-xs text-slate-500 mt-1">You are expected on campus today.</p>
                    </div>
                </div>

                {/* Middle Row: Mess Menu */}
                <Link to="/student/mess" className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-[22px] border border-yellow-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group hover:-translate-y-1 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Utensils size={18} className="text-amber-500"/> Mess Menu</h3>
                        <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="space-y-3">
                        <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                            <span className="text-xs font-bold text-amber-600 uppercase">Lunch</span>
                            <p className="text-sm font-medium text-slate-700 mt-1 truncate">Check portal for today's special</p>
                        </div>
                    </div>
                </Link>

                {/* Middle Row: Transport Info */}
                <Link to="/student/transport" className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-[22px] border border-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group hover:-translate-y-1 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Bus size={18} className="text-emerald-500"/> Transport</h3>
                        <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><MapPin size={24} /></div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Route A-12</p>
                            <p className="text-xs text-slate-500 mt-0.5">Arriving in 15 mins</p>
                        </div>
                    </div>
                </Link>

                {/* Middle Row: Placement Updates */}
                <Link to="/student/placement" className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-[22px] border border-purple-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group hover:-translate-y-1 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Briefcase size={18} className="text-purple-500"/> Placements</h3>
                        <ChevronRight size={18} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="text-center bg-white/60 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <p className="text-2xl font-black text-purple-600">{studentStats?.placementStats?.total || 0}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Applied</p>
                        </div>
                        <div className="text-center bg-white/60 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <p className="text-2xl font-black text-pink-600">{studentStats?.placementStats?.selected || 0}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Selected</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Bottom: Quick Actions */}
            <div className="bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Link to="/student/leaves" className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        Apply for Leave
                    </Link>
                    <Link to="/student/attendance" className="px-6 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        View Detailed Attendance
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

