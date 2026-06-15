import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BookOpen, Clock, Target, ArrowRight, Loader, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ExamsList = () => {
  const { user } = useSelector((state) => state.user);
  const [examsData, setExamsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentStd, setStudentStd] = useState(user?.std || '');
  const [examResults, setExamResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.std) {
      setStudentStd(user.std);
    }
  }, [user?.std]);

  useEffect(() => {
    const fetchExamsAndProfile = async () => {
      try {
        const res = await fetch('/api/exams');
        if (res.ok) {
          const data = await res.json();
          setExamsData(data.data || data); // Adjust based on actual API response
        } else {
          toast.error('Failed to fetch exams');
        }

        // Fetch student profile details (standard and results) if logged in
        if (user && user.role !== 'admin') {
          const profileRes = await fetch('/api/users/profile', {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.std) {
              setStudentStd(profileData.std);
            }
            if (profileData.examResults) {
              setExamResults(profileData.examResults);
            }
          }
        }
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExamsAndProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader className="animate-spin text-slate-900 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 pt-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/60 border border-white/80 text-xs font-black mb-8 tracking-[0.2em] uppercase text-indigo-600 shadow-sm backdrop-blur-md">
            <BookOpen size={16} />
            <span>Available Assessments</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter text-slate-900">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Challenge</span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Select an exam below to view its details and begin your assessment.
          </p>
        </div>

        {(() => {
          const activeStd = studentStd || user?.std;
          const filteredExams = examsData.filter(exam => {
            if (user?.role === 'admin') return true; // Admins can see all exams
            if (!activeStd) return false; // Hide if standard is not defined for student
            if (!exam.std) return false; // Hide legacy/unlabeled exams for students
            
            const eStd = exam.std.toString().trim().toLowerCase();
            const uStd = activeStd.toString().trim().toLowerCase();
            
            // Robust numeric matching (e.g., "10" vs "10th")
            const eNum = eStd.match(/\d+/);
            const uNum = uStd.match(/\d+/);
            if (eNum && uNum) {
              return eNum[0] === uNum[0];
            }
            
            return eStd === uStd || eStd.includes(uStd) || uStd.includes(eStd);
          });

          if (filteredExams.length === 0) {
            return (
              <div className="text-center p-12 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No exams available</h3>
                <p className="text-slate-600">There are no exams published for your standard ({activeStd || 'N/A'}) at the moment.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExams.map((exam) => {
                const result = examResults.find(r => (r.examId?._id || r.examId)?.toString() === exam._id.toString());
                const isCleared = result?.passed;

                return (
                  <div 
                    key={exam._id} 
                    onClick={() => navigate(`/exams/${exam._id}`)}
                    className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] hover:bg-white/90 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col h-full shadow-md"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-200 transition-colors opacity-50"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight flex-1 pr-3">{exam.title}</h3>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        {exam.std && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {exam.std} Class
                          </span>
                        )}
                        {isCleared && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 font-bold">
                            ✓ Cleared
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8 flex-grow">
                      <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
                        <Clock size={16} className="text-indigo-500" />
                        <span>Duration: {exam.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
                        <Target size={16} className="text-fuchsia-500" />
                        <span>Total Marks: {exam.totalMarks || (exam.questions ? exam.questions.length : 0)}</span>
                      </div>
                    </div>

                    {isCleared ? (
                      <button className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-200 shadow-sm transition-colors hover:bg-emerald-100/50">
                        Exam Cleared <CheckCircle2 size={18} className="text-emerald-500" />
                      </button>
                    ) : (
                      <button className="w-full py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm group-hover:border-indigo-200">
                        View Details <ArrowRight size={18} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ExamsList;
