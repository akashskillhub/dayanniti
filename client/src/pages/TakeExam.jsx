import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Loader2, X, Download, ShieldCheck, IndianRupee, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exams/${id}`);
        if (res.ok) {
          const data = await res.json();
          const examData = data.data || data;
          setExam(examData);
          setTimeLeft(examData.duration * 60); // Convert mins to seconds
        } else {
          toast.error("Failed to load exam. It might have been removed.");
          navigate('/exams');
        }
      } catch (error) {
        toast.error("Error loading exam.");
        navigate('/exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted]);

  const handleAutoSubmit = () => {
    toast.error("Time is up! Auto-submitting your exam.", { duration: 4000 });
    handleSubmit();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmit = () => {
    setShowSubmitModal(false);
    setIsSubmitted(true);
    let calculatedScore = 0;
    exam.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Exam submitted successfully!");
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    try {
      toast.loading("Generating High Quality PDF...", { id: "pdf" });
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'px', 
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${exam.title.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      toast.success("Certificate Downloaded Successfully!", { id: "pdf" });
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Error generating PDF: " + error.message, { id: "pdf" });
    }
  };

  const handleDownloadClick = () => {
    if (hasPaid) {
      toast.success("You have already paid! Downloading certificate...");
      handleDownloadCertificate();
    } else {
      setShowPaymentModal(true);
    }
  };

  const processPayment = () => {
    setIsProcessingPayment(true);
    // Simulate Razorpay
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      setHasPaid(true);
      toast.success("Payment of ₹199 Successful!");
      handleDownloadCertificate();
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  if (!exam) return null;

  // --- Result View ---
  if (isSubmitted) {
    const correctCount = score;
    const totalQuestions = exam.questions.length;
    const marksObtained = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * exam.totalMarks) : 0;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 40; // 40% passing criteria

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 font-sans flex flex-col items-center relative overflow-y-auto pb-32">
        {/* Confetti or simple glow based on pass/fail */}
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply opacity-50 ${passed ? 'bg-emerald-200' : 'bg-rose-200'} pointer-events-none`}></div>
        <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply opacity-50 ${passed ? 'bg-cyan-200' : 'bg-orange-200'} pointer-events-none`}></div>

        <div className="max-w-2xl w-full relative z-10 bg-white/80 backdrop-blur-xl border border-white/80 rounded-[3rem] p-10 md:p-16 shadow-2xl text-center">
          <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-8 shadow-xl ${passed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
            {passed ? <CheckCircle2 size={48} className="text-white" /> : <AlertTriangle size={48} className="text-white" />}
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </h1>
          <p className="text-slate-500 font-medium mb-10">You have completed {exam.title}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Marks Obtained</p>
              <p className="text-4xl font-black text-indigo-600">{marksObtained} <span className="text-xl text-slate-400 font-bold">/ {exam.totalMarks}</span></p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Questions Solved</p>
              <p className={`text-4xl font-black ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>{correctCount} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/exams')} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
              <ArrowRight size={16} /> Back to Dashboard 
            </button>
            {passed && (
              <button onClick={handleDownloadClick} className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                <Download size={16} /> {hasPaid ? 'Download Certificate' : 'Get Certificate (₹199)'}
              </button>
            )}
          </div>
        </div>

        {/* Off-screen Certificate DOM for html2canvas */}
        <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
          <div 
            ref={certificateRef}
            className="w-[800px] h-[560px] relative p-10 border-[16px] border-double flex flex-col justify-between items-center text-center box-border"
            style={{ backgroundColor: '#ffffff', borderColor: '#fde68a' }}
          >
            {/* Header section */}
            <div className="flex flex-col items-center mt-2">
              <h1 className="text-4xl font-black tracking-widest uppercase mb-1 font-serif animate-none" style={{ color: '#1e293b' }}>
                Certificate
              </h1>
              <h2 className="text-xl font-medium tracking-widest uppercase animate-none" style={{ color: '#d97706' }}>
                of Achievement
              </h2>
            </div>
            
            {/* Body/Recipient section */}
            <div className="flex flex-col items-center my-auto">
              <p className="italic text-sm mb-2" style={{ color: '#64748b' }}>
                This is proudly presented to
              </p>
              <h3 className="text-3xl font-bold border-b-2 pb-2 mb-4 px-12 max-w-[600px] truncate" style={{ color: '#312e81', borderColor: '#e0e7ff' }}>
                {user?.name || user?.firstName || 'Esteemed Scholar'}
              </h3>
              <p className="max-w-[500px] mx-auto text-sm leading-relaxed" style={{ color: '#475569' }}>
                For successfully completing the exam <span className="font-bold" style={{ color: '#1e293b' }}>{exam.title}</span> with outstanding performance, obtaining <span className="font-bold text-indigo-600">{marksObtained} marks</span>.
              </p>
            </div>
            
            {/* Footer section (Date, Seal, Signature) */}
            <div className="w-full flex justify-between items-end px-12 mb-2 relative">
              {/* Date */}
              <div className="flex flex-col items-center w-40">
                <p className="font-bold text-sm mb-1" style={{ color: '#1e293b' }}>{new Date().toLocaleDateString()}</p>
                <div className="w-full border-t" style={{ borderColor: '#cbd5e1' }}></div>
                <p className="text-[10px] mt-1 uppercase tracking-wider font-semibold" style={{ color: '#94a3b8' }}>Date</p>
              </div>
              
              {/* Golden Seal */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-md absolute bottom-0 left-1/2 transform -translate-x-1/2"
                style={{ backgroundColor: '#f59e0b', borderColor: '#ffffff' }}
              >
                <ShieldCheck size={36} color="#ffffff" />
              </div>

              {/* Signature */}
              <div className="flex flex-col items-center w-40">
                <div className="h-8 flex items-center justify-center italic text-lg font-serif opacity-70 mb-1" style={{ color: '#1e293b' }}>
                  Admin Signature
                </div>
                <div className="w-full border-t" style={{ borderColor: '#cbd5e1' }}></div>
                <p className="text-[10px] mt-1 uppercase tracking-wider font-semibold" style={{ color: '#94a3b8' }}>Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Answers Section */}
        <div className="max-w-3xl w-full relative z-10 mt-16 space-y-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen className="text-indigo-500" /> Review Your Answers
          </h2>
          {exam.questions.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={qIndex} className={`bg-white border-2 rounded-[2rem] p-8 shadow-sm relative ${isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
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
                    <img src={q.questionImage} alt="Question Attachment" className="w-full max-h-64 object-contain bg-slate-50" />
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
                    <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Explanation</h4>
                    {q.explanation && <p className="text-slate-700 font-medium text-sm mb-4 leading-relaxed">{q.explanation}</p>}
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

        {/* Secure Checkout Modal (Generic) */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-center relative">
                <button onClick={() => !isProcessingPayment && setShowPaymentModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors disabled:opacity-50" disabled={isProcessingPayment}>
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/30">
                  <Lock size={28} className="text-white" />
                </div>
                <h3 className="text-white font-black text-2xl mb-1 tracking-tight">Secure Checkout</h3>
                <p className="text-blue-100 text-sm font-medium">Certificate Processing Fee</p>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                  <div className="text-slate-500 font-medium">{exam.title} Certificate</div>
                  <div className="text-2xl font-black text-slate-900 flex items-center">
                    <IndianRupee size={22} className="mr-1" /> 199.00
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-medium">
                    <CreditCard size={20} className="text-indigo-500" /> Pay via Credit/Debit Card
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-medium">
                    <div className="w-5 h-5 rounded bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold tracking-tighter">UPI</div> Pay via UPI
                  </div>
                </div>

                <button 
                  onClick={processPayment} 
                  disabled={isProcessingPayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? <><Loader2 size={20} className="animate-spin" /> Processing Payment...</> : <><Lock size={18} /> Pay ₹199 Now</>}
                </button>
                <div className="mt-5 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                  <ShieldCheck size={14} /> 100% Secure & Encrypted Transaction
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Exam Taking View ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative pb-32">
      {/* Sticky Header with Timer */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <BookOpen size={20} />
          </div>
          <h2 className="font-bold text-slate-900 hidden md:block">{exam.title}</h2>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-base border shadow-inner ${
          timeLeft < 300 
            ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}>
          <Clock size={18} className={timeLeft < 300 ? 'text-rose-500' : 'text-slate-400'} />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 md:p-10 relative z-10 pt-12">
        {exam.questions.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">This exam has no questions. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {exam.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative group hover:border-indigo-200 transition-colors">
                <div className="absolute top-8 left-0 w-1.5 h-12 bg-indigo-500 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex gap-3 items-start mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm">{qIndex + 1}</span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug pt-1">{q.questionText}</h3>
                </div>

                {q.questionImage && (
                  <div className="mb-8 ml-12 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={q.questionImage} alt="Question Attachment" className="w-full max-h-96 object-contain bg-slate-50" />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 ml-12">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = answers[qIndex] === opt;
                    return (
                      <label 
                        key={oIndex} 
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm' 
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
                          name={`question-${qIndex}`} 
                          value={opt} 
                          checked={isSelected}
                          onChange={() => handleOptionSelect(qIndex, opt)}
                          className="hidden"
                        />
                        <span className="font-semibold text-[14px]">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submission Section */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-bold mb-1">Finished early?</p>
                <p className="text-xs text-slate-400">Make sure to review all answers before submitting.</p>
              </div>
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2.5"
              >
                SUBMIT EXAM
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Submit Exam?</h2>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to submit your answers? You cannot change them after submission.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors">
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

export default TakeExam;
