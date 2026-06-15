import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login, reset } from "../redux/userSlice";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, GraduationCap, Sparkles, Users, Trophy, Star, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.user);

  // Extracted redirect parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || (user?.role === "admin" ? "/admin-dashboard" : "/");
  const redirectQuery = searchParams.get("redirect");
  const registerLink = redirectQuery ? `/register?redirect=${encodeURIComponent(redirectQuery)}` : "/register";

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) {
      toast.success("Welcome back!");
      navigate(redirectPath);
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch, redirectPath]);

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans">

      {/* ════════════════════════════════════════
          LEFT — Brand / Visual Panel  (50%)
         ════════════════════════════════════════ */}
      <div
        className="hidden lg:flex relative flex-col justify-between p-16 xl:p-20 overflow-hidden min-h-screen"
        style={{ backgroundImage: "url('/auth_bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080618]/85 via-[#160a35]/80 to-[#060e20]/90 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent z-0" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/30 blur-[100px] z-0 animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/20 blur-[110px] z-0 animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-2/3 left-1/2 w-56 h-56 rounded-full bg-fuchsia-500/20 blur-[80px] z-0 animate-pulse" style={{ animationDuration: '9s' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-700/10 overflow-hidden flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight leading-none">
                DNYAN<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-300">NITI</span>
              </div>
              <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-0.5">Training & Research Pvt. Ltd.</div>
            </div>
          </div>
        </div>

        {/* Main hero copy */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/30 bg-violet-500/10 backdrop-blur-sm">
            <Sparkles size={13} className="text-violet-300" />
            <span className="text-xs text-violet-300 font-black uppercase tracking-wider">Maharashtra's #1 Exam Portal</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.0] tracking-tight">
              Unlock<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300">
                Your Full
              </span><br />
              Potential.
            </h1>
            <p className="text-white/55 text-sm font-medium leading-relaxed max-w-sm">
              Join thousands of students acing Maharashtra scholarship exams with expert-curated content and personalized guidance.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, val: "5,000+", label: "Students Enrolled" },
              { icon: Trophy, val: "95%", label: "Pass Rate" },
              { icon: Star, val: "4.9 ★", label: "Avg. Rating" },
            ].map((s, i) => (
              <div key={i} className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:bg-white/12 hover:border-white/20 transition-all duration-300 group">
                <s.icon size={18} className="text-cyan-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xl font-black text-white leading-none mb-1">{s.val}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/6 backdrop-blur-md border border-white/10">
            <span className="text-5xl text-violet-400/70 font-black leading-none mt-[-8px] flex-shrink-0">"</span>
            <div>
              <p className="text-white/65 text-xs font-semibold leading-relaxed">
                Excellence in education is the passport to the future — for every future you want to have.
              </p>
              <p className="text-white/30 text-[10px] font-black mt-2 uppercase tracking-widest">— Dnyanniti Team</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Login Form  (50%)
         ════════════════════════════════════════ */}
      <div className="flex items-center justify-center bg-[#f8f9ff] relative overflow-hidden p-8">
        {/* Soft blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-violet-100/60 blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-cyan-100/50 blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="w-full max-w-[460px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-3.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-slate-800">DNYAN<span className="text-violet-600">NITI</span></span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-600 mb-3">Welcome Back</p>
            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Sign in to your<br />account
            </h2>
            <p className="text-slate-550 text-xs font-semibold mt-2.5">
              Don't have an account?{" "}
              <Link to={registerLink} className="text-violet-600 font-black hover:text-violet-850 transition-colors">Create one free →</Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2.5">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
                <input
                  type="email" name="email" value={email} onChange={onChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-slate-900 border-2 border-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all duration-200 font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Password</label>
                <a href="#" className="text-xs font-bold text-violet-600 hover:text-violet-850 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"} name="password" value={password} onChange={onChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-white text-slate-900 border-2 border-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all duration-200 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-1">
              <button
                type="submit" disabled={isLoading}
                className="relative w-full py-3 rounded-xl font-black text-white text-base overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-violet-300/30"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? "Signing In…" : <><span>Sign In</span><ArrowRight size={18} /></>}
                </span>
              </button>
            </div>
          </form>

          {/* Admin link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link to="/admin-login" className="text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors">
              Admin Portal Access →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
