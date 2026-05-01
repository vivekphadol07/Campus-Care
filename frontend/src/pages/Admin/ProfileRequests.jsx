import React, { useState, useEffect } from 'react';
import { Check, X, User, FileText, AlertCircle } from 'lucide-react';
import api from '../../utils/axiosInstance';

const ProfileRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/api/profile/admin/requests');
            setRequests(response.data);
        } catch (err) {
            console.error("Fetch requests error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            await api.post('/api/profile/admin/handle-request', { requestId, action });
            fetchRequests();
            alert(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        } catch (err) {
            alert("Action failed");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto p-4 md:p-12">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-rose-600 mb-2">
                        <AlertCircle size={18} />
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em]">Identity Security</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Profile <span className="text-rose-600">Audit</span></h2>
                    <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Sensitive information change verification</p>
                </div>
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl relative z-10">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{requests.length} Pending</span>
                </div>
            </header>

            {requests.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                    <p className="text-slate-400">No pending profile update requests.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900">{req.name}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{req.roll_number}</p>
                                </div>
                            </div>

                            <div className="flex-1 px-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field:</span>
                                    <span className="text-sm font-black text-blue-600 uppercase">{req.field_name.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-slate-400 line-through">{req.old_value || 'None'}</div>
                                    <div className="text-blue-500"><FileText size={14} /></div>
                                    <div className="text-sm font-bold text-slate-900">{req.new_value}</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAction(req.id, 'approve')}
                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
                                >
                                    <Check size={20} />
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm shadow-rose-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileRequests;
