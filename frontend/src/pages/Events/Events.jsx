import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Tag, Plus, X, ChevronLeft, ChevronRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useUser } from '../../context/userContext';

// Import images
import seminarImg from '../../Images/seminar.png';
import festImg from '../../Images/fest.png';

const Events = () => {
    const { user } = useUser();
    const [events, setEvents] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', start_date: '', end_date: '', type: 'academic', location: '', is_important: false
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/api/events');
            setEvents(res.data);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/events', newEvent);
            setShowAddModal(false);
            fetchEvents();
            setNewEvent({ title: '', description: '', start_date: '', end_date: '', type: 'academic', location: '', is_important: false });
        } catch (err) {
            alert("Failed to add event");
        }
    };

    // Calendar logic
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const numDays = daysInMonth(currentMonth, currentYear);
    const startDay = (firstDayOfMonth(currentMonth, currentYear) + 6) % 7;

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) calendarDays.push(null);
    for (let i = 1; i <= numDays; i++) calendarDays.push(i);

    const eventsToday = events.filter(e => {
        const d = new Date(e.start_date);
        return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-12 p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-indigo-600">Events</span></h2>
                </div>
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <button 
                        className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                        onClick={() => setShowAddModal(!showAddModal)}
                    >
                        {showAddModal ? <><X size={18} /> Close Form</> : <><Plus size={18} /> Add Event</>}
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 items-start">
                {/* Calendar View */}
                <div className={`lg:col-span-2 bg-white rounded-[22px] p-4 md:p-10 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500`}>
                    <div className="flex items-center justify-between mb-8 md:mb-12 px-2 md:px-4">
                        <button className="p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-colors"><ChevronLeft size={18} md:size={20} /></button>
                        <h3 className="text-sm md:text-lg font-bold text-slate-400 uppercase tracking-widest leading-none">{monthNames[currentMonth]} {currentYear}</h3>
                        <button className="p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-colors"><ChevronRight size={18} md:size={20} /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 md:gap-y-8 text-center">
                        {weekDays.map(d => (
                            <div key={d} className="text-[7px] md:text-[9px] font-bold text-slate-300 tracking-widest mb-2 md:mb-4">{d}</div>
                        ))}
                        {calendarDays.map((day, idx) => {
                            const isSelected = day === selectedDate.getDate() && currentMonth === selectedDate.getMonth();
                            return (
                                <div key={idx} className="relative group cursor-pointer h-10 md:h-16 flex items-center justify-center">
                                    {day && (
                                        <>
                                            <div 
                                                className={`w-8 h-8 md:w-14 md:h-14 flex items-center justify-center rounded-lg md:rounded-2xl font-bold text-[10px] md:text-xs transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg md:shadow-2xl shadow-indigo-200 scale-110' : 'text-slate-500 hover:bg-slate-50'}`}
                                                onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                                            >
                                                {day}
                                            </div>
                                            {events.some(e => new Date(e.start_date).getDate() === day && new Date(e.start_date).getMonth() === currentMonth) && (
                                                <div className="absolute bottom-0.5 md:bottom-2 w-1 md:w-1.5 h-1 md:h-1.5 bg-indigo-600 rounded-full" />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Daily List or Add Form */}
                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    {showAddModal ? (
                        <div className="bg-white rounded-[22px] p-5 md:p-6 border border-slate-100 shadow-2xl animate-in slide-in-from-right duration-500">
                            <h4 className="text-lg md:text-xl font-bold text-indigo-600 flex items-center gap-2 mb-6 md:mb-8">
                                <Plus size={18} /> Publish New Event
                            </h4>
                            <form onSubmit={handleAddEvent} className="space-y-4 md:space-y-5">
                                <input placeholder="Event Title" className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none font-bold text-sm md:text-base" required onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
                                <textarea placeholder="Description" className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none font-medium text-sm md:text-base min-h-[80px] md:min-h-[100px]" onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
                                
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <input type="date" className="w-full px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-500 text-xs md:text-sm" required onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})} />
                                    <input type="time" className="w-full px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-500 text-xs md:text-sm" required />
                                </div>

                                <select className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-600 text-sm" onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}>
                                    <option value="academic">Academic / Exam</option>
                                    <option value="placement">Placement Drive</option>
                                    <option value="fest">Cultural Fest</option>
                                    <option value="sports">Sports Meet</option>
                                </select>

                                <input placeholder="Location e.g. Auditorium" className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm" onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} />

                                <div className="flex items-center gap-3 bg-rose-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-rose-100">
                                    <input 
                                        type="checkbox" 
                                        id="important-check"
                                        className="w-4 h-4 md:w-5 md:h-5 accent-rose-600"
                                        onChange={(e) => setNewEvent({...newEvent, is_important: e.target.checked})}
                                    />
                                    <label htmlFor="important-check" className="text-[9px] md:text-xs font-bold text-rose-600 uppercase tracking-tighter">Mark Highly Important</label>
                                </div>

                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg md:shadow-xl shadow-indigo-200">
                                    <CheckCircle2 size={16} md:size={18} /> Publish Globally
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[22px] p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[300px] md:min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <CalendarIcon size={18} md:size={20} className="text-indigo-600" />
                                    <h4 className="font-bold text-slate-800 text-sm md:text-base">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                                </div>
                                <div className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                                    {eventsToday.length}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 md:space-y-6">
                                {eventsToday.length > 0 ? (
                                    eventsToday.map((event, i) => (
                                        <div key={i} className="relative rounded-[20px] overflow-hidden border border-slate-100 group">
                                            <img src={event.type === 'fest' ? festImg : seminarImg} className="w-full h-24 md:h-32 object-cover transition-transform group-hover:scale-110 duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-4 md:p-6 flex flex-col justify-end">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest bg-indigo-600 text-white px-1.5 md:py-0.5 rounded-md">{event.type}</span>
                                                    {event.is_important && <AlertCircle size={10} md:size={12} className="text-rose-500 fill-rose-500" />}
                                                </div>
                                                <h5 className="font-bold text-white text-sm md:text-lg leading-tight truncate">{event.title}</h5>
                                                <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2 text-slate-300 text-[8px] md:text-[10px] font-bold">
                                                    <span className="flex items-center gap-1"><Clock size={10} md:size={12} /> {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={10} md:size={12} /> {event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 md:py-20">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 md:mb-6 border border-amber-100">
                                            <Sparkles size={32} md:size={40} />
                                        </div>
                                        <h5 className="text-lg md:text-xl font-bold text-slate-800 mb-1">Clear Schedule</h5>
                                        <p className="text-[10px] md:text-xs text-slate-400 font-medium">No events for today.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Events;

