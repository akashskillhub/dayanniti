import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Calendar, ChevronLeft, FileSpreadsheet, Percent, TrendingUp } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();

  // Glass panel styling matching Dashboard
  const glassPanel = "bg-white/70 backdrop-blur-2xl border border-slate-100/80 shadow-xl shadow-slate-100/50 rounded-3xl";

  const dummyResults = [
    { id: 1, examName: "Scholarship Entrance Test - GK", date: "2026-05-15", score: "88/100", percentage: "88%", rank: "12th", status: "Passed" },
    { id: 2, examName: "General Mental Ability Practice Exam", date: "2026-05-10", score: "42/50", percentage: "84%", rank: "8th", status: "Passed" }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 relative overflow-hidden">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose-200/25 to-amber-200/20 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md text-slate-600 hover:text-indigo-600 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">My Exam Results</h1>
              <p className="text-slate-500 font-medium mt-1">Track your performance history and grades</p>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Exams Completed', value: '2', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { label: 'Average Score', value: '86%', icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
            { label: 'Global Rank Index', value: 'Top 10%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
          ].map((stat, i) => (
            <div key={i} className={`p-8 ${glassPanel} flex items-center gap-6 hover:shadow-2xl transition-all duration-300`}>
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border} flex items-center justify-center shadow-sm`}>
                <stat.icon size={26} />
              </div>
              <div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-1">{stat.label}</span>
                <span className="text-3xl font-extrabold text-slate-800">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Results List Card */}
        <div className={`p-8 ${glassPanel}`}>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <FileSpreadsheet size={22} className="text-indigo-500" /> Recent Performance History
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-5">Exam Details</th>
                  <th className="px-6 py-5">Date Taken</th>
                  <th className="px-6 py-5">Obtained Score</th>
                  <th className="px-6 py-5">Percentage</th>
                  <th className="px-6 py-5">Rank achieved</th>
                  <th className="px-6 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/40">
                {dummyResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-extrabold text-slate-800 block">{res.examName}</span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(res.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">{res.score}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold">{res.percentage}</span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">{res.rank}</td>
                    <td className="px-6 py-5 text-right">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold">{res.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Results;
