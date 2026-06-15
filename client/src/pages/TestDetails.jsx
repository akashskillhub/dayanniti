import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, ArrowLeft, User, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const TestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [test, setTest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whyChoose: '',
    age: '',
    medicalHistory: '',
    educationLevel: 'High School',
    additionalInfo: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTest(data.data || data);
        } else {
          toast.error("Test module not found");
          navigate('/');
        }
      } catch (err) {
        toast.error("Error fetching test details");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  if (!test) return null;

  const isMedical = test.title.toLowerCase().includes("medical");
  const isIQ = test.title.toLowerCase().includes("iq");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit your inquiry.");
      navigate(`/login?redirect=${encodeURIComponent(`/tests/${id}`)}`);
      return;
    }

    if (!formData.name || !formData.email || !formData.whyChoose) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if ((isMedical || isIQ) && !formData.age) {
      toast.error("Please enter your age.");
      return;
    }

    if (isMedical && !formData.medicalHistory) {
      toast.error("Please provide your medical history.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        testId: test._id,
        testTitle: test.title,
        name: formData.name,
        email: formData.email,
        whyChoose: formData.whyChoose,
      };

      if (isMedical) {
        payload.age = Number(formData.age);
        payload.medicalHistory = formData.medicalHistory;
      } else if (isIQ) {
        payload.age = Number(formData.age);
        payload.educationLevel = formData.educationLevel;
      } else {
        payload.additionalInfo = formData.additionalInfo;
      }

      const res = await fetch("/api/test-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Inquiry submitted successfully!");
        navigate("/");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to submit inquiry.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-6xl w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-8 md:p-12 relative overflow-hidden">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-400 hover:text-indigo-650 font-bold transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 mt-6">
          
          {/* Left Column: Info & Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {test.title}
                </h1>
                <div className="w-16 h-1.5 bg-indigo-600 rounded-full mt-4"></div>
              </div>

              {/* Dynamic Badges based on type */}
              <div className="flex flex-wrap gap-2">
                {isMedical && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-705 border border-rose-150">
                    Medical Intake
                  </span>
                )}
                {isIQ && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-705 border border-purple-150">
                    Cognitive Intake
                  </span>
                )}
                {!isMedical && !isIQ && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-705 border border-indigo-150">
                    General Inquiry
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-150">
                  Untimed Assessment
                </span>
              </div>

              {/* Details table block */}
              <div className="space-y-3 pt-2">
                {[
                  { label: "Product Code", value: test.testCode || `${test._id.slice(-6).toUpperCase()}-INQ` },
                  { label: "Author", value: test.author || "N/A" },
                  { label: "Age Range", value: test.ageRange || "N/A" },
                  { label: "Language", value: test.language || "N/A" },
                  { label: "Category", value: test.category || "N/A" },
                ].map((row, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center text-xs font-semibold py-1.5 border-b border-slate-100">
                    <span className="w-32 text-slate-400 uppercase tracking-widest text-[9px] font-black shrink-0">
                      {row.label}:
                    </span>
                    <span className="text-slate-800 text-[13px] mt-0.5 sm:mt-0 font-extrabold">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {test.description && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450">About this Test</h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                    {test.description}
                  </p>
                </div>
              )}
            </div>

            {/* Sub-illustration/Note */}
            <div className="hidden lg:block bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 text-center">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">NYAYNITI PORTAL</span>
              <p className="text-slate-700 font-black text-xs mt-0.5">Application & Enquiry intake dashboard</p>
            </div>
          </div>

          {/* Right Column: Inquiry Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 border border-slate-200/80 rounded-[2rem] p-6 md:p-8 shadow-inner">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900">Test Inquiry Application</h2>
                <p className="text-slate-450 text-xs font-semibold mt-1">Please provide your details and purpose for requesting this assessment.</p>
              </div>

              {/* User Session Warning */}
              {!user ? (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs font-black text-amber-805 uppercase tracking-wide">Authentication Required</h4>
                    <p className="text-amber-700 text-xs mt-0.5 font-medium">You must sign in to submit your inquiry profile.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/tests/${id}`)}`)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-md shrink-0 active:scale-95"
                  >
                    Log In / Register
                  </button>
                </div>
              ) : (
                <div className="mb-6 bg-emerald-50 border border-emerald-150 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <span className="text-[11px] text-emerald-800 font-extrabold">
                    Signed in as: <span className="underline">{user.name} ({user.email})</span>
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                    <User size={10} /> Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Enter your full name" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                    <Mail size={10} /> Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="name@example.com" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm"
                  />
                </div>



                {/* Dynamic: Medical fields */}
                {isMedical && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                        Age <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        max="120"
                        value={formData.age} 
                        onChange={e => setFormData({ ...formData, age: e.target.value })} 
                        placeholder="Age" 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="md:col-span-8 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                        Medical History / Conditions <span className="text-rose-500">*</span>
                      </label>
                      <textarea 
                        required 
                        rows="2"
                        value={formData.medicalHistory} 
                        onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })} 
                        placeholder="Mention existing health parameters or conditions" 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic: IQ fields */}
                {isIQ && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                        Age <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        max="120"
                        value={formData.age} 
                        onChange={e => setFormData({ ...formData, age: e.target.value })} 
                        placeholder="Age" 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="md:col-span-8 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                        Highest Education Level <span className="text-rose-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.educationLevel} 
                        onChange={e => setFormData({ ...formData, educationLevel: e.target.value })} 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all shadow-sm focus:border-indigo-500 text-sm cursor-pointer appearance-none"
                      >
                        <option value="High School">High School</option>
                        <option value="Associate Degree">Associate Degree</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate / PhD">Doctorate / PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Why Choose This Test */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                    Why choose this test? <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    required 
                    rows="3"
                    value={formData.whyChoose} 
                    onChange={e => setFormData({ ...formData, whyChoose: e.target.value })} 
                    placeholder="Describe your goals or primary rationale for taking this test assessment" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm resize-none"
                  />
                </div>

                {/* Dynamic: General additional info */}
                {!isMedical && !isIQ && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                      Additional Details / Purpose <span className="text-slate-400 font-medium">(Optional)</span>
                    </label>
                    <textarea 
                      rows="2"
                      value={formData.additionalInfo} 
                      onChange={e => setFormData({ ...formData, additionalInfo: e.target.value })} 
                      placeholder="Add any extra comments or relevant background details" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all shadow-sm focus:border-indigo-500 text-sm resize-none"
                    />
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !user} 
                    className="w-full py-4 px-6 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                    style={{ 
                      backgroundColor: user ? '#4f46e5' : '#94a3b8',
                      cursor: user ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="animate-spin" size={16} /> Submitting application...</>
                    ) : (
                      <><Send size={16} /> Submit Test Inquiry</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TestDetails;
