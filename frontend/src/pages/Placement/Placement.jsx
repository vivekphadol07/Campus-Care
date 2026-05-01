import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, IndianRupee, Calendar, FileText, Plus, Search, TrendingUp, Users, CheckCircle2, Clock, XCircle, ChevronRight, Star, Upload, Bell, CheckCircle, Sparkles, Activity } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useUser } from '../../context/userContext';
import { socket } from '../../utils/socket';

const Placement = () => {
    const { user } = useUser();
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]); // For Admin
    const [showAddJob, setShowAddJob] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeUrl, setResumeUrl] = useState('');
    const [notification, setNotification] = useState(null);
    
    const [newJob, setNewJob] = useState({
        company: '', role: '', package: '', deadline: '', min_cgpa: '', branches: '', description: ''
    });

    useEffect(() => {
        fetchJobs();
        if (user?.role === 'student') {
            fetchMyApplications();
            fetchUserProfile();
        }

        // Socket Listener
        socket.on("status_update", (data) => {
            setNotification(data);
            fetchMyApplications();
            setTimeout(() => setNotification(null), 5000);
        });

        return () => {
            socket.off("status_update");
        };
    }, [user]);

    useEffect(() => {
        if (selectedJob && (user?.role === 'admin' || user?.role === 'placement_cell')) {
            fetchJobApplications(selectedJob.id);
        }
    }, [selectedJob, user]);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/api/placement/jobs');
            setJobs(res.data);
            if (res.data.length > 0 && !selectedJob) {
                setSelectedJob(res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await api.get(`/api/profile/${user.id}`);
            if (res.data.resume_url) {
                setResumeUrl(res.data.resume_url);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const res = await api.get('/api/placement/applications');
            setMyApplications(res.data);
        } catch (err) {
            console.error("Error fetching my applications:", err);
        }
    };

    const fetchJobApplications = async (jobId) => {
        try {
            const res = await api.get(`/api/placement/applications?jobId=${jobId}`);
            setAllApplications(res.data);
        } catch (err) {
            console.error("Error fetching applications for job:", err);
        }
    };

    const handleAddJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/placement/jobs', newJob);
            setShowAddJob(false);
            fetchJobs();
            setNewJob({ company: '', role: '', package: '', deadline: '', min_cgpa: '', branches: '', description: '' });
        } catch (err) {
            alert("Failed to post job");
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setResumeFile(file);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await api.post('/api/placement/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeUrl(res.data.url);
            alert("Resume uploaded successfully!");
        } catch (err) {
            alert("Resume upload failed");
        }
    };

    const handleApply = async () => {
        if (!resumeUrl) return alert("Please upload your resume first!");
        setApplying(true);
        try {
            await api.post('/api/placement/apply', {
                jobId: selectedJob.id,
                resumeUrl: resumeUrl
            });
            alert("Application submitted successfully!");
            fetchMyApplications();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    const handleStatusUpdate = async (appId, status) => {
        try {
            await api.put(`/api/placement/applications/${appId}/status`, { status });
            fetchJobApplications(selectedJob.id);
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'placement_cell';
    const isApplied = myApplications.some(app => app.job_id === selectedJob?.id);
    const myApp = myApplications.find(app => app.job_id === selectedJob?.id);

    const stats = {
        total: allApplications.length,
        shortlisted: allApplications.filter(a => a.status === 'Shortlisted').length,
        selected: allApplications.filter(a => a.status === 'Selected').length,
        rejected: allApplications.filter(a => a.status === 'Rejected').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Initializing Placement Hub...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-12 p-4 md:p-6">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 md:top-10 right-4 md:right-10 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 max-w-[90vw] border border-white/10">
                    <div className="bg-emerald-500 p-2 rounded-lg">
                        <Bell size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] md:text-sm font-bold tracking-tight">{notification.message}</p>
                        <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Application Milestone</p>
                    </div>
                </div>
            )}

            {/* Premium Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-blue-600">Careers</span></h2>
                </div>
                {user?.role === 'admin' && (
                    <button 
                        onClick={() => setShowAddJob(true)}
                        className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 relative z-10"
                    >
                        <Plus size={20} /> Post New Job
                    </button>
                )}
            </header>

            {/* Analytics Grid for Admins */}
            {isAdmin && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { label: 'Total Applicants', val: stats.total, color: 'blue', icon: Users },
                        { label: 'Shortlisted', val: stats.shortlisted, color: 'amber', icon: Clock },
                        { label: 'Selected', val: stats.selected, color: 'emerald', icon: CheckCircle },
                        { label: 'Rejected', val: stats.rejected, color: 'rose', icon: XCircle }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[22px] border border-slate-100 flex flex-col items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all group">
                            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl md:rounded-[1.2rem] group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-widest uppercase">{stat.label}</span>
                            <span className={`text-2xl md:text-4xl font-bold text-slate-900`}>{stat.val}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                {/* Left Column: Job Selection Ribbon */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Active Listings</h3>
                        <Briefcase size={16} className="text-blue-600" />
                    </div>

                    <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[75vh] pb-6 lg:pb-0 lg:pr-3 custom-scrollbar no-scrollbar snap-x">
                        {jobs.map((job) => (
                            <div 
                                key={job.id} 
                                onClick={() => setSelectedJob(job)}
                                className={`p-6 rounded-[22px] border transition-all cursor-pointer group relative overflow-hidden shrink-0 w-[260px] lg:w-auto snap-center ${
                                    selectedJob?.id === job.id 
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20 lg:translate-x-2' 
                                    : 'bg-white border-slate-100 hover:border-blue-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                                }`}
                            >
                                {new Date(job.deadline) - new Date() < 172800000 && new Date(job.deadline) > new Date() && (
                                    <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl">
                                        Expiring
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <h4 className="text-sm md:text-lg font-bold truncate pr-2 leading-none">{job.company}</h4>
                                        <p className={`text-[10px] md:text-xs font-bold mt-2 ${selectedJob?.id === job.id ? 'text-blue-400' : 'text-slate-400'}`}>{job.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${selectedJob?.id === job.id ? 'text-slate-500' : 'text-slate-300'}`}>{job.package}</span>
                                    <ChevronRight size={18} className={selectedJob?.id === job.id ? 'text-blue-500' : 'text-slate-200'} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Intelligence View */}
                <div className="lg:col-span-8">
                    {selectedJob ? (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            {/* Detailed Intelligence Card */}
                            <div className="bg-white rounded-[22px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 opacity-30 blur-3xl"></div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-10 md:mb-16 relative">
                                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-[22px] md:rounded-[22px] bg-slate-900 flex items-center justify-center text-white shadow-2xl ring-8 ring-slate-50">
                                        <Building2 size={40} md:size={64} />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-none tracking-tight">{selectedJob.company}</h3>
                                        <p className="text-blue-600 font-bold text-lg md:text-2xl mt-3 tracking-tight">{selectedJob.role}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-2xl text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                                <IndianRupee size={14} /> {selectedJob.package}
                                            </div>
                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-2xl text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                                <Star size={14} className="text-amber-500 fill-amber-500" /> {selectedJob.min_cgpa} CGPA
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 md:space-y-12">
                                    <div className="bg-slate-50/50 p-6 rounded-[22px] border border-slate-100">
                                        <h5 className="font-bold text-slate-400 uppercase text-[9px] md:text-[11px] tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles size={14} className="text-blue-600" /> Professional Directive
                                        </h5>
                                        <p className="text-slate-700 font-medium leading-relaxed text-[13px] md:text-lg">
                                            {selectedJob.description}
                                        </p>
                                    </div>

                                    {!isAdmin && (
                                        <div className="space-y-8">
                                            {!isApplied ? (
                                                <div className="space-y-8">
                                                    <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-blue-50/30 rounded-[22px] border border-blue-100 gap-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-lg shadow-blue-600/5">
                                                                <Upload size={24} />
                                                            </div>
                                                            <div>
                                                                <h6 className="font-bold text-slate-900 text-sm md:text-lg leading-none mb-2">Resume Upload</h6>
                                                                <p className="text-[11px] md:text-sm font-medium text-slate-500">{resumeFile ? resumeFile.name : 'Portable Document Format (PDF)'}</p>
                                                            </div>
                                                        </div>
                                                        <label className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all text-center shadow-xl shadow-slate-900/10">
                                                            Browse Device
                                                            <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                                                        </label>
                                                    </div>

                                                    <button 
                                                        onClick={handleApply}
                                                        disabled={applying || !resumeUrl}
                                                        className={`w-full py-5 md:py-7 rounded-[22px] font-bold uppercase tracking-widest shadow-2xl transition-all text-xs md:text-xl active:scale-95 ${
                                                            !resumeUrl ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-slate-900'
                                                        }`}
                                                    >
                                                        {applying ? 'Initiating Protocol...' : `Finalize Application`}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-50 rounded-[22px] p-8 border border-emerald-100 text-center space-y-8 md:space-y-12 shadow-inner">
                                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-3xl mx-auto flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 animate-bounce duration-[2000ms]">
                                                        <CheckCircle size={32} md:size={48} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Enrolled Successfully</h4>
                                                        <p className="text-emerald-600 font-bold text-xs md:text-lg mt-3 uppercase tracking-[0.3em]">{myApp?.status}</p>
                                                    </div>
                                                    
                                                    {/* Modular Stepper */}
                                                    <div className="flex items-center justify-between max-w-xl mx-auto pt-8 overflow-x-auto no-scrollbar scroll-smooth">
                                                        {['Applied', 'Shortlisted', 'Interview', 'Selected'].map((step, idx) => {
                                                            const steps = ['Applied', 'Shortlisted', 'Interview', 'Selected'];
                                                            const currentIdx = steps.indexOf(myApp?.status);
                                                            const isCompleted = idx <= currentIdx;
                                                            const isNow = idx === currentIdx;
                                                            
                                                            return (
                                                                <React.Fragment key={step}>
                                                                    <div className="flex flex-col items-center gap-3 shrink-0">
                                                                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${
                                                                            isCompleted ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-200'
                                                                        } ${isNow ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}>
                                                                            {isCompleted ? <CheckCircle size={20} md:size={28} /> : <span className="text-xs md:text-base font-bold">{idx + 1}</span>}
                                                                        </div>
                                                                        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-600' : 'text-slate-300'}`}>{step}</span>
                                                                    </div>
                                                                    {idx < 3 && (
                                                                        <div className={`flex-1 h-1 md:h-1.5 rounded-full min-w-[30px] mx-2 ${idx < currentIdx ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Applicant Intelligence Registry */}
                            {isAdmin && (
                                <div className="bg-white rounded-[22px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center justify-between mb-10 md:mb-16">
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Applicant Registry</h3>
                                        <span className="bg-blue-600 text-white px-5 md:px-6 py-2.5 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20">
                                            {allApplications.length} Verified Profiles
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        {allApplications.map((app) => (
                                            <div key={app.id} className="p-5 md:p-6 rounded-[22px] border border-slate-50 bg-slate-50/50 flex flex-col justify-between gap-6 group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all">
                                                <div className="flex items-center gap-4 md:gap-6">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] bg-white border border-slate-100 flex items-center justify-center font-bold text-blue-600 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-lg md:text-2xl">
                                                        {app.student_name ? app.student_name[0] : 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="text-base md:text-lg font-bold text-slate-900 truncate tracking-tight">{app.student_name}</h5>
                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            <span className={`px-3 py-1 rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest uppercase border ${
                                                                app.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                app.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                                {app.status}
                                                            </span>
                                                            <a href={app.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase">
                                                                <FileText size={14} /> Resume
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                                                    {['Shortlisted', 'Interview', 'Selected', 'Rejected'].map(status => (
                                                        <button 
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(app.id, status)} 
                                                            className={`flex-1 px-3 py-2 md:py-3 rounded-xl text-[8px] md:text-[9px] font-bold uppercase tracking-widest border border-slate-100 transition-all ${
                                                                status === 'Selected' ? 'hover:bg-emerald-600 hover:text-white' :
                                                                status === 'Rejected' ? 'hover:bg-rose-600 hover:text-white' :
                                                                'hover:bg-blue-600 hover:text-white'
                                                            }`}
                                                        >
                                                            {status.substring(0, 4)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {allApplications.length === 0 && (
                                            <div className="col-span-full py-16 md:py-24 text-center bg-slate-50/50 rounded-[22px] border border-dashed border-slate-200">
                                                <Users size={48} className="mx-auto text-slate-200 mb-6" />
                                                <p className="text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest">Zero Applicant Profiles Registered</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 md:py-48 bg-slate-50/30 rounded-[22px] border border-dashed border-slate-200 text-center px-12">
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[22px] flex items-center justify-center text-slate-200 shadow-xl mb-10 md:mb-16 animate-pulse">
                                <Briefcase size={48} md:size={64} />
                            </div>
                             <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Ecosystem Standby</h3>
                             <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed mt-4 max-w-sm">Select a professional opportunity from the active navigation ribbon to view deep intelligence and enrollment protocols.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Adding Jobs */}
            {showAddJob && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[22px] md:rounded-[4rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[95vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-4 mb-10 md:mb-12">
                            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
                                <Plus size={24} />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Post Professional Directive</h2>
                        </div>

                        <form onSubmit={handleAddJob} className="space-y-6 md:space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Corporate Identity</label>
                                    <input 
                                        placeholder="e.g. Google Cloud" 
                                        className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[20px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all text-xs md:text-lg" 
                                        required 
                                        onChange={e => setNewJob({...newJob, company: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Designation</label>
                                    <input 
                                        placeholder="e.g. Software Engineer III" 
                                        className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[20px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all text-xs md:text-lg" 
                                        required 
                                        onChange={e => setNewJob({...newJob, role: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Renumeration Pack</label>
                                    <input 
                                        placeholder="e.g. ₹24 LPA" 
                                        className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[20px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all text-xs md:text-lg" 
                                        onChange={e => setNewJob({...newJob, package: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Timeline Cutoff</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[20px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-400 transition-all text-xs md:text-lg" 
                                        onChange={e => setNewJob({...newJob, deadline: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Academic Floor (CGPA)</label>
                                    <input 
                                        placeholder="e.g. 8.5" 
                                        className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[20px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all text-xs md:text-lg" 
                                        onChange={e => setNewJob({...newJob, min_cgpa: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Eligibility Domains</label>
                                    <input 
                                        placeholder="e.g. CSE, IT, ECE" 
                                        className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[20px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all text-xs md:text-lg" 
                                        onChange={e => setNewJob({...newJob, branches: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Strategic Description</label>
                                <textarea 
                                    placeholder="Describe the institutional opportunity and professional requirements..." 
                                    className="w-full px-6 md:px-8 py-6 md:py-8 rounded-[22px] md:rounded-[22px] bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-medium min-h-[150px] text-slate-700 transition-all text-xs md:text-lg" 
                                    onChange={e => setNewJob({...newJob, description: e.target.value})} 
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 md:gap-8 pt-6">
                                <button type="button" className="flex-1 px-8 py-5 md:py-7 rounded-[20px] bg-slate-100 text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-slate-200 transition-all" onClick={() => setShowAddJob(false)}>Cancel Protocol</button>
                                <button type="submit" className="flex-[2] px-8 py-5 md:py-7 rounded-[20px] bg-blue-600 text-white font-bold uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-slate-900 transition-all text-[10px] md:text-xs">Publish Directive</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Placement;

