import React from 'react';
import { Send, MessageCircle, Link as LinkIcon, Camera, Video, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-transparent text-slate-600 pt-24 pb-10 border-t border-white/40 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-300/40 rounded-full blur-[150px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-300/40 rounded-full blur-[150px] pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Newsletter Section */}
        <div className="bg-white/40 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/60 mb-20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-slate-200/50">
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">Stay ahead in your journey</h3>
            <p className="text-slate-650 font-medium text-base">Join our newsletter for the latest exam updates, study materials, and success strategies.</p>
          </div>
          <div className="w-full md:w-auto flex-1 max-w-md relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-full p-1.5 border border-slate-200 shadow-sm">
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                className="w-full bg-transparent border-none px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 font-medium"
              />
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-black flex items-center gap-2 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-md text-sm">
                Subscribe <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="col-span-1 md:col-span-4 lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-0.5 bg-white border border-slate-200 rounded-full shadow-sm overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Dnyanniti Logo" className="w-12 h-12 object-cover rounded-full" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Dnyanniti</span>
            </div>
            <p className="text-slate-600 max-w-sm leading-relaxed mb-8 font-medium">
              Empowering students through fair, transparent, and technology-driven examination solutions. Join our mission to democratize quality education.
            </p>
            <div className="flex gap-4">
              {[
                { icon: MessageCircle, href: '#' },
                { icon: LinkIcon, href: '#' },
                { icon: Camera, href: '#' },
                { icon: Video, href: '#' }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:border-white hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-4 lg:col-span-3">
            <h4 className="text-slate-900 font-bold mb-8 uppercase tracking-widest text-sm">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: 'Student Dashboard', path: '/' },
                { name: 'About Our Platform', path: '/#about' },
                { name: 'Contact Support', path: '/#contact' },
                { name: 'Admin Portal', path: '/admin-login' }
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.path} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-colors"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4 lg:col-span-4">
            <h4 className="text-slate-900 font-bold mb-8 uppercase tracking-widest text-sm">Resources</h4>
            <ul className="space-y-4">
              {[
                { name: 'Study Material', path: '/study-material' },
                { name: 'Results & Analytics', path: '/results' },
                { name: 'Privacy Policy', path: '#' },
                { name: 'Terms of Service', path: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-slate-600 hover:text-cyan-600 font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/40 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 font-medium">
          <div>
            <p>© {new Date().getFullYear()} Dnyanniti Training and Research Private Limited. All rights reserved.</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Developed and Designed by Pooja Mandale</p>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white/80 shadow-sm">
            <span>Crafted with</span>
            <span className="text-sky-500 animate-pulse">❤️</span>
            <span>for scholars</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
