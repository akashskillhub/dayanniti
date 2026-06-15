import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, FileText, Eye, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SyllabusManager = ({ admin, glassPanel, btnPrimary }) => {
  const navigate = useNavigate();
  const [syllabusList, setSyllabusList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStdFilter, setSelectedStdFilter] = useState('All');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [std, setStd] = useState('5th');
  const [subject, setSubject] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/syllabus');
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data);
      } else {
        toast.error("Failed to fetch study material data");
      }
    } catch (error) {
      toast.error("Error loading study material database");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF document only!");
        e.target.value = null;
        setPdfFile(null);
        return;
      }
      if (file.size > 1024 * 1024 * 1024) {
        toast.error("File size exceeds 1GB limit.");
        e.target.value = null;
        setPdfFile(null);
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      return toast.error("Please enter a subject name.");
    }
    if (!pdfFile) {
      return toast.error("Please select a study material PDF file to upload.");
    }

    setIsSubmitting(true);
    const uploadToastId = toast.loading("Uploading study material PDF...");

    try {
      // 1. Upload PDF
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const uploadRes = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload PDF file to the server.");
      }

      const uploadData = await uploadRes.json();
      const pdfUrl = uploadData.url;
      const pdfName = uploadData.name;

      toast.loading("Creating study material entry in database...", { id: uploadToastId });

      // 2. Create entry
      const syllabusRes = await fetch("/api/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          std,
          subject: subject.trim(),
          pdfUrl,
          pdfName,
          createdBy: admin._id,
        }),
      });

      if (syllabusRes.ok) {
        toast.success("Study material uploaded and created successfully!", { id: uploadToastId });
        setShowForm(false);
        setSubject('');
        setPdfFile(null);
        fetchSyllabus();
      } else {
        const errData = await syllabusRes.json();
        throw new Error(errData.message || "Failed to save study material data.");
      }
    } catch (error) {
      toast.error(error.message || "Error processing study material submission.", { id: uploadToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async (id) => {
    const deleteToastId = toast.loading("Deleting study material...");
    try {
      const res = await fetch(`/api/syllabus/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success("Study material deleted successfully!", { id: deleteToastId });
        fetchSyllabus();
      } else {
        toast.error("Failed to delete study material entry.", { id: deleteToastId });
      }
    } catch (error) {
      toast.error("Error connecting to server.", { id: deleteToastId });
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-slate-800 text-sm font-bold">
          Are you sure you want to delete this study material?
        </p>
        <p className="text-slate-400 text-[10px] leading-tight font-semibold -mt-1.5">
          The PDF file will be permanently removed from the server.
        </p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(id);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
    });
  };

  const filteredList = syllabusList.filter((item) => {
    const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.pdfName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStd = selectedStdFilter === 'All' || item.std.toLowerCase() === selectedStdFilter.toLowerCase();
    return matchesSearch && matchesStd;
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className={`${glassPanel} p-6 flex flex-col md:flex-row gap-4 items-center justify-between`}>
        <div className="text-left w-full md:w-auto">
          <h3 className="font-extrabold text-slate-900 text-lg">Class Study Material Repository</h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Manage study guidelines and materials by class standard</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search subject or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-55 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm font-medium"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <select
              value={selectedStdFilter}
              onChange={(e) => setSelectedStdFilter(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold shadow-sm w-full cursor-pointer appearance-none"
            >
              <option value="All">All Standards</option>
              <option value="5th">5th Standard</option>
              <option value="6th">6th Standard</option>
              <option value="7th">7th Standard</option>
              <option value="8th">8th Standard</option>
              <option value="9th">9th Standard</option>
              <option value="10th">10th Standard</option>
              <option value="11th">11th Standard</option>
              <option value="12th">12th Standard</option>
            </select>
          </div>

          <button 
            onClick={() => setShowForm(true)} 
            className={`${btnPrimary} py-2.5 text-sm shrink-0 shadow-indigo-650/15`}
          >
            <Plus size={16} /> Upload Study Material
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      {isLoading ? (
        <div className={`${glassPanel} p-16 flex items-center justify-center`}>
          <Loader2 className="animate-spin text-indigo-500 mr-2" size={24} />
          <span className="text-slate-505 font-bold text-sm">Synchronizing Study Material Bank...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className={`${glassPanel} p-16 text-center`}>
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200 text-slate-400">
            <FileText size={28} />
          </div>
          <p className="text-slate-805 font-black text-lg">No Study Material Document Uploaded</p>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-medium">Create and upload a new PDF study material document to publish educational resources for students.</p>
        </div>
      ) : (
        <div className={`${glassPanel} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                  <th className="p-5 pl-8">Standard</th>
                  <th className="p-5">Subject</th>
                  <th className="p-5">Document Title</th>
                  <th className="p-5">Uploaded On</th>
                  <th className="p-5 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 pl-8">
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-black text-xs">
                        {item.std} Std
                      </span>
                    </td>
                    <td className="p-5 font-bold text-slate-900">{item.subject}</td>
                    <td className="p-5 text-slate-500">
                      <div className="flex items-center gap-2 max-w-xs md:max-w-sm truncate">
                        <FileText size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate" title={item.pdfName}>{item.pdfName}</span>
                      </div>
                    </td>
                    <td className="p-5 text-xs text-slate-400 font-semibold">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/view-pdf/${item._id}`)}
                          className="p-2 bg-slate-105 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                          title="View PDF Document"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                          title="Delete Study Material"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Study Material Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Upload Study Material</h4>
                  <p className="text-slate-400 text-xs font-semibold">Distribute study papers for school classes</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowForm(false); setSubject(''); setPdfFile(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Class Standard</label>
                <select
                  value={std}
                  onChange={(e) => setStd(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold appearance-none cursor-pointer"
                >
                  <option value="5th">5th Standard</option>
                  <option value="6th">6th Standard</option>
                  <option value="7th">7th Standard</option>
                  <option value="8th">8th Standard</option>
                  <option value="9th">9th Standard</option>
                  <option value="10th">10th Standard</option>
                  <option value="11th">11th Standard</option>
                  <option value="12th">12th Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, General Science, Civics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Study Material PDF File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:bg-slate-50/55 hover:border-indigo-400 transition-all text-center relative cursor-pointer group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="mx-auto text-slate-300 group-hover:text-indigo-400 transition-colors mb-2" size={32} />
                  {pdfFile ? (
                    <div>
                      <p className="font-extrabold text-sm text-indigo-650 truncate max-w-xs mx-auto">{pdfFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {pdfFile.size >= 1024 * 1024 * 1024
                          ? `${(pdfFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
                          : `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB`}{" "}
                        • Click to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Select files or drag here</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Accept PDF documents up to 1GB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setSubject(''); setPdfFile(null); }}
                  className="px-5 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-sm rounded-xl transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${btnPrimary} text-sm py-3 px-6 shadow-indigo-600/10 min-w-32`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Publish Study Material</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusManager;
