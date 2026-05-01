import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-full ${color} text-white`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{title}</p>
                <h3 className="text-xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;
