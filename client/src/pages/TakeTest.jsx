import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [test, setTest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTest(data.data || data);
        } else {
          toast.error("Failed to load test. It might have been removed.");
          navigate('/');
        }
      } catch (error) {
        toast.error("Error loading test.");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  const handleOptionSelect = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmit = () => {
    setShowSubmitModal(false);
    setIsSubmitted(true);
    let calculatedScore = 0;
    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Test submitted successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  if (!test) return null;

  // --- Result View ---
  if (isSubmitted) {
    const correctCount = score;
    const totalQuestions = test.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= 40;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 font-sans flex flex-col items-center relative overflow-y-auto pb-32">
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply opacity-40 ${passed ? 'bg-emerald-100' : 'bg-rose-100'} pointer-events-none`}></div>
        <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply opacity-40 ${passed ? 'bg-cyan-100' : 'bg-orange-100'} pointer-events-none`}></div>

        <div className="max-w-2xl w-full relative z-10 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 md:p-16 shadow-2xl text-center">
          <div className={`w-24 h-24 mx-auto rounded-[2.2rem] flex items-center justify-center mb-8 shadow-xl ${passed ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
            {passed ? <CheckCircle2 size={48} className="text-white" /> : <AlertTriangle size={48} className="text-white" />}
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {passed ? 'Assessment Completed!' : 'Keep Practicing'}
          </h1>
          <p className="text-slate-500 font-bold mb-10">You have completed {test.title}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-405 mb-2">Score Percentage</p>
              <p className="text-4xl font-black text-indigo-650">{percentage}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-405 mb-2">Questions Solved</p>
              <p className={`text-4xl font-black ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>{correctCount} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span></p>
            </div>
          </div>

          <div className="flex justify-center">
            <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2">
              Back to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Review Answers Section */}
        <div className="max-w-3xl w-full relative z-10 mt-16 space-y-8">
          <h2 className="text-2xl font-black text-slate-905 mb-6 flex items-center gap-2">
            <BookOpen className="text-indigo-500" /> Review Assessment Answers
          </h2>
          {test.questions.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={qIndex} className={`bg-white border rounded-[2rem] p-8 shadow-sm relative ${isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
                <div className="flex gap-4 items-start mb-6">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {qIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug pt-1">{q.questionText}</h3>
                  </div>
                </div>

                {q.questionImage && (
                  <div className="mb-6 ml-12 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={q.questionImage} alt="Question Attachment" className="w-full max-h-64 object-contain bg-slate-55" />
                  </div>
                )}

                <div className="ml-12 grid grid-cols-1 gap-2 mb-6">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = userAnswer === opt;
                    const isActualCorrect = q.correctAnswer === opt;
                    let optionClass = "border-slate-100 bg-slate-50 text-slate-600";
                    
                    if (isActualCorrect) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                    } else if (isSelected && !isActualCorrect) {
                      optionClass = "border-rose-500 bg-rose-50 text-rose-900";
                    }

                    return (
                      <div key={oIndex} className={`p-4 rounded-xl border-2 ${optionClass} flex items-center justify-between`}>
                        <span className="font-semibold text-sm">{opt}</span>
                        {isActualCorrect && <CheckCircle2 size={18} className="text-emerald-500" />}
                        {isSelected && !isActualCorrect && <AlertTriangle size={18} className="text-rose-500" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {(q.explanation || q.explanationImage) && (
                  <div className="ml-12 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-505 mb-3">Explanation</h4>
                    {q.explanation && <p className="text-slate-700 font-semibold text-sm mb-4 leading-relaxed">{q.explanation}</p>}
                    {q.explanationImage && (
                      <div className="rounded-xl overflow-hidden border border-indigo-200">
                        <img src={q.explanationImage} alt="Explanation Attachment" className="w-full max-h-64 object-contain bg-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Test Taking View ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-indigo-650">
            <BookOpen size={20} />
          </div>
          <h2 className="font-extrabold text-slate-900 text-lg truncate max-w-md">{test.title}</h2>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs border border-indigo-100 bg-indigo-50/50 text-indigo-700 shadow-inner">
          Untimed Assessment Mode
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 md:p-10 relative z-10 pt-12">
        {test.questions.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-bold">This assessment has no questions configured. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {test.questions.map((q, qIndex) => {
              const selectedOpt = answers[qIndex];
              return (
                <div key={qIndex} className="bg-white border border-slate-200 rounded-[2.2rem] p-8 shadow-sm relative group hover:border-indigo-200 transition-colors">
                  <div className="absolute top-8 left-0 w-1.5 h-12 bg-indigo-500 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex gap-3 items-start mb-6">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">{qIndex + 1}</span>
                    <h3 className="text-lg font-bold text-slate-905 leading-snug pt-1">{q.questionText}</h3>
                  </div>

                  {q.questionImage && (
                    <div className="mb-8 ml-12 rounded-2xl overflow-hidden border border-slate-200">
                      <img src={q.questionImage} alt="Question Graphic" className="w-full max-h-96 object-contain bg-slate-55" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 ml-12">
                    {q.options.map((opt, oIndex) => {
                      const isSelected = selectedOpt === opt;
                      return (
                        <label 
                          key={oIndex} 
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-55 bg-opacity-10 text-indigo-900 shadow-sm' 
                              : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                            isSelected ? 'border-indigo-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                          </div>
                          <input 
                            type="radio" 
                            name={`test-question-${qIndex}`} 
                            value={opt} 
                            checked={isSelected}
                            onChange={() => handleOptionSelect(qIndex, opt)}
                            className="hidden"
                          />
                          <span className="font-extrabold text-[14px]">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submission Section */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-bold mb-1">Done with all queries?</p>
                <p className="text-xs text-slate-400 font-semibold">Verify choices before submitting.</p>
              </div>
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="bg-indigo-650 hover:bg-indigo-755 text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 active:scale-95 transition-all flex items-center gap-2.5"
              >
                Submit Answers
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Submit Assessment?</h2>
            <p className="text-slate-550 font-semibold mb-8">
              Confirm submission of your answers. You cannot change your choices once processed.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold py-3.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                Yes, Submit <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;
