import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, Sparkles, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <section id="contact" className="text-slate-800 pb-24 relative overflow-hidden font-sans bg-transparent">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-300/40 rounded-full blur-[130px] -z-0 animate-pulse mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-300/40 rounded-full blur-[130px] -z-0 animate-pulse mix-blend-multiply" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-[40%] left-[10%] w-[500px] h-[500px] bg-sky-300/40 rounded-full blur-[120px] -z-0 mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-6 pt-10 relative z-10">
        
        {/* Hero Section */}
        <section className="text-center mb-24 pt-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/60 border border-white/50 text-xs font-black mb-8 tracking-[0.2em] uppercase text-indigo-600 shadow-sm backdrop-blur-md">
            <MessageSquare size={16} />
            <span>24/7 Support Center</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight text-slate-900">
            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-600 to-sky-500 animate-gradient-x">Connect</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions about our exams or need technical support? We're here to help you every step of the way.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-12 mb-20">
          
          {/* Contact Info Cards */}
          <div className="space-y-8">
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 group hover:border-white transition-all duration-500">
              <h3 className="text-xl font-black mb-10 uppercase tracking-widest text-slate-500">Reach Us</h3>
              
              <div className="space-y-10">
                {[
                  { icon: Mail, label: 'Email Us', value: 'vijayjadhavadv@gmail.com', color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
                  { icon: Phone, label: 'Adv. Vijay Jadhav', value: '+91 98503 04481', color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
                  { icon: Phone, label: 'Office Contact', value: '+91 84849 94465', color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
                  { icon: MapPin, label: 'Visit Us', value: '401, Rangoli Building, 1st Floor, Arch Angan, Mitmita Road, Padegaon, Chhatrapati Sambhajinagar - 431002', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 group/item cursor-pointer">
                    <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center border ${item.border} group-hover/item:scale-110 group-hover/item:rotate-3 transition-transform duration-300`}>
                      <item.icon size={28} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-slate-800 tracking-tight group-hover/item:text-indigo-600 transition-colors">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/60 border border-white/60 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 backdrop-blur-md">
              <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-600">Office Hours</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-bold">Mon - Fri</span>
                  <span className="text-slate-900 font-black px-4 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-bold">Sat</span>
                  <span className="text-slate-900 font-black px-4 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-bold">Sun</span>
                  <span className="text-sky-600 font-black px-4 py-1.5 bg-sky-100 border border-sky-200 rounded-xl uppercase tracking-widest text-[10px]">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-10 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/30 rounded-full blur-[60px] pointer-events-none mix-blend-multiply"></div>
            
            <h3 className="text-2xl font-black mb-8 tracking-tighter text-slate-900">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Full Name</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Your Name"
                  className="w-full px-5 py-3 bg-white/80 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 font-bold shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Email Address</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="your@email.com"
                  className="w-full px-5 py-3 bg-white/80 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 font-bold shadow-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Subject</label>
                <input 
                  type="text" name="subject" required value={formData.subject} onChange={handleChange} placeholder="How can we help?"
                  className="w-full px-5 py-3 bg-white/80 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 font-bold shadow-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Message</label>
                <textarea 
                  name="message" required rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us more..."
                  className="w-full px-5 py-3 bg-white/80 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 font-bold shadow-sm resize-none"
                ></textarea>
              </div>

              <div className="md:col-span-2 mt-2">
                <button 
                  type="submit"
                  className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  SEND MESSAGE
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <section 
          ref={mapContainerRef}
          className="bg-white/50 backdrop-blur-xl border border-white/60 p-4 rounded-[3rem] overflow-hidden h-[500px] relative group shadow-xl shadow-slate-200/50"
        >
          {shouldLoadMap ? (
            <>
              {!mapLoaded && (
                <div className="absolute inset-4 rounded-[2.5rem] bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-pulse z-20">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Google Maps...</span>
                </div>
              )}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8038583411054!2d72.8633633!3d19.0289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf20e290f9d9%3A0xc317511c5218d6e!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1715420000000!5m2!1sen!2sin" 
                className={`w-full h-full rounded-[2.5rem] transition-opacity duration-1000 border-0 ${
                  mapLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'
                }`}
                allowFullScreen="" 
                onLoad={() => setMapLoaded(true)}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </>
          ) : (
            <div className="w-full h-full rounded-[2.5rem] bg-slate-50/50 flex flex-col items-center justify-center gap-3">
              <MapPin size={32} className="text-slate-400 animate-bounce" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scrolling down to map...</span>
            </div>
          )}
          
          <div className="absolute top-10 left-10 p-6 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-lg pointer-events-none z-30">
            <h4 className="text-lg font-black tracking-tight mb-1 text-slate-900">Our Head Office</h4>
            <p className="text-xs font-bold text-slate-500">Chhatrapati Sambhajinagar, MH</p>
          </div>
        </section>

      </div>
    </section>
  );
};

export default Contact;
