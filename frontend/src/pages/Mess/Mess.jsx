import React, { useState, useEffect } from 'react';
import { Utensils, Star, MessageSquare, Clock, Send, Coffee, Moon, TrendingUp, Sparkles, AlertCircle, History, MapPin } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useUser } from '../../context/userContext';

// Import images
import breakfastImg from '../../Images/breakfast.png';
import lunchImg from '../../Images/lunch.png';
import dinnerImg from '../../Images/dinner.png';

const Mess = () => {
    const { user } = useUser();
    const [menu, setMenu] = useState(null);
    const [feedback, setFeedback] = useState({ rating: 5, comment: '', meal_type: 'lunch' });
    const [roomRequest, setRoomRequest] = useState({ room_number: '', reason: '', meal_type: 'lunch' });
    const [myRequests, setMyRequests] = useState([]);
    const [stats, setStats] = useState({ avg_rating: 4.2, total_reviews: 24 });
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchMenu();
        if (user?.role === 'student' || user?.role === 'admin' || user?.role === 'mess_owner') {
            fetchMyRequests();
        }
    }, [user]);

    const fetchMenu = async () => {
        try {
            const res = await api.get(`/api/mess/menu?date=${today}`);
            setMenu(res.data);
        } catch (err) {
            console.error("Error fetching menu:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const res = await api.get('/api/mess/requests');
            setMyRequests(res.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    const handleSubmitRoomRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/mess/request', { ...roomRequest, request_date: today });
            alert("Room delivery request submitted!");
            setRoomRequest({ room_number: '', reason: '', meal_type: 'lunch' });
            fetchMyRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit request");
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/mess/feedback', { ...feedback, date: today });
            alert("Feedback submitted successfully!");
            setFeedback({ rating: 5, comment: '', meal_type: 'lunch' });
        } catch (err) {
            alert("Failed to submit feedback");
        }
    };

    const cleanMenu = (str) => {
        if (!str) return '';
        try {
            // Remove literal slashes and double quotes if they exist
            return str.replace(/\\"/g, '"').replace(/^"(.*)"$/, '$1').replace(/\\/g, '');
        } catch {
            return str;
        }
    };

    const parseMeals = (meal) => {
        try {
            const cleaned = cleanMenu(meal);
            return JSON.parse(cleaned) || [];
        } catch {
            const cleaned = cleanMenu(meal);
            return cleaned ? cleaned.split(',').map(s => s.trim()) : [];
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-indigo-600 font-bold animate-pulse">Initializing Mess Hub...</div>;

    const mealCards = [
        { type: 'Breakfast', time: '07:30 - 09:30', items: parseMeals(menu?.breakfast), color: 'amber', img: breakfastImg, calories: '450 kcal' },
        { type: 'Lunch', time: '12:30 - 14:30', items: parseMeals(menu?.lunch), color: 'blue', img: lunchImg, calories: '850 kcal' },
        { type: 'Dinner', time: '19:30 - 21:30', items: parseMeals(menu?.dinner), color: 'indigo', img: dinnerImg, calories: '700 kcal' },
    ];

    const isStudent = user?.role === 'student';

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-12 p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Dining</span></h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px]">🍳</div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px]">🥗</div>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px]">🍲</div>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-widest">3 Meals Active</span>
                </div>
            </header>

            {/* Top Row: Today's Menu (The Highlight) */}
            <div className="bg-white rounded-[22px] md:rounded-[3.5rem] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none hidden md:block">
                    <Utensils size={200} />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 md:mb-10">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Today's <span className="text-indigo-600">Detailed Menu</span></h3>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="px-3 md:px-4 py-1 md:py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Open</div>
                        <div className="px-3 md:px-4 py-1 md:py-1.5 bg-slate-900 text-white rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{today}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                    {mealCards.map((meal, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-[1.8rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <span className={`text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-${meal.color}-600 bg-${meal.color}-50 px-2.5 md:px-3 py-1 rounded-lg`}>{meal.type}</span>
                                <Clock size={12} className="text-slate-300" />
                            </div>
                            <ul className="space-y-3 md:space-y-4">
                                {meal.items.length > 0 ? meal.items.map((item, i) => (
                                    <li key={i} className="text-xs md:text-sm font-bold text-slate-700 flex items-start gap-2 md:gap-3">
                                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-${meal.color}-400 mt-1.5 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)]`} />
                                        {item}
                                    </li>
                                )) : <li className="text-xs text-slate-300 italic">No menu published</li>}
                            </ul>
                            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{meal.time}</p>
                                <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-1.5 md:py-0.5 rounded shadow-[0_4px_20px_rgba(0,0,0,0.02)]">{meal.calories}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Column 1: Info & Stats */}
                <div className="space-y-6 md:space-y-8">
                    <div className="bg-slate-900 rounded-[22px] p-5 md:p-6 text-white relative overflow-hidden shadow-2xl h-fit">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 md:mb-6 opacity-60">
                                <TrendingUp size={14} />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Satisfaction Score</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <h4 className="text-4xl md:text-6xl font-bold">{stats.avg_rating}</h4>
                                <Star size={24} md:size={32} fill="#facc15" stroke="none" />
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm font-bold leading-relaxed mb-6 md:mb-8">
                                Students are loving it! Join {stats.total_reviews} others.
                            </p>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-4/5 h-full bg-indigo-500" />
                            </div>
                        </div>
                        <Sparkles className="absolute -right-4 -top-4 text-indigo-500/20" size={100} md:size={120} />
                    </div>

                    <div className="bg-white rounded-[22px] p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 md:space-y-6">
                        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={16} md:size={18} className="text-indigo-600" /> Dining Schedule
                        </h3>
                        <div className="space-y-3 md:space-y-4">
                            {mealCards.map((meal, idx) => (
                                <div key={idx} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-colors">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden shrink-0">
                                        <img src={meal.img} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-[10px] md:text-xs">{meal.type}</h4>
                                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold">{meal.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Room Delivery Form & Feedback */}
                <div className="lg:col-span-2 space-y-6 md:space-y-10">
                    <div className={`grid grid-cols-1 ${isStudent ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 md:gap-8`}>
                        {/* Delivery Request Box */}
                        {isStudent && (
                            <div className="bg-white rounded-[22px] p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                                <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
                                    <MapPin size={18} md:size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-bold leading-none">Room Order</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Sick or Busy? We deliver.</p>
                                </div>
                            </div>

                            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmitRoomRequest}>
                                <div className="space-y-1">
                                    <label className="text-[8px] md:text-[9px] font-bold uppercase text-slate-400 ml-1">Room No</label>
                                    <input 
                                        required
                                        className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs md:text-sm transition-all"
                                        placeholder="e.g. A-101"
                                        value={roomRequest.room_number} 
                                        onChange={(e) => setRoomRequest({...roomRequest, room_number: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] md:text-[9px] font-bold uppercase text-slate-400 ml-1">Meal</label>
                                    <select 
                                        className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs md:text-sm transition-all"
                                        value={roomRequest.meal_type} 
                                        onChange={(e) => setRoomRequest({...roomRequest, meal_type: e.target.value})}
                                    >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] md:text-[9px] font-bold uppercase text-slate-400 ml-1">Reason</label>
                                    <input 
                                        required
                                        className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 outline-none font-medium text-slate-600 text-xs md:text-sm transition-all"
                                        placeholder="e.g. Not feeling well"
                                        value={roomRequest.reason}
                                        onChange={(e) => setRoomRequest({...roomRequest, reason: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 md:py-4 rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-2">
                                    <Send size={12} /> Request Delivery
                                </button>
                            </form>
                        </div>
                        )}

                        {/* Feedback Box */}
                        <div className={`bg-indigo-600 rounded-[22px] p-5 md:p-6 text-white shadow-xl relative overflow-hidden transition-all ${!isStudent ? 'md:p-12' : ''}`}>
                            <Sparkles className="absolute -right-4 -bottom-4 text-white/10" size={80} md:size={100} />
                            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                                <div className="p-2.5 md:p-3 bg-white/10 text-white rounded-xl md:rounded-2xl">
                                    <Star size={18} md:size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-black leading-none">Quick Rate</h3>
                                    <p className="text-[9px] text-indigo-100 font-bold uppercase tracking-wider mt-1">Help us improve meals</p>
                                </div>
                            </div>

                            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmitFeedback}>
                                <div className="flex justify-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star 
                                            key={s} 
                                            size={24} md:size={28} 
                                            fill={s <= feedback.rating ? "#facc15" : "none"}
                                            stroke={s <= feedback.rating ? "#facc15" : "rgba(255,255,255,0.3)"}
                                            onClick={() => setFeedback({...feedback, rating: s})}
                                            className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                                        />
                                    ))}
                                </div>
                                <div className={`grid grid-cols-1 ${isStudent ? '' : 'sm:grid-cols-2'} gap-4`}>
                                    <div className="space-y-1">
                                    <label className="text-[8px] md:text-[9px] font-black uppercase text-indigo-100 ml-1">Select Meal</label>
                                    <select 
                                        className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-white/10 border border-white/10 focus:bg-white/20 outline-none font-bold text-white text-xs md:text-sm transition-all"
                                        value={feedback.meal_type} 
                                        onChange={(e) => setFeedback({...feedback, meal_type: e.target.value})}
                                    >
                                        <option className="text-slate-900" value="breakfast">Breakfast</option>
                                        <option className="text-slate-900" value="lunch">Lunch</option>
                                        <option className="text-slate-900" value="dinner">Dinner</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] md:text-[9px] font-black uppercase text-indigo-100 ml-1">Comment</label>
                                    <input 
                                        className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-white/10 border border-white/10 focus:bg-white/20 outline-none font-medium text-white placeholder:text-white/40 text-xs md:text-sm transition-all"
                                        placeholder="Food was amazing!"
                                        value={feedback.comment}
                                        onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                                    />
                                </div>
                                </div>
                                <button type="submit" className="w-full bg-white text-indigo-600 py-3.5 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-xl flex items-center justify-center gap-2 mt-2">
                                    <Send size={12} /> Submit Feedback
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Delivery History Tracking - Conditional Visibility */}
                    {(isStudent || user?.role === 'admin' || user?.role === 'mess_owner') && (
                        <div className="bg-white rounded-[22px] p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
                                <History size={20} className="text-indigo-600" /> 
                                {isStudent ? 'My Delivery History' : 'Meal Service Registry'}
                            </h3>
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isStudent ? 'Order Status' : 'Institutional Logs'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {myRequests.length > 0 ? myRequests.map((req, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
                                            req.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                                            req.status === 'Approved' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            <Utensils size={16} md:size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-[10px] md:text-xs uppercase leading-none">
                                                {req.room_number} — {req.student_name || 'Student'}
                                            </h4>
                                            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold mt-1">{req.meal_type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 ${
                                            req.status === 'Delivered' ? 'text-emerald-500' :
                                            req.status === 'Approved' ? 'text-blue-500' : 'text-amber-500'
                                        }`}>{req.status}</p>
                                        <p className="text-[7px] md:text-[8px] text-slate-300 font-bold">{new Date(req.request_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-6 text-center text-slate-400 italic text-xs md:text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">No active delivery requests.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default Mess;

