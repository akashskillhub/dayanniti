import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Video, Calendar, Sparkles } from 'lucide-react';

const LiveClasses = () => {
  const { user } = useSelector((state) => state.user);
  const [zoomClasses, setZoomClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchZoomClasses = async () => {
      try {
        const res = await fetch('/api/zoom-classes');
        if (res.ok) {
          const data = await res.json();
          setZoomClasses(data.data || data);
        }
      } catch (err) {
        console.error("Error fetching Zoom classes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchZoomClasses();
  }, []);

  // Filter Zoom classes to show only relevant classes for the logged in student standard
  const filteredZoomClasses = zoomClasses.filter(cls => {
    if (!cls.std || cls.std === 'All') return true;
    if (!user?.std) return true; // Show all if student standard is not defined
    
    const cleanStd = (str) => str.replace(/std|standard/g, '').replace(/th|st|nd|rd/g, '').trim().toLowerCase();
    return cleanStd(cls.std) === cleanStd(user.std.toString());
  });

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Background Image Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/95 backdrop-blur-[3px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-6 md:p-12 space-y-12">
        {/* Header Section */}
        <div className="text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 text-xs font-black tracking-widest uppercase shadow-sm">
            <Sparkles size={14} className="text-indigo-500 animate-spin-slow" />
            <span>Interactive Learning Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Today's Live Classes
          </h1>
          <p className="text-slate-550 mt-3 text-base font-semibold leading-relaxed">
            Attend live lectures, clear your doubts, and interact with teachers in real-time. Simply click any Zoom link below to join.
          </p>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-650 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] animate-pulse">Retrieving links...</p>
          </div>
        ) : filteredZoomClasses.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/40 p-16 rounded-[2.5rem] text-center max-w-xl mx-auto animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 border border-slate-200">
              <Video size={28} className="text-slate-405" />
            </div>
            <h3 className="text-xl font-black text-slate-805">No links available for now</h3>
            <p className="text-slate-400 text-xs mt-2 font-semibold max-w-xs mx-auto leading-relaxed">
              There are no live Zoom sessions scheduled for your standard today. Please check back later or consult the academic calendar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {filteredZoomClasses.map((cls) => {
              const start = new Date(cls.startTime);
              const end = new Date(cls.endTime);
              const isLive = new Date() >= start && new Date() <= end;
              
              return (
                <div key={cls._id} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 rounded-[2rem] p-8 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[45px] -translate-y-1/2 translate-x-1/2 opacity-30 ${isLive ? 'bg-rose-350' : 'bg-indigo-350'}`}></div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isLive 
                          ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {isLive ? 'LIVE NOW' : 'Upcoming'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-3 py-1 rounded-full">
                        {cls.std === 'All' ? 'General' : `${cls.std} Std`}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-2xl text-slate-900 leading-snug group-hover:text-indigo-650 transition-colors mb-6 relative z-10">
                      {cls.subject}
                    </h4>
                  </div>

                  <div className="space-y-4 relative z-10 mt-auto">
                    <div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-505 font-bold">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-505 font-bold">
                        <Clock size={14} className="text-indigo-500 shrink-0" />
                        <span>
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <a 
                      href={cls.zoomLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-md ${
                        isLive 
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/20' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                      }`}
                    >
                      <Video size={18} />
                      Join Zoom Meeting
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClasses;
