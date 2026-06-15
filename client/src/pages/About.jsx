import React from 'react';
import { Target, Users, Shield, Award, BookOpen, Zap, CheckCircle2, Sparkles, TrendingUp, Globe } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Active Students', value: '50K+', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    { label: 'Exams Conducted', value: '1.2M+', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { label: 'Success Rate', value: '94%', icon: Target, color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
    { label: 'Verified Partners', value: '200+', icon: Shield, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
  ];

  return (
    <section id="about" className="text-slate-800 pb-24 pt-20 relative overflow-hidden font-sans bg-transparent">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-300/40 rounded-full blur-[130px] -z-0 animate-pulse mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-300/40 rounded-full blur-[130px] -z-0 animate-pulse mix-blend-multiply" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-[40%] left-[10%] w-[500px] h-[500px] bg-sky-300/40 rounded-full blur-[120px] -z-0 mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-6 pt-10 relative z-10">
        
        {/* Hero Section */}
        <section className="text-center mb-32 pt-10">
          <div className="inline-flex items-center px-6 py-2 rounded-full bg-white/60 border border-white/50 text-xs font-black mb-10 tracking-[0.2em] uppercase text-indigo-600 shadow-sm backdrop-blur-md">
            <span>Pioneering Digital Education</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight text-slate-900">
            Empowering the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-600 to-sky-500 animate-gradient-x">Next Generation</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Dnyanniti is a premium educational ecosystem designed to provide fair, transparent, and high-quality assessments to scholars across the nation.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/50 backdrop-blur-xl border border-white/60 p-10 rounded-[2rem] group hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
               <div className={`absolute -right-4 -top-4 w-32 h-32 ${stat.bg} rounded-full blur-[30px] opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
              
              <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-8 border ${stat.border} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <stat.icon size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight relative z-10">{stat.value}</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs relative z-10">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Vision Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300 to-cyan-300 rounded-[3rem] blur opacity-50 group-hover:opacity-70 transition duration-1000 animate-pulse"></div>
            <div className="relative rounded-[3rem] overflow-hidden border border-white/60 aspect-[4/3] shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200" 
                alt="Students" 
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[2000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 pr-6 rounded-full border border-white/50 shadow-sm">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <Globe size={20} className="text-white" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">Global Excellence</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-tight">Our Mission & <br />Vision</h2>
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              We democratize access to quality education. We believe that location or background should never be a barrier to demonstrating one's academic potential.
            </p>
            
            <div className="space-y-6">
              {[
                'Bridging the gap between talent and opportunity',
                'Leveraging AI for personalized learning insights',
                'Building the most secure proctoring network',
                'Supporting rural education through tech-first initiatives'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group bg-white/40 p-4 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200 group-hover:bg-emerald-200 transition-all group-hover:scale-110">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-bold tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/40 backdrop-blur-2xl p-12 md:p-20 overflow-hidden relative shadow-xl rounded-[3rem] border border-white/60">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: 'Secure Environment', desc: 'Advanced proctoring mechanisms ensuring integrity.', icon: Shield, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
              { title: 'Instant Results', desc: 'Get detailed performance analysis immediately.', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
              { title: 'Scholarships', desc: 'Connecting talent with merit-based opportunities.', icon: Award, color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
              { title: 'Accessibility', desc: 'Optimized for all devices and connection speeds.', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
            ].map((feature, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </section>
  );
};

export default About;
