import React from 'react';
import { MapPin, Bus, Clock, Map, PhoneCall, AlertTriangle } from 'lucide-react';
import busImg from '../../Images/bus.png';

const Transport = () => {
    const schedules = [
        { route: 'Main Gate to Academic Block', time: 'Every 15 mins', status: 'Running', type: 'Shuttle' },
        { route: 'Hostel A to Sports Complex', time: '08:00 AM, 12:00 PM, 05:00 PM', status: 'On Time', type: 'Bus' },
        { route: 'City Mall Express', time: 'Saturday & Sunday only', status: 'Inactive', type: 'External' },
    ];

    const alerts = [
        { type: 'Delay', message: 'Route 4 is delayed by 10 mins due to campus construction.', time: '2 mins ago' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-12 p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Transport</span></h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-widest">System Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Live Tracking View */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="relative h-64 md:h-96 rounded-[22px] overflow-hidden shadow-2xl border border-slate-100 group">
                        <img src={busImg} alt="Bus Tracker" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                        
                        {/* Fake Tracking UI Overlay */}
                        <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                                        <Bus size={24} md:size={32} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-base md:text-lg tracking-tight">Shuttle #142</p>
                                        <p className="text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none mt-1">Live Tracking: Enroute to Library</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-xl md:text-2xl leading-none">4 MINS</p>
                                    <p className="text-white/40 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Est. Arrival</p>
                                </div>
                            </div>
                            <div className="w-full bg-white/10 h-2 md:h-3 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            </div>
                        </div>

                        {/* Floating Action Button */}
                        <button className="absolute top-6 md:top-10 right-6 md:right-10 p-4 md:p-5 bg-white text-slate-900 rounded-2xl md:rounded-3xl shadow-2xl hover:scale-110 transition-all hover:bg-blue-600 hover:text-white group">
                            <Map size={24} md:size={28} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {alerts.map((alert, i) => (
                            <div key={i} className="bg-amber-50 p-5 md:p-6 rounded-[20px] md:rounded-3xl border border-amber-100 flex items-start gap-3 md:gap-4">
                                <div className="p-2 md:p-3 bg-amber-500 rounded-lg md:rounded-2xl text-white shadow-lg shadow-amber-200">
                                    <AlertTriangle size={18} md:size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900 text-xs md:text-sm mb-0.5 md:mb-1">{alert.type} Alert</h4>
                                    <p className="text-amber-800 text-[10px] md:text-xs font-medium leading-relaxed">{alert.message}</p>
                                    <p className="text-amber-600 text-[8px] md:text-[10px] font-bold mt-1.5 md:mt-2 uppercase tracking-widest">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedules & Help */}
                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-[22px] p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-6 md:mb-8">Schedules</h3>
                        <div className="space-y-5 md:space-y-6">
                            {schedules.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 md:gap-4 group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <MapPin size={20} md:size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className="font-bold text-slate-800 text-[10px] md:text-xs truncate pr-2">{item.route}</h4>
                                            <span className={`text-[7px] md:text-[8px] font-bold uppercase tracking-widest px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap ${item.status === 'Running' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{item.status}</span>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 font-medium truncate">{item.time}</p>
                                        <p className="text-[8px] md:text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{item.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[22px] p-5 md:p-6 text-white">
                        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Need Help?</h3>
                        <p className="text-slate-400 text-[10px] md:text-xs font-medium mb-6 md:mb-8 leading-relaxed">Direct line to campus transport management.</p>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95">
                            <PhoneCall size={16} md:size={18} /> Call Transport Cell
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transport;

