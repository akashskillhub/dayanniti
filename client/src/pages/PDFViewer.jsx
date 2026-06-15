import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSyllabusDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/syllabus');
        if (res.ok) {
          const data = await res.json();
          const found = data.find(item => item._id === id);
          if (found) {
            setSyllabus(found);
          } else {
            setError("Syllabus document not found.");
          }
        } else {
          setError("Failed to fetch syllabus data from the server.");
        }
      } catch (err) {
        setError("Error loading syllabus document details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSyllabusDetails();
  }, [id]);

  const handleDownload = async () => {
    if (!syllabus) return;

    try {
      const response = await fetch(syllabus.pdfUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', syllabus.pdfName || `${syllabus.subject}_Syllabus.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download started successfully!");
    } catch (err) {
      toast.error("Failed to download file. Please try again.");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Document View...
        </p>
      </div>
    );
  }

  if (error || !syllabus) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Access Error</h2>
        <p className="text-slate-400 max-w-md mb-8 font-medium text-sm leading-relaxed">{error || "Could not retrieve the requested PDF document."}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-18 min-h-18 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-800 shadow-sm flex items-center justify-center bg-white p-0.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex flex-col min-w-0 pl-1">
            <h1 className="font-extrabold text-sm md:text-base leading-tight text-white truncate flex items-center gap-1.5">
              {syllabus.subject}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/35 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                {syllabus.std}
              </span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 truncate font-semibold mt-0.5">{syllabus.pdfName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-300 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-650/15 text-xs md:text-sm"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </header>

      {/* PDF View Container */}
      <div className="flex-grow w-full relative bg-slate-900 overflow-hidden">
        {/* PDF Frame */}
        <iframe 
          src={`${syllabus.pdfUrl}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-0 z-0 relative"
          title={syllabus.subject}
        />

        {/* Security Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-24 p-8 md:p-16 opacity-[0.06]">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center transform -rotate-30 select-none m-auto pointer-events-none">
              <img src="/logo.png" alt="Watermark Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain opacity-80" />
              <span className="text-xs md:text-sm font-black tracking-widest text-white uppercase mt-2 whitespace-nowrap">NyayNiti Exam Portal</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
