import React, { useState, useEffect } from 'react';
import { 
    Briefcase, Building2, IndianRupee, Calendar, FileText, 
    Search, Users, CheckCircle2, Clock, XCircle, ChevronRight, 
    Star, Bell, CheckCircle, Filter, Download, ExternalLink, Activity, Sparkles
} from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useUser } from '../../context/userContext';
import { socket } from '../../utils/socket';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PlacementTracker = () => {
    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [notification, setNotification] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    
    useEffect(() => {
        fetchJobs();
        if (user?.role === 'student') {
            fetchMyApplications();
            fetchUserProfile();
        }

        socket.on("status_update", (data) => {
            setNotification(data);
            fetchMyApplications();
            setTimeout(() => setNotification(null), 5000);
        });

        return () => socket.off("status_update");
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
            const urlJobId = searchParams.get('jobId');
            if (urlJobId) {
                const job = res.data.find(j => j.id == urlJobId);
                if (job) setSelectedJob(job);
            } else if (res.data.length > 0 && !selectedJob) {
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

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
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

    const downloadApplicantList = () => {
        if (!selectedJob || allApplications.length === 0) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Applicants: ${selectedJob.company}`, 14, 22);
        
        const tableData = allApplications.map(app => [
            app.student_name,
            app.status,
            app.roll_number || 'N/A'
        ]);

        autoTable(doc, {
            head: [['Student Name', 'Status', 'Roll Number']],
            body: tableData,
            startY: 30,
        });

        doc.save(`${selectedJob.company}_Applicants.pdf`);
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
    const filteredJobs = filterStatus === 'All' 
        ? jobs 
        : jobs.filter(j => myApplications.find(a => a.job_id === j.id)?.status === filterStatus);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Hub Registry...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
            {/* Minimal Notification */}
            {notification && (
                <div className="fixed top-4 md:top-10 right-4 md:right-10 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 max-w-[90vw] border border-white/10">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Bell size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black tracking-tight">{notification.message}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">System Alert</p>
                    </div>
                </div>
            )}

            <header className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">Placement <span className="text-blue-600 text-glow">Tracker</span></h2>
                </div>
                
                {!isAdmin && (
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-x-auto no-scrollbar scroll-smooth">
                        {['All', 'Applied', 'Shortlisted', 'Selected'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filterStatus === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                {/* Left: Job Navigation Ribbon */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Postings</h3>
                        <div className="w-8 h-0.5 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="flex lg:flex-col gap-4 lg:gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[75vh] pb-6 lg:pb-0 lg:pr-3 custom-scrollbar no-scrollbar scroll-smooth snap-x">
                        {filteredJobs.map((job) => {
                            const app = myApplications.find(a => a.job_id === job.id);
                            const isSelected = selectedJob?.id === job.id;
                            return (
                                <div 
                                    key={job.id} 
                                    onClick={() => setSelectedJob(job)}
                                    className={`p-5 md:p-6 rounded-[20px] border transition-all cursor-pointer flex flex-col gap-4 shrink-0 w-[240px] lg:w-auto snap-center ${
                                        isSelected 
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20 -translate-y-1 lg:translate-x-2' 
                                        : 'bg-white border-slate-100 hover:border-blue-200 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="overflow-hidden">
                                            <h4 className="font-black text-xs md:text-xs truncate tracking-tight">{job.company}</h4>
                                            <p className={`text-[10px] md:text-xs font-bold mt-1 ${isSelected ? 'text-slate-400' : 'text-blue-600'}`}>{job.role}</p>
                                        </div>
                                        {!isAdmin && app && (
                                            <div className={`w-2 h-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-pulse ${
                                                app.status === 'Selected' ? 'bg-emerald-400' :
                                                app.status === 'Rejected' ? 'bg-rose-400' : 'bg-blue-400'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>{job.package}</span>
                                        <ChevronRight size={16} className={isSelected ? 'text-blue-500' : 'text-slate-200'} />
                                    </div>
                                </div>
                            );
                        })}
                        {filteredJobs.length === 0 && (
                            <div className="py-10 text-center bg-slate-50 rounded-[22px] border border-dashed border-slate-200 w-full">
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No listings found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Detailed Intelligence View */}
                <div className="lg:col-span-8">
                    {selectedJob ? (
                        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-[60vh] md:min-h-[75vh] animate-in fade-in zoom-in-95 duration-500">
                            {/* Detailed Header */}
                            <div className="p-6 border-b border-slate-50 bg-slate-50/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-5 md:gap-8">
                                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] bg-slate-900 text-white flex items-center justify-center font-black text-xl md:text-2xl shadow-2xl shadow-slate-900/30">
                                            {selectedJob.company[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-none tracking-tight">{selectedJob.company}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <p className="text-blue-600 font-black text-xs md:text-sm uppercase tracking-tight">{selectedJob.role}</p>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <p className="text-slate-400 font-bold text-xs md:text-sm">{selectedJob.package}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {!isAdmin && (
                                        <div className={`px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
                                            myApplications.find(a => a.job_id === selectedJob.id) 
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                            {myApplications.find(a => a.job_id === selectedJob.id)?.status || 'Application Open'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 flex-1 space-y-10 md:space-y-16">
                                {!isAdmin ? (
                                    <div className="space-y-10 md:space-y-16">
                                        {/* Student Recruitment Stepper */}
                                        {myApplications.find(a => a.job_id === selectedJob.id) ? (
                                            <div className="relative pt-4 overflow-x-auto no-scrollbar scroll-smooth">
                                                <div className="absolute top-[20px] md:top-[25px] left-0 w-full h-0.5 bg-slate-100 hidden md:block" />
                                                <div className="flex justify-between items-center relative min-w-[500px] md:min-w-0">
                                                    {['Applied', 'Shortlisted', 'Interview', 'Selected'].map((step, idx) => {
                                                        const app = myApplications.find(a => a.job_id === selectedJob.id);
                                                        const statusOrder = ['Applied', 'Shortlisted', 'Interview', 'Selected'];
                                                        const currentIdx = statusOrder.indexOf(app?.status || '');
                                                        const isCompleted = idx <= currentIdx;
                                                        const isCurrent = idx === currentIdx;

                                                        return (
                                                            <div key={step} className="flex flex-col items-center gap-4 bg-white px-6 relative z-10">
                                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
                                                                    isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-200'
                                                                } ${isCurrent ? 'ring-4 ring-blue-50 animate-pulse' : ''}`}>
                                                                    {isCompleted ? <CheckCircle size={18} md:size={20} /> : <Sparkles size={14} md:size={16} />}
                                                                </div>
                                                                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-blue-600' : 'text-slate-300'}`}>{step}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-900 p-6 rounded-[22px] text-center text-white relative overflow-hidden shadow-2xl">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                                                <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5" />
                                                <h4 className="text-2xl md:text-3xl font-black mb-3 leading-none tracking-tight">Institutional Enrollment</h4>
                                                <p className="text-slate-500 text-xs mb-8 md:mb-12 font-medium leading-relaxed max-w-md mx-auto">Upload your verified professional credentials to initiate the recruitment sequence with {selectedJob.company}.</p>
                                                
                                                <div className="max-w-xs mx-auto space-y-4">
                                                    {!resumeUrl ? (
                                                        <label className="block w-full bg-blue-600 text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest cursor-pointer hover:bg-white hover:text-blue-600 transition-all text-xs shadow-xl shadow-blue-600/20 active:scale-95">
                                                            Select CV/Resume (PDF)
                                                            <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                                                        </label>
                                                    ) : (
                                                        <button 
                                                            onClick={handleApply}
                                                            disabled={applying}
                                                            className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all text-xs shadow-xl shadow-blue-600/20 active:scale-95"
                                                        >
                                                            {applying ? 'Processing...' : 'Submit Application'}
                                                        </button>
                                                    )}
                                                    {resumeUrl && <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Document Verified ✓</p>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                                            <div className="bg-slate-50 p-6 rounded-[22px] border border-slate-100 col-span-1 md:col-span-3">
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                                                    <Briefcase size={14} className="text-blue-600" /> Professional Directive
                                                </h5>
                                                <p className="text-slate-600 font-medium text-[12px] md:text-base leading-relaxed">{selectedJob.description}</p>
                                            </div>
                                            <div className="p-5 md:p-6 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Renumeration</p>
                                                <p className="text-xs md:text-sm font-black text-slate-900 tracking-tight">{selectedJob.package}</p>
                                            </div>
                                            <div className="p-5 md:p-6 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Academics</p>
                                                <p className="text-xs md:text-sm font-black text-slate-900 tracking-tight">{selectedJob.min_cgpa} CGPA+</p>
                                            </div>
                                            <div className="p-5 md:p-6 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase mb-2">Final Date</p>
                                                <p className="text-xs md:text-sm font-black text-slate-900 tracking-tight">{new Date(selectedJob.deadline).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10 md:space-y-12">
                                        {/* Admin Applicant Intelligence */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <h4 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
                                                <Users size={22} className="text-blue-600 shrink-0" />
                                                <span className="whitespace-nowrap">Applicant Registry</span>
                                                <button 
                                                    onClick={downloadApplicantList}
                                                    className="ml-4 p-2 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all flex items-center gap-2 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-slate-900/20"
                                                >
                                                    <Download size={14} /> Export
                                                </button>
                                            </h4>
                                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
                                                {['All', 'Shortlisted', 'Selected', 'Rejected'].map(status => (
                                                    <button 
                                                        key={status}
                                                        onClick={() => setFilterStatus(status)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                            filterStatus === status ? 'bg-white text-blue-600 shadow-[0_4px_20px_rgba(0,0,0,0.02)]' : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {allApplications
                                                .filter(app => filterStatus === 'All' || app.status === filterStatus)
                                                .map(app => (
                                                    <div key={app.id} className="p-5 md:p-6 rounded-[20px] border border-slate-50 hover:border-blue-100 bg-white flex items-center justify-between transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl">
                                                        <div className="flex items-center gap-4 md:gap-6">
                                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 border border-blue-100 text-lg md:text-2xl shadow-inner">
                                                                {app.student_name?.[0]}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-black text-slate-900 text-xs md:text-sm leading-none tracking-tight">{app.student_name}</h5>
                                                                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                                        app.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                        app.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                                    }`}>{app.status}</span>
                                                                    {app.resume_url && (
                                                                        <a href={app.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                                                                            <FileText size={12} /> View CV
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                            <button onClick={() => handleStatusUpdate(app.id, 'Shortlisted')} className="p-2 md:p-2.5 hover:bg-amber-50 text-amber-500 rounded-xl transition-all border border-transparent hover:border-amber-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]" title="Shortlist"><Clock size={16} md:size={18} /></button>
                                                            <button onClick={() => handleStatusUpdate(app.id, 'Selected')} className="p-2 md:p-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]" title="Select"><CheckCircle size={16} md:size={18} /></button>
                                                            <button onClick={() => handleStatusUpdate(app.id, 'Rejected')} className="p-2 md:p-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]" title="Reject"><XCircle size={16} md:size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            {allApplications.length === 0 && (
                                                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[22px] border border-dashed border-slate-200">
                                                    <Users size={48} className="mx-auto text-slate-200 mb-6" />
                                                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Zero Applicant Profiles Detected</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-24 md:py-32 bg-slate-50/30 rounded-[22px] border border-dashed border-slate-200">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-3xl flex items-center justify-center text-slate-100 shadow-xl mb-6 md:mb-10 animate-bounce duration-[3000ms]">
                                <Search size={32} md:size={48} />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Ecosystem Idle</h3>
                            <p className="text-slate-400 font-bold text-xs md:text-base text-center px-10 mt-2 max-w-sm">Select an active recruitment card from the navigation ribbon to view deep intelligence and management protocols.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlacementTracker;

