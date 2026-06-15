import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { register, reset } from "../redux/userSlice";
import toast from "react-hot-toast";
import {
  GraduationCap, User, Mail, Lock, Calendar, Phone,
  MapPin, Building, Home, UserCheck, ArrowRight,
  BookOpen, CheckCircle2, Sparkles, Eye, EyeOff
} from "lucide-react";

/* ─── Reusable Input ─── */
const Field = ({ label, name, type = "text", value, onChange, placeholder, required, icon: Icon, accentColor = "violet" }) => {
  const [showPassword, setShowPassword] = useState(false);
  const focusRing = accentColor === "cyan" ? "focus:border-cyan-500 focus:ring-cyan-500/10"
    : accentColor === "rose" ? "focus:border-rose-500 focus:ring-rose-500/10"
    : accentColor === "emerald" ? "focus:border-emerald-500 focus:ring-emerald-500/10"
    : "focus:border-violet-500 focus:ring-violet-500/10";
  const iconColor = accentColor === "cyan" ? "group-focus-within:text-cyan-500"
    : accentColor === "rose" ? "group-focus-within:text-rose-500"
    : accentColor === "emerald" ? "group-focus-within:text-emerald-500"
    : "group-focus-within:text-violet-500";
  
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative group">
        {Icon && <Icon size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200 ${iconColor}`} />}
        <input
          type={inputType} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "px-4"} ${type === "password" ? "pr-10" : "pr-4"} py-3.5 rounded-xl bg-white text-slate-900 border-2 border-slate-200 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-4 shadow-sm transition-all duration-200 ${focusRing}`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Section Card ─── */
const Section = ({ title, subtitle, icon: Icon, gradient, borderColor, children }) => (
  <div className={`bg-white rounded-3xl border-2 ${borderColor} shadow-sm overflow-hidden`}>
    <div className={`${gradient} px-6 py-4 flex items-center gap-3`}>
      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon size={15} className="text-white" />
      </div>
      <div>
        <p className="text-white font-black text-sm">{title}</p>
        {subtitle && <p className="text-white/60 text-xs font-medium">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", age: "", mobile: "",
    schoolName: "", std: "", district: "", taluka: "", village: "",
    teacherName: "", teacherContact: ""
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.user);

  // Parse redirect query param
  const searchParams = new URLSearchParams(location.search);
  const redirectQuery = searchParams.get("redirect");
  const loginLink = redirectQuery ? `/login?redirect=${encodeURIComponent(redirectQuery)}` : "/login";

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess) { 
      toast.success("Account created! Please log in."); 
      navigate(loginLink); 
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch, loginLink]);

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      toast.error("Please fill in all required fields");
      return;
    }
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── LEFT – Sticky Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-shrink-0 relative flex-col justify-between p-14 xl:p-20 overflow-hidden sticky top-0 h-screen"
        style={{ backgroundImage: "url('/auth_bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b2a]/80 via-[#1a0a3e]/75 to-black/85 z-0" />
        <div className="absolute top-1/4 left-0 w-64 h-64 rounded-full bg-violet-600/30 blur-[80px] z-0 animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-cyan-500/20 blur-[90px] z-0 animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-fuchsia-500/20 blur-[70px] z-0 animate-pulse" style={{ animationDuration: '9s' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-white border border-slate-700/10 overflow-hidden flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight">DNYAN<span className="text-violet-300">NITI</span></div>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Training & Research</p>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 backdrop-blur-sm">
            <Sparkles size={12} className="text-violet-300" />
            <span className="text-xs text-violet-300 font-black uppercase tracking-wider">Join Free Today</span>
          </div>
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight">
              Begin Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300">
                Success Story.
              </span>
            </h1>
            <p className="text-white/55 text-sm leading-relaxed mt-5 max-w-sm">
              Register now and access Maharashtra's best scholarship exam preparation platform — completely free.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Full access to mock exam library",
              "Previous year scholarship papers",
              "Performance analytics & rankings",
              "Guidance from expert mentors",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={11} className="text-white" />
                </div>
                <span className="text-white/60 text-sm font-semibold">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
            <BookOpen size={16} className="text-cyan-300 flex-shrink-0" />
            <p className="text-white/60 text-xs font-semibold">Trusted by <span className="text-white font-black">5,000+</span> students across Maharashtra</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT – Registration Form ── */}
      <div className="flex-1 overflow-y-auto bg-[#f6f7fb] relative">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-100/60 blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-cyan-100/50 blur-3xl -z-10 translate-y-1/3" />

        <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden">
            <div className="inline-flex items-center gap-2.5 bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-slate-800">DNYAN<span className="text-violet-600">NITI</span></span>
            </div>
          </div>

          {/* Page Title */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600 mb-1.5">New Account</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 text-sm font-medium mt-3">
              Already registered?{" "}
              <Link
                to={loginLink}
                className="inline-flex items-center gap-1.5 text-violet-600 font-black hover:text-violet-800 transition-colors underline underline-offset-2 decoration-violet-300"
              >
                Sign in to your account →
              </Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Student Details */}
            <Section
              title="Student Details"
              subtitle="Your personal information"
              icon={User}
              gradient="bg-gradient-to-r from-violet-600 to-violet-500"
              borderColor="border-violet-100"
            >
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Full Name" name="name" value={formData.name} onChange={onChange} placeholder="John Doe" required icon={User} />
                <Field label="Age" name="age" type="number" value={formData.age} onChange={onChange} placeholder="15" icon={Calendar} />
                <Field label="Mobile Number" name="mobile" value={formData.mobile} onChange={onChange} placeholder="+91 9876543210" required icon={Phone} />
              </div>
              <Field label="Email Address" name="email" type="email" value={formData.email} onChange={onChange} placeholder="you@example.com" required icon={Mail} />
              <Field label="Password" name="password" type="password" value={formData.password} onChange={onChange} placeholder="Create a strong password" required icon={Lock} />
            </Section>

            {/* Academic */}
            <Section
              title="Academic Details"
              subtitle="Your school & class information"
              icon={GraduationCap}
              gradient="bg-gradient-to-r from-cyan-600 to-cyan-500"
              borderColor="border-cyan-100"
            >
              <Field label="School Name" name="schoolName" value={formData.schoolName} onChange={onChange} placeholder="Delhi Public School" icon={BookOpen} accentColor="cyan" />
              <Field label="Standard (Std.)" name="std" value={formData.std} onChange={onChange} placeholder="10th" icon={Building} accentColor="cyan" />
            </Section>

            {/* Address */}
            <Section
              title="Address Details"
              subtitle="Your home district & village"
              icon={MapPin}
              gradient="bg-gradient-to-r from-rose-500 to-rose-400"
              borderColor="border-rose-100"
            >
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="District" name="district" value={formData.district} onChange={onChange} placeholder="Pune" icon={MapPin} accentColor="rose" />
                <Field label="Taluka (Tq.)" name="taluka" value={formData.taluka} onChange={onChange} placeholder="Haveli" icon={Building} accentColor="rose" />
                <Field label="Village" name="village" value={formData.village} onChange={onChange} placeholder="Koregaon" icon={Home} accentColor="rose" />
              </div>
            </Section>

            {/* Teacher */}
            <Section
              title="Teacher Information"
              subtitle="Your guiding teacher's details"
              icon={UserCheck}
              gradient="bg-gradient-to-r from-emerald-600 to-emerald-500"
              borderColor="border-emerald-100"
            >
              <Field label="Teacher Name" name="teacherName" value={formData.teacherName} onChange={onChange} placeholder="Mr. Sharma" icon={User} accentColor="emerald" />
              <Field label="Teacher Contact No." name="teacherContact" value={formData.teacherContact} onChange={onChange} placeholder="+91 9123456780" icon={Phone} accentColor="emerald" />
            </Section>

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              className="relative w-full py-3 rounded-xl font-black text-white text-base overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-violet-200"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? "Creating Account…" : <><span>Create My Account</span><ArrowRight size={18} /></>}
              </span>
            </button>

            <p className="text-center text-xs text-slate-400 font-medium">By creating an account you agree to Dnyanniti's <a href="#" className="text-violet-600 font-bold">Terms of Service</a> &amp; <a href="#" className="text-violet-600 font-bold">Privacy Policy</a>.</p>

            {/* Prominent login redirect card */}
            <div className="mt-2 p-5 rounded-2xl bg-white border-2 border-violet-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="font-black text-slate-800 text-xs">Already have an account?</p>
                <p className="text-slate-550 text-[10px] font-medium mt-0.5">Sign in to access your dashboard and exams</p>
              </div>
              <Link
                to={loginLink}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-violet-500 text-violet-600 font-black text-sm hover:bg-violet-500 hover:text-white transition-all duration-200 group"
              >
                Sign In
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
