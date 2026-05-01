import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Eye, EyeOff, User, GraduationCap, Shield, Briefcase, ChevronRight, LayoutDashboard, Utensils } from 'lucide-react';
import { useUser } from '../../context/userContext';
import campuscare from '../../Images/campuscare.png';

function Login() {
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post(API_PATHS.AUTH.LOGIN, { email, password, role });
            const data = response.data;

            const userData = {
                id: data.id,
                name: data.name,
                role: data.role,
                email: email,
                class_id: data.class_id
            };

            login(userData, data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap, color: 'blue' },
        { id: 'teacher', label: 'Teacher', icon: User, color: 'indigo' },
        { id: 'admin', label: 'Admin', icon: Shield, color: 'rose' },
        { id: 'placement_cell', label: 'Placement', icon: Briefcase, color: 'emerald' },
        { id: 'mess_owner', label: 'Mess', icon: Utensils, color: 'amber' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-5xl flex bg-white rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                
                {/* Left Side - Visual Content */}
                <div className="hidden lg:flex w-5/12 p-10 flex-col justify-center items-center bg-blue-600 relative overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] border-[40px] border-white rounded-full" />
                    </div>

                    <div className="relative z-10 text-center w-full">
                        <img 
                            src={campuscare} 
                            alt="CampusCare" 
                            className="w-full h-[350px] object-cover rounded-[2rem] mb-6 shadow-xl"
                        />
                        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">CampusCore <br />Management</h2>
                        <p className="text-blue-100 text-[10px] mt-3 opacity-80 font-black uppercase tracking-widest">Smart. Secure. Unified.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-7/12 p-10 md:p-12">
                    <div className="max-w-sm mx-auto">
                        <div className="lg:hidden flex justify-center mb-10">
                            <img 
                                src={campuscare} 
                                alt="CampusCare Logo" 
                                className="h-24 w-auto object-contain drop-shadow-xl"
                            />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
                            <p className="text-slate-400 font-bold text-sm">Welcome back to the portal.</p>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-black flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Login As</label>
                                <div className="flex flex-wrap gap-2">
                                    {roles.map((r) => {
                                        const isActive = role === r.id;
                                        const colorStyles = {
                                            blue: isActive ? 'bg-blue-50 border-blue-200 text-blue-600' : '',
                                            indigo: isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : '',
                                            rose: isActive ? 'bg-rose-50 border-rose-200 text-rose-600' : '',
                                            emerald: isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : '',
                                            amber: isActive ? 'bg-amber-50 border-amber-200 text-amber-600' : ''
                                        };

                                        return (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setRole(r.id)}
                                                className={`flex-1 min-w-[70px] flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${
                                                    isActive 
                                                    ? `${colorStyles[r.color]} shadow-sm` 
                                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                            >
                                                <r.icon size={16} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">{r.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identifier</label>
                                    <input
                                        type="text"
                                        placeholder={role === 'student' ? "Email or Roll Number" : "Email Address"}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                                        <a href="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot?</a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Logging in...' : 'Sign In'}
                                {!loading && <ChevronRight size={16} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 font-bold text-xs tracking-tight">
                                System Administrator?{' '}
                                <Link to="/admin-signup" className="text-blue-600 hover:text-blue-700 transition-colors">Register Portal</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
