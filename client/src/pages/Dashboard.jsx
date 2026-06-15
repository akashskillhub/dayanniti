import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Calendar, Target, BookOpen, ArrowRight,
  TrendingUp, Clock, BrainCircuit, MessageSquareHeart,
  ChevronRight, Sparkles, Zap, Shield, Video
} from 'lucide-react';
import About from './About';
import Contact from './Contact';

const DnyannitiDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [zoomClasses, setZoomClasses] = useState([]);

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
      }
    };
    fetchZoomClasses();
  }, []);

  // Filter Zoom classes to show only relevant classes for the logged in student
  const filteredZoomClasses = zoomClasses.filter(cls => {
    if (!cls.std || cls.std === 'All') return true;
    if (!user?.std) return true; // Show all if student standard is not defined
    
    const cleanStd = (str) => str.replace(/std|standard/g, '').replace(/th|st|nd|rd/g, '').trim().toLowerCase();
    return cleanStd(cls.std) === cleanStd(user.std.toString());
  });

  const stats = [
    { label: 'Exams Completed', value: '12', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    { label: 'Upcoming Exams', value: '03', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    { label: 'Avg. Accuracy', value: '94%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2000')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12 p-4 md:p-8 lg:p-12">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-[2rem] p-8 md:p-12 relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 group">
            {/* Ambient light in hero */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-200/50 transition-colors duration-1000"></div>
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/80 border border-white text-indigo-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                <Sparkles size={14} className="text-indigo-500" />
                <span>Welcome Back, Scholar</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-slate-900">
                Unlock Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-600 to-sky-500 animate-gradient-x">
                  Full Potential
                </span>
              </h2>
              <p className="text-slate-600 text-lg mb-10 font-medium leading-relaxed max-w-md">
                Master your subjects with personalized assessments, real-time analytics, and data-driven insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/exams')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-slate-900/20">
                  Start Assessment <ArrowRight size={20} />
                </button>
                <button onClick={() => navigate('/study-material')} className="bg-white/80 text-slate-800 border border-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-white transition-all duration-300 shadow-sm">
                  <BookOpen size={20} /> Study Material
                </button>
              </div>
            </div>
            
            {/* Decorative Image/Illustration */}
            <div className="hidden md:block absolute right-[-5%] bottom-[-10%] w-[50%] h-[120%] opacity-80 group-hover:opacity-100 transition-all duration-700 mix-blend-multiply">
               <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover rounded-tl-full shadow-2xl" alt="Students learning" />
               <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent"></div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex-1 bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg shadow-slate-200/50 p-6 rounded-[2rem] flex items-center gap-5 hover:-translate-y-1 hover:bg-white/80 transition-all duration-300 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                  <stat.icon size={28} />
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Zoom Classes Section */}
        {user && filteredZoomClasses.length > 0 && (
          <section id="live-classes" className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                Today's Live Classes
              </h3>
              <span className="text-indigo-600 text-xs font-black uppercase tracking-wider">Join on Zoom</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredZoomClasses.map((cls) => {
                const start = new Date(cls.startTime);
                const end = new Date(cls.endTime);
                const isLive = new Date() >= start && new Date() <= end;
                
                return (
                  <div key={cls._id} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 rounded-[2rem] p-6 transition-all duration-305 relative overflow-hidden flex flex-col justify-between group">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[45px] -translate-y-1/2 translate-x-1/2 opacity-30 ${isLive ? 'bg-rose-350' : 'bg-indigo-350'}`}></div>
                    
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isLive 
                          ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {isLive ? 'LIVE NOW' : 'Upcoming'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-full">
                        {cls.std === 'All' ? 'General' : `${cls.std} Std`}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xl text-slate-900 leading-snug group-hover:text-indigo-650 transition-colors mb-6 relative z-10">
                      {cls.subject}
                    </h4>

                    <div className="space-y-4 relative z-10 mt-auto">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <Clock size={16} className="text-indigo-500 shrink-0" />
                        <span>
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <a 
                        href={cls.zoomLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-305 active:scale-[0.98] shadow-md ${
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
          </section>
        )}

        {/* Features Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Zap size={24} className="text-indigo-500" />
              Quick Access
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { title: 'Performance', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-100', path: '/results' },
              { title: 'Study Material', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-100', path: '/study-material' },
              { title: 'Help Desk', icon: MessageSquareHeart, color: 'text-cyan-600', bg: 'bg-cyan-100', path: '/contact' },
              { title: 'Security', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/profile' }
            ].map((item, i) => (
              <div 
                key={i} 
                onClick={() => navigate(item.path)}
                className="bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 hover:border-white hover:bg-white/80 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${item.bg} rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className={`mb-6 p-4 rounded-2xl inline-block ${item.bg} border border-white/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <item.icon size={28} className={item.color} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                <div className="mt-4 flex items-center text-sm text-indigo-500 font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Explore <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Embedded Sections for Single-Page Experience */}
      <About />
      <Contact />
    </div>
  );
};

export default DnyannitiDashboard;