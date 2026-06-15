import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Target, Play, ShieldAlert, CheckCircle2, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exams/${id}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedExam = data.data || data;

          // Check standard validation for students (admins bypass standard checks)
          if (user && user.role !== 'admin' && fetchedExam.std) {
            const uStd = user.std ? user.std.toString().trim().toLowerCase() : '';
            const eStd = fetchedExam.std.toString().trim().toLowerCase();
            const uNum = uStd.match(/\d+/);
            const eNum = eStd.match(/\d+/);
            
            let isMatch = false;
            if (uNum && eNum) {
              isMatch = uNum[0] === eNum[0];
            } else {
              isMatch = uStd === eStd || eStd.includes(uStd) || uStd.includes(eStd);
            }
            
            if (!isMatch) {
              toast.error("You are not authorized to view exams for this standard.");
              navigate('/exams');
              return;
            }
          }
          setExam(fetchedExam);
        } else {
          toast.error('Failed to load exam details');
          navigate('/exams');
        }
      } catch (error) {
        toast.error('Something went wrong');
        navigate('/exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  const handleStartExam = () => {
    if (!user) {
      toast.error("Please log in to start the exam");
      navigate(`/login?redirect=${encodeURIComponent(`/take-exam/${id}`)}`);
      return;
    }
    navigate(`/take-exam/${id}`);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader className="animate-spin text-slate-900 w-12 h-12" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto relative z-10 pt-10">
        
        <button 
          onClick={() => navigate('/exams')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-10 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Exams
        </button>

        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 md:p-14 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[60px] pointer-events-none opacity-60"></div>

          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 border border-white text-xs font-black mb-8 tracking-[0.2em] uppercase text-indigo-600 shadow-sm">
            <BookOpen size={16} />
            <span>Exam Overview</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            {exam.title}
          </h1>

          {/* Key Metrics */}
          <div className="flex flex-wrap gap-6 mb-12 border-y border-slate-200 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Duration</p>
                <p className="text-xl font-bold text-slate-900">{exam.duration} Minutes</p>
              </div>
            </div>
            
            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600 border border-cyan-200">
                <Target size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Marks</p>
                <p className="text-xl font-bold text-slate-900">{exam.totalMarks || (exam.questions ? exam.questions.length : 0)} Points</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-12">
            <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={20} className="text-sky-500" />
              Important Instructions
            </h3>
            <div className="space-y-4">
              {[
                "Ensure you have a stable internet connection before starting.",
                "Do not switch tabs or minimize the browser during the exam.",
                "The timer will not stop even if you get disconnected.",
                "Submit your answers before the timer runs out.",
                "Plagiarism or cheating will lead to immediate disqualification."
              ].map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white/50 p-4 rounded-2xl border border-white/80 shadow-sm">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium leading-relaxed">{instruction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Ready to begin?</h4>
              <p className="text-slate-550 font-medium text-xs">Once started, the timer cannot be paused.</p>
            </div>
            <button 
              onClick={handleStartExam}
              className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:bg-indigo-700 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 group"
            >
              START EXAM NOW
              <Play size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
