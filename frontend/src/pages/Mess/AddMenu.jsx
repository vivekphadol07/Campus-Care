import React, { useState, useEffect } from 'react';
import { Utensils, Send, Clock, Sparkles, Activity, ArrowRight, Save } from 'lucide-react';
import api from '../../utils/axiosInstance';

// Import images
import breakfastImg from '../../Images/breakfast.png';
import lunchImg from '../../Images/lunch.png';
import dinnerImg from '../../Images/dinner.png';

const AddMenu = () => {
    const [menu, setMenu] = useState({ breakfast: '', lunch: '', dinner: '' });
    const [currentMenu, setCurrentMenu] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchCurrentMenu();
    }, []);

    const cleanMenu = (str) => {
        if (!str) return '';
        try {
            return str.replace(/\\"/g, '"').replace(/^"(.*)"$/, '$1').replace(/\\/g, '');
        } catch {
            return str;
        }
    };

    const fetchCurrentMenu = async () => {
        try {
            const res = await api.get(`/api/mess/menu?date=${today}`);
            if (res.data) {
                setCurrentMenu(res.data);
                setMenu({
                    breakfast: cleanMenu(res.data.breakfast),
                    lunch: cleanMenu(res.data.lunch),
                    dinner: cleanMenu(res.data.dinner)
                });
            }
        } catch (err) {
            console.error("Error fetching menu:", err);
        }
    };

    const handleUpdateMenu = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/mess/menu', { ...menu, date: today });
            alert("Menu updated successfully!");
            fetchCurrentMenu();
        } catch (err) {
            alert("Failed to update menu");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-12 p-4 md:p-12">
            {/* Standard Institutional Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Menu <span className="text-emerald-500">Manager</span></h2>
                </div>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl relative z-10 flex items-center gap-3">
                    <Clock size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Registry</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                {/* Left: Live Previews */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="p-2 bg-slate-900 text-white rounded-xl">
                            <Utensils size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Live Registry</h3>
                    </div>

                    {[
                        { type: 'BREAKFAST', img: breakfastImg, items: currentMenu?.breakfast, color: 'amber' },
                        { type: 'LUNCH', img: lunchImg, items: currentMenu?.lunch, color: 'blue' },
                        { type: 'DINNER', img: dinnerImg, items: currentMenu?.dinner, color: 'indigo' },
                    ].map((meal, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center gap-8 group hover:border-emerald-200 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] overflow-hidden shrink-0 border-4 border-slate-50 shadow-inner">
                                <img src={meal.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-${meal.color}-500`} />
                                    <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">{meal.type}</h4>
                                </div>
                                <p className="text-slate-800 text-xs font-bold truncate leading-tight">
                                    {cleanMenu(meal.items) || 'Pending broadcast'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Broadcast Console */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
                        
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-lg shadow-emerald-100">
                                <Send size={28} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Broadcast Console</h3>
                        </div>

                        <form className="space-y-12" onSubmit={handleUpdateMenu}>
                            <div className="grid grid-cols-1 gap-10">
                                {[
                                    { id: 'breakfast', label: 'Morning Session (Breakfast)', placeholder: 'Eg: Masala Dosa, Chutney, Tea' },
                                    { id: 'lunch', label: 'Noon Session (Lunch)', placeholder: 'Eg: Steamed Rice, Dal Fry, Seasonal Sabji' },
                                    { id: 'dinner', label: 'Evening Session (Dinner)', placeholder: 'Eg: Butter Roti, Paneer Makhani, Salad' }
                                ].map((field) => (
                                    <div key={field.id} className="space-y-4">
                                        <label className="text-xs font-bold uppercase text-slate-400 px-2 tracking-widest">{field.label}</label>
                                        <textarea 
                                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-800 transition-all min-h-[100px] resize-none shadow-inner text-sm md:text-base"
                                            placeholder={field.placeholder}
                                            value={menu[field.id]} 
                                            onChange={(e) => setMenu({...menu, [field.id]: e.target.value})}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 md:py-5 rounded-xl font-bold text-sm md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl shadow-slate-200 group">
                                <Save size={20} className="group-hover:scale-110 transition-transform" /> Synchronize & Broadcast Menu
                            </button>
                        </form>

                        {/* Background Decoration */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] opacity-50" />
                    </div>

                    <div className="mt-10 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/20">
                                <Sparkles size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2 italic">Institutional Directive</h4>
                                <p className="text-slate-400 font-bold leading-relaxed text-sm">
                                    Broadcasts are synchronized globally across student dashboards. Ensure accuracy to maintain high operational satisfaction scores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMenu;
