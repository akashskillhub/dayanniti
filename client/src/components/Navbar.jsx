import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../redux/userSlice';
import { School, LogOut, User, LayoutDashboard, Info, PhoneCall, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/tests');
        if (res.ok) {
          const data = await res.json();
          setTests(data.data || data);
        }
      } catch (err) {
        console.error("Failed to fetch tests", err);
      }
    };
    fetchTests();
  }, [location.pathname]);

  const isDarkThemePage = false;

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 bg-white/60 backdrop-blur-xl border-b border-white/80`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-0.5 bg-white border border-slate-200 rounded-full shadow-sm group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Dnyanniti Logo" className="w-12 h-12 object-cover rounded-full" />
              </div>
              <span className={`text-2xl font-black tracking-tighter transition-colors ${
                isDarkThemePage ? 'text-white' : 'text-slate-900'
              }`}>
                DNYAN<span className="text-indigo-500">NITI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to={user?.role === 'admin' ? '/admin-dashboard' : '/'} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group relative ${
                location.pathname === '/' || location.pathname === '/admin-dashboard'
                  ? 'text-indigo-650 bg-indigo-50'
                  : 'text-slate-650 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Dashboard
              {(location.pathname === '/' || location.pathname === '/admin-dashboard') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              )}
            </Link>

            <Link 
              to="/exams" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group relative ${
                location.pathname === '/exams'
                  ? 'text-indigo-650 bg-indigo-50'
                  : 'text-slate-655 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Exams
              {location.pathname === '/exams' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              )}
            </Link>

            {user && user.role !== 'admin' && (
              <Link 
                to="/live-classes" 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group relative ${
                  location.pathname === '/live-classes'
                    ? 'text-indigo-650 bg-indigo-50'
                    : 'text-slate-655 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                Live Classes
                {location.pathname === '/live-classes' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                )}
              </Link>
            )}

            {/* Hover Dropdown for Tests */}
            <div className="relative group">
              <button 
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  location.pathname.startsWith('/tests') || location.pathname.startsWith('/take-test')
                    ? 'text-indigo-650 bg-indigo-50'
                    : 'text-slate-650 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                Tests
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300 text-slate-400 group-hover:text-indigo-600" />
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-64 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible scale-95 group-hover:scale-100 transition-all duration-300 z-50 origin-top-left">
                {tests.length === 0 ? (
                  <div className="px-4 py-2 text-xs text-slate-405 font-bold">No tests available</div>
                ) : (
                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    {tests.map((test) => (
                      <Link 
                        key={test._id} 
                        to={`/tests/${test._id}`} 
                        className="block px-4 py-2 text-slate-705 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-extrabold transition-colors truncate"
                      >
                        {test.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link 
              to="/#about" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group relative ${
                location.hash === '#about'
                  ? 'text-indigo-650 bg-indigo-50'
                  : 'text-slate-655 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              About Us
              {location.hash === '#about' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              )}
            </Link>

            <Link 
              to="/#contact" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group relative ${
                location.hash === '#contact'
                  ? 'text-indigo-650 bg-indigo-50'
                  : 'text-slate-655 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Contact Us
              {location.hash === '#contact' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              )}
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to={user.role === 'admin' ? '/admin-dashboard' : '/profile'} 
                  className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
                    isDarkThemePage 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                      : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50">
                      {user.role === 'admin' ? 'Admin' : 'Student'}
                    </div>
                    <div className="text-xs font-bold leading-none">{user.name}</div>
                  </div>
                </Link>
                <button 
                  onClick={onLogout}
                  className={`p-3 rounded-2xl transition-all active:scale-95 border ${
                    isDarkThemePage
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                      : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white'
                  }`}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className={`px-5 py-2.5 font-bold text-sm transition-colors ${
                    isDarkThemePage ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
