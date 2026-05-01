import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserPlus, Lock, Mail, ShieldCheck, Eye, EyeOff, LayoutDashboard, ChevronRight, Fingerprint } from 'lucide-react';
import campuscare from '../../Images/campuscare.png';

const AdminSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        accessToken: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post(API_PATHS.AUTH.ADMIN_SIGNUP, formData);
            alert('Admin registered successfully! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please check your data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-5xl flex bg-white rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 flex-row-reverse">
                
                {/* Right Side - Visual Content (Flipped for Signup) */}
                <div className="hidden lg:flex w-5/12 p-10 flex-col justify-center items-center bg-indigo-600 relative overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] border-[40px] border-white rounded-full" />
                    </div>

                    <div className="relative z-10 text-center w-full">
                        <img 
                            src={campuscare} 
                            alt="CampusCare" 
                            className="w-full h-[350px] object-cover rounded-[2rem] mb-6 shadow-xl"
                        />
                        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Admin <br />Registration</h2>
                        <p className="text-blue-100 text-[10px] mt-3 opacity-80 font-black uppercase tracking-widest">Initialization & Control</p>
                    </div>
                </div>

                {/* Left Side - Form */}
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
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Register</h2>
                            <p className="text-slate-400 font-bold text-sm">Create a new administrative profile.</p>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-black flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-6 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-6 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 8 chars"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Admin Token</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Access Token"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-6 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-sm"
                                            value={formData.accessToken}
                                            onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Initializing...' : 'Create Account'}
                                {!loading && <ChevronRight size={16} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 font-bold text-xs">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
