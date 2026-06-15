import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginAdmin, resetAdmin } from "../redux/adminSlice";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, Lock, ArrowRight, AlertTriangle, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin, isLoading, isError, isSuccess, message } = useSelector((state) => state.admin);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || admin) { toast.success("Admin Logged In!"); navigate("/admin-dashboard"); }
    dispatch(resetAdmin());
  }, [admin, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    dispatch(loginAdmin({ email, password }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundImage: "url('/auth_bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050210]/92 via-[#0d0829]/88 to-[#020b18]/92 z-0" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-red-600/20 blur-[100px] z-0 animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-orange-500/15 blur-[100px] z-0 animate-pulse" style={{ animationDuration: '7s' }} />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          {/* Red top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-[20px] bg-white overflow-hidden flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/30 border border-slate-200">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Admin Portal</h2>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <AlertTriangle size={12} className="text-orange-400" />
                <p className="text-orange-400/80 text-xs font-bold uppercase tracking-widest">Restricted Access Only</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Admin Email</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-400 transition-colors pointer-events-none" />
                  <input
                    type="email" name="email" value={email} onChange={onChange}
                    placeholder="admin@dnyanniti.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/8 border-2 border-white/10 text-white placeholder-white/25 font-semibold text-sm focus:outline-none focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-400 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={password} onChange={onChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/8 border-2 border-white/10 text-white placeholder-white/25 font-semibold text-sm focus:outline-none focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit" disabled={isLoading}
                  className="relative w-full py-3 rounded-xl font-black text-white text-sm overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 shadow-xl shadow-red-500/20"
                  style={{ background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? "Authenticating…" : <><ShieldCheck size={16} /><span>Access Admin Dashboard</span><ArrowRight size={16} /></>}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-xs text-white/30 hover:text-white/60 font-bold transition-colors">
                ← Back to Student Login
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-white/20 text-[11px] font-medium mt-6 uppercase tracking-widest">
          Dnyanniti Training & Research Pvt. Ltd.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
