import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, CalendarDays, Users, 
    Utensils, Calendar, Briefcase, BarChart3, Settings, MapPin, PlusCircle, Clock, CheckCircle, User
} from 'lucide-react';
import { useUser } from '../../context/userContext';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useUser();
    const [isClassTeacher, setIsClassTeacher] = useState(false);

    useEffect(() => {
        const checkClassTeacher = async () => {
            if (user?.role === 'teacher') {
                try {
                    const res = await api.get(API_PATHS.ADMIN.CLASSES);
                    const classes = res.data;
                    const assigned = classes.some(c => String(c.class_teacher_id) === String(user.id));
                    setIsClassTeacher(assigned);
                } catch (err) {
                    console.error("Error checking class teacher status:", err);
                }
            }
        };
        checkClassTeacher();
    }, [user]);

    // Core menu items visible to almost everyone
    const coreItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/transport', label: 'Transport', icon: <MapPin size={20} /> },
        { path: '/events', label: 'Events', icon: <Calendar size={20} /> },
        { path: '/mess', label: 'Mess Menu', icon: <Utensils size={20} /> },
    ];

    // Admin Specific Items
    const adminItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/students', label: 'Students', icon: <Users size={20} /> },
        { path: '/admin/add-teacher', label: 'Add Teachers', icon: <PlusCircle size={20} /> },
        { path: '/admin/add-class', label: 'Add Classes', icon: <CalendarDays size={20} /> },
        { path: '/admin/assign-teacher', label: 'Assign Teacher', icon: <UserCheck size={20} /> },
        { path: '/admin/timetable', label: 'Manage Timetable', icon: <Clock size={20} /> },
        { path: '/admin/events', label: 'Events', icon: <Calendar size={20} /> },
        { path: '/admin/mess', label: 'Mess Menu', icon: <Utensils size={20} /> },
        { path: '/admin/transport', label: 'Transport', icon: <MapPin size={20} /> },
    ];

    // Teacher Specific Items
    const teacherItems = [
        { path: '/teacher/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/teacher/attendance', label: 'Attendance', icon: <UserCheck size={20} /> },
        { path: '/teacher/mark-attendance', label: 'Mark Attendance', icon: <Clock size={20} /> },
        ...(isClassTeacher ? [
            { path: '/teacher/students', label: 'Students', icon: <Users size={20} /> },
            { path: '/teacher/add-student', label: 'Add Student', icon: <PlusCircle size={20} /> }
        ] : []),
        { path: '/teacher/events', label: 'Events', icon: <Calendar size={20} /> },
        { path: '/teacher/leaves', label: 'Leaves', icon: <CalendarDays size={20} /> },
        { path: '/teacher/mess', label: 'Mess Menu', icon: <Utensils size={20} /> },
        { path: '/teacher/transport', label: 'Transport', icon: <MapPin size={20} /> },
    ];

    // Student Specific Items
    const studentItems = [
        { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/student/profile', label: 'My Profile', icon: <User size={20} /> },
        { path: '/student/attendance', label: 'My Attendance', icon: <UserCheck size={20} /> },
        { path: '/student/leaves', label: 'Apply Leave', icon: <CalendarDays size={20} /> },
        { path: '/student/placement', label: 'Placement Portal', icon: <Briefcase size={20} /> },
        { path: '/student/events', label: 'Events', icon: <Calendar size={20} /> },
        { path: '/student/mess', label: 'Mess Menu', icon: <Utensils size={20} /> },
        { path: '/student/transport', label: 'Transport', icon: <MapPin size={20} /> },
    ];

    // Mess Owner Specific Items
    const messOwnerItems = [
        { path: '/mess-owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/mess-owner/feedback', label: 'Feedback Analytics', icon: <BarChart3 size={20} /> },
        { path: '/mess-owner/menu-update', label: 'Update Menu', icon: <Settings size={20} /> },
        { path: '/mess-owner/delivery', label: 'Room Requests', icon: <Utensils size={20} /> },
        { path: '/mess-owner/events', label: 'Events', icon: <Calendar size={20} /> },
    ];

    // Placement Cell Specific Items
    const placementCellItems = [
        { path: '/placement-cell/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/placement-cell/tracker', label: 'Placement Tracker', icon: <Briefcase size={20} /> },
        { path: '/placement-cell/events', label: 'Events', icon: <Calendar size={20} /> },
    ];

    let navItems = [];

    if (user?.role === 'admin') navItems = adminItems;
    else if (user?.role === 'teacher') navItems = teacherItems;
    else if (user?.role === 'student') navItems = studentItems;
    else if (user?.role === 'mess_owner') navItems = messOwnerItems;
    else if (user?.role === 'placement_cell') navItems = placementCellItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed lg:static inset-y-0 left-0 w-64 bg-white min-h-screen p-6 flex flex-col border-r border-slate-100 
                shadow-[20px_0_40px_rgba(0,0,0,0.01)] z-[60] transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="mb-12 px-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">C</div>
                        CampusCare
                    </h2>
                </div>
                
                <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            end={item.path === '/placement' || item.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`
                            }
                        >
                            <div className={`transition-colors duration-300`}>
                                {React.cloneElement(item.icon, { size: 18 })}
                            </div>
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg shadow-slate-200 shrink-0">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest truncate">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
