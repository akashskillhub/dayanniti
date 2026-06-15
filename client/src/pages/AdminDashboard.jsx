import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin, resetAdmin } from '../redux/adminSlice';
import {
  Users, BookOpen, MessageSquare, LayoutDashboard, LogOut,
  Plus, Trash2, CheckCircle2, Clock, ChevronRight,
  TrendingUp, ShieldCheck, Search, Filter, Loader2, ArrowLeft, Target, Pencil,
  Menu, X, Database, Sparkles, FileText, Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import SyllabusManager from '../components/SyllabusManager';


const AdminDashboard = () => {
  const { admin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [tests, setTests] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Exam Form State
  const [showExamForm, setShowExamForm] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', description: '', duration: 60, totalMarks: 100, questions: [], std: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editExamId, setEditExamId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStdFilter, setSelectedStdFilter] = useState('All');

  // Test Form State
  const [showTestForm, setShowTestForm] = useState(false);
  const [newTest, setNewTest] = useState({ testCode: '', title: '', description: '', author: '', ageRange: '', administration: 'GROUP', language: 'English', category: '', questions: [] });
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [isEditingTest, setIsEditingTest] = useState(false);
  const [editTestId, setEditTestId] = useState(null);
  const [testSearchTerm, setTestSearchTerm] = useState('');

  // Zoom Classes States
  const [zoomClasses, setZoomClasses] = useState([]);
  // Test Inquiries State
  const [testInquiries, setTestInquiries] = useState([]);
  const [showZoomForm, setShowZoomForm] = useState(false);
  const [newZoomClass, setNewZoomClass] = useState({
    subject: '',
    zoomLink: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    std: 'All'
  });
  const [isSubmittingZoom, setIsSubmittingZoom] = useState(false);

  const resetForm = () => {
    setNewExam({ title: '', description: '', duration: 60, totalMarks: 100, questions: [], std: '' });
    setIsEditing(false);
    setEditExamId(null);
    setShowExamForm(false);
  };

  const resetTestForm = () => {
    setNewTest({ testCode: '', title: '', description: '', author: '', ageRange: '', administration: 'GROUP', language: 'English', category: '', questions: [] });
    setIsEditingTest(false);
    setEditTestId(null);
    setShowTestForm(false);
  };

  const resetZoomForm = () => {
    setNewZoomClass({
      subject: '',
      zoomLink: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      std: 'All'
    });
    setShowZoomForm(false);
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStd = selectedStdFilter === 'All' || (exam.std && exam.std.toLowerCase() === selectedStdFilter.toLowerCase());
    return matchesSearch && matchesStd;
  });

  const filteredTests = tests.filter(test => {
    return test.title.toLowerCase().includes(testSearchTerm.toLowerCase());
  });

  // Styles (Light Theme adapted)
  const glassPanel = "bg-white border border-slate-200/80 rounded-3xl shadow-sm";
  const btnPrimary = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-300 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-600/10";

  useEffect(() => { 
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    fetchInitialData(); 
  }, [admin, navigate]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch exams
      const examsRes = await fetch('/api/exams');
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData.data || examsData);
      }

      // Fetch tests
      const testsRes = await fetch('/api/tests');
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setTests(testsData.data || testsData);
      }

      // Fetch users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || usersData);
      }

      // Fetch inquiries
      const inquiriesRes = await fetch('/api/contact');
      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        setInquiries(inquiriesData.data || inquiriesData);
      }

      // Fetch zoom classes
      const zoomRes = await fetch('/api/zoom-classes');
      if (zoomRes.ok) {
        const zoomData = await zoomRes.json();
        setZoomClasses(zoomData.data || zoomData);
      }

      // Fetch test inquiries
      const testInquiriesRes = await fetch('/api/test-inquiries');
      if (testInquiriesRes.ok) {
        const testInquiriesData = await testInquiriesRes.json();
        setTestInquiries(testInquiriesData.data || testInquiriesData);
      }
    } catch (error) { 
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { dispatch(logoutAdmin()); dispatch(resetAdmin()); navigate('/admin-login'); };

  // --- Exam Form Logic ---
  const handleAddQuestion = () => {
    setNewExam({
      ...newExam,
      questions: [...newExam.questions, { questionText: '', questionImage: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', explanationImage: '' }]
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions.splice(index, 1);
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions[index][field] = value;
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  // --- Test Form Logic ---
  const handleAddTestQuestion = () => {
    setNewTest({
      ...newTest,
      questions: [...newTest.questions, { questionText: '', questionImage: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', explanationImage: '' }]
    });
  };

  const handleRemoveTestQuestion = (index) => {
    const updatedQuestions = [...newTest.questions];
    updatedQuestions.splice(index, 1);
    setNewTest({ ...newTest, questions: updatedQuestions });
  };

  const handleTestQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newTest.questions];
    updatedQuestions[index][field] = value;
    setNewTest({ ...newTest, questions: updatedQuestions });
  };

  const handleTestOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...newTest.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setNewTest({ ...newTest, questions: updatedQuestions });
  };

  const handleImageUpload = async (qIndex, field, file, isTest = false) => {
    if (!file) return;
    
    const toastId = toast.loading("Uploading image...");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (isTest) {
          handleTestQuestionChange(qIndex, field, data.url);
        } else {
          handleQuestionChange(qIndex, field, data.url);
        }
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to upload image.", { id: toastId });
      }
    } catch (error) {
      toast.error("Error uploading image.", { id: toastId });
    }
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (newExam.questions.length === 0) {
      return toast.error("Please add at least one question.");
    }
    
    // Basic validation
    for (let i = 0; i < newExam.questions.length; i++) {
      const q = newExam.questions[i];
      if (!q.questionText || q.options.some(opt => !opt) || !q.correctAnswer) {
        return toast.error(`Please completely fill out Question ${i + 1}`);
      }
      if (!q.options.includes(q.correctAnswer)) {
        return toast.error(`Correct answer for Question ${i + 1} must match one of the options exactly.`);
      }
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/exams/${editExamId}` : '/api/exams';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newExam, createdBy: admin._id })
      });
      if (res.ok) {
        toast.success(`Exam ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        fetchInitialData();
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} exam`);
      }
    } catch (error) {
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} exam`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExam = (exam) => {
    setNewExam({
      title: exam.title || '',
      description: exam.description || '',
      duration: exam.duration || 60,
      totalMarks: exam.totalMarks || 100,
      questions: exam.questions || [],
      std: exam.std || ''
    });
    setIsEditing(true);
    setEditExamId(exam._id);
    setShowExamForm(true);
  };

  const executeDeleteExam = async (id) => {
    const toastId = toast.loading("Deleting exam...");
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Exam deleted successfully", { id: toastId });
        fetchInitialData();
      } else {
        toast.error("Failed to delete exam", { id: toastId });
      }
    } catch (error) {
      toast.error("Error deleting exam", { id: toastId });
    }
  };

  const handleDeleteExam = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-slate-800 text-sm font-bold">
          Are you sure you want to delete this exam?
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
              executeDeleteExam(id);
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

  // --- Test handlers ---
  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!newTest.title) {
      return toast.error("Please enter a test title.");
    }

    // Basic question validation if there are questions
    for (let i = 0; i < newTest.questions.length; i++) {
      const q = newTest.questions[i];
      if (!q.questionText || q.options.some(opt => !opt) || !q.correctAnswer) {
        return toast.error(`Please completely fill out Question ${i + 1}`);
      }
      if (!q.options.includes(q.correctAnswer)) {
        return toast.error(`Correct answer for Question ${i + 1} must match one of the options exactly.`);
      }
    }

    setIsSubmittingTest(true);
    try {
      const url = isEditingTest ? `/api/tests/${editTestId}` : '/api/tests';
      const method = isEditingTest ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTest, createdBy: admin._id })
      });
      if (res.ok) {
        toast.success(`Test ${isEditingTest ? 'updated' : 'created'} successfully!`);
        resetTestForm();
        fetchInitialData();
      } else {
        toast.error(`Failed to ${isEditingTest ? 'update' : 'create'} test`);
      }
    } catch (error) {
      toast.error(`Error ${isEditingTest ? 'updating' : 'creating'} test`);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleEditTest = (test) => {
    setNewTest({
      testCode: test.testCode || '',
      title: test.title || '',
      description: test.description || '',
      author: test.author || '',
      ageRange: test.ageRange || '',
      administration: test.administration || 'GROUP',
      language: test.language || 'English',
      category: test.category || '',
      questions: test.questions || []
    });
    setIsEditingTest(true);
    setEditTestId(test._id);
    setShowTestForm(true);
  };

  const executeDeleteTest = async (id) => {
    const toastId = toast.loading("Deleting test...");
    try {
      const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Test deleted successfully", { id: toastId });
        fetchInitialData();
      } else {
        toast.error("Failed to delete test", { id: toastId });
      }
    } catch (error) {
      toast.error("Error deleting test", { id: toastId });
    }
  };

  const handleDeleteTest = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-slate-800 text-sm font-bold">
          Are you sure you want to delete this test?
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
              executeDeleteTest(id);
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

  // --- Zoom Class Handlers ---
  const handleSubmitZoom = async (e) => {
    e.preventDefault();
    if (!newZoomClass.subject || !newZoomClass.zoomLink || !newZoomClass.date || !newZoomClass.startTime || !newZoomClass.endTime) {
      return toast.error("Please fill out all fields.");
    }
    
    const start = new Date(`${newZoomClass.date}T${newZoomClass.startTime}:00`);
    const end = new Date(`${newZoomClass.date}T${newZoomClass.endTime}:00`);
    
    if (end <= start) {
      return toast.error("End time must be after start time.");
    }

    if (end <= new Date()) {
      return toast.error("Class end time must be in the future.");
    }

    setIsSubmittingZoom(true);
    try {
      const res = await fetch('/api/zoom-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newZoomClass.subject,
          zoomLink: newZoomClass.zoomLink,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          std: newZoomClass.std,
          createdBy: admin._id
        })
      });
      if (res.ok) {
        toast.success("Live class scheduled successfully!");
        resetZoomForm();
        fetchInitialData();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to schedule live class");
      }
    } catch (error) {
      toast.error("Error scheduling live class");
    } finally {
      setIsSubmittingZoom(false);
    }
  };

  const executeDeleteZoom = async (id) => {
    const toastId = toast.loading("Deleting live class link...");
    try {
      const res = await fetch(`/api/zoom-classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Zoom class deleted successfully", { id: toastId });
        fetchInitialData();
      } else {
        toast.error("Failed to delete class link", { id: toastId });
      }
    } catch (error) {
      toast.error("Error deleting class link", { id: toastId });
    }
  };

  const handleDeleteZoom = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-slate-800 text-sm font-bold">
          Are you sure you want to delete this class link?
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
              executeDeleteZoom(id);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-slate-900 text-base">AdminSuite</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-550 hover:bg-slate-100 rounded-lg">
          <Menu size={20} />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"></div>
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-slate-950 border-r border-slate-850 flex flex-col fixed lg:sticky top-0 bottom-0 left-0 h-screen p-6 shadow-2xl z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center border border-indigo-400/20 shrink-0">
              <span className="text-white font-extrabold text-lg tracking-wider">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">NyayNiti</span>
              <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-0.5">Admin Suite</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-grow mt-4">
          {[
            { id: 'overview', name: 'Dashboard', icon: LayoutDashboard, desc: 'System statistics & actions' },
            { id: 'exams', name: 'Exam Bank', icon: BookOpen, desc: 'Manage timed syllabus exams' },
            { id: 'tests', name: 'Test Bank', icon: FileText, desc: 'Manage untimed assessments' },
            { id: 'testInquiries', name: 'Test Inquiries', icon: FileText, desc: 'Review student test applications' },
            { id: 'users', name: 'Scholars', icon: Users, desc: 'Registered student database' },
            { id: 'zoomClasses', name: 'Live Classes', icon: Video, desc: 'Manage Zoom session links' },
            { id: 'syllabus', name: 'Study Material', icon: FileText, desc: 'Manage class study material PDFs' },
            { id: 'inquiries', name: 'Messages', icon: MessageSquare, desc: 'Support inquiries' },
          ].map((item) => {

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); resetForm(); resetTestForm(); resetZoomForm(); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all duration-305 relative group ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-650/20' 
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <item.icon size={18} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-wide leading-snug">{item.name}</span>
                  <span className={`text-[9px] font-medium leading-none mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>{item.desc}</span>
                </div>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="border-t border-slate-900 pt-5 mt-auto space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-purple-500/10 uppercase">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{admin?.name || 'Administrator'}</span>
              <span className="text-[10px] text-slate-400 font-semibold truncate">{admin?.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-rose-500/20"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 lg:p-12 overflow-y-auto h-screen relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>
        ) : (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            
            {/* Page Header */}
            {!showExamForm && !showTestForm && (
              <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5 text-xs text-indigo-650 font-bold uppercase tracking-wider mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                    Admin Panel / {activeTab}
                  </div>
                  <h1 className="text-4xl font-black tracking-tight capitalize text-slate-900 flex items-center gap-3">
                    {activeTab === 'overview' && 'System Overview'}
                    {activeTab === 'exams' && 'Exam Bank Manager'}
                    {activeTab === 'tests' && 'Test Bank Manager'}
                    {activeTab === 'testInquiries' && 'Test Inquiries Inbox'}
                    {activeTab === 'users' && 'Scholar Directory'}
                    {activeTab === 'zoomClasses' && 'Live Zoom Classes'}
                    {activeTab === 'syllabus' && 'Study Material Repository'}
                    {activeTab === 'inquiries' && 'Support Desk'}
                  </h1>
                  <p className="text-slate-555 mt-1.5 text-sm font-medium">
                    {activeTab === 'overview' && 'Real-time metrics, system settings, and administrative summaries.'}
                    {activeTab === 'exams' && 'Configure syllabus exams, upload worksheets, and review question pools.'}
                    {activeTab === 'tests' && 'Configure assessment tests by title.'}
                    {activeTab === 'testInquiries' && 'Review student inquiry forms for Medical, IQ, and other tests.'}
                    {activeTab === 'users' && 'View educational profiles, contacts, and registration parameters.'}
                    {activeTab === 'zoomClasses' && 'Schedule and manage daily Zoom meeting links for students.'}
                    {activeTab === 'syllabus' && 'Upload and distribute class subject study materials and educational PDFs.'}
                    {activeTab === 'inquiries' && 'Review and respond to messages submitted by visitors.'}

                  </p>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold shadow-sm">
                    <Database size={12} className="animate-pulse" />
                    <span>Live Database Connect</span>
                  </div>
                  
                  {activeTab === 'exams' && (
                    <button onClick={() => setShowExamForm(true)} className={`${btnPrimary} shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5`}>
                      <Plus size={18} /> Create New Exam
                    </button>
                  )}

                  {activeTab === 'tests' && (
                    <button onClick={() => setShowTestForm(true)} className={`${btnPrimary} shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5`}>
                      <Plus size={18} /> Create New Test
                    </button>
                  )}

                  {activeTab === 'zoomClasses' && !showZoomForm && (
                    <button onClick={() => setShowZoomForm(true)} className={`${btnPrimary} shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5`}>
                      <Plus size={18} /> Schedule Live Class
                    </button>
                  )}
                </div>
              </header>
            )}

            {/* Content: Overview */}
            {activeTab === 'overview' && !showExamForm && !showTestForm && (
              <div className="space-y-8">
                {/* Welcome Card Banner */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 shadow-2xl text-white">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
                  <div className="absolute left-1/3 bottom-0 translate-y-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-300 text-xs font-black tracking-widest uppercase">
                        <Sparkles size={12} className="animate-spin-slow" />
                        Admin Workspace
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-350">{admin?.name || 'Administrator'}</span>!
                      </h2>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        You have total control over the scholar database, exam creation portals, and helpdesk operations. Review system performance and pending alerts below.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 shrink-0 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Server State</p>
                        <p className="text-emerald-400 font-black text-lg mt-1 flex items-center justify-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Online
                        </p>
                      </div>
                      <div className="text-center border-l border-white/10 pl-4">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sync Rate</p>
                        <p className="text-white font-black text-lg mt-1">100% OK</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Registered Scholars', value: users.length || '0', color: 'text-indigo-650', icon: Users, bg: 'bg-indigo-50 border-indigo-100', trend: 'Fully active in portal' },
                    { label: 'Published Exams', value: exams.length, color: 'text-emerald-600', icon: BookOpen, bg: 'bg-emerald-50 border-emerald-100', trend: 'Active test sessions' },
                    { label: 'Active Tests', value: tests.length, color: 'text-purple-650', icon: FileText, bg: 'bg-purple-50 border-purple-100', trend: 'Untimed assessments' },
                    { label: 'Support Inquiries', value: inquiries.length || '0', color: 'text-amber-600', icon: MessageSquare, bg: 'bg-amber-50 border-amber-100', trend: 'Pending actions' },
                  ].map((stat, i) => (
                    <div key={i} className={`${glassPanel} p-6 relative overflow-hidden transition-all duration-305 hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-350 group cursor-default`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                          <h3 className={`text-4xl font-black mt-2 tracking-tight ${stat.color}`}>{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${stat.bg} text-slate-800 transition-transform duration-300 group-hover:scale-110`}>
                          <stat.icon size={18} className={stat.color} />
                        </div>
                      </div>
                      <div className="mt-4 border-t border-slate-100 pt-3 flex items-center gap-1.5 text-xs text-slate-505 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                        {stat.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secondary Overview Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* System details */}
                  <div className={`${glassPanel} p-8 space-y-6`}>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Database className="text-indigo-650" size={18} />
                        Infrastructure Specs
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Backend service environment parameters</p>
                    </div>
                    
                    <div className="divide-y divide-slate-100 text-sm">
                      <div className="py-3 flex justify-between items-center font-medium">
                        <span className="text-slate-500 font-bold">API Base Endpoint</span>
                        <code className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-xs text-slate-800 font-mono">http://localhost:5050/api</code>
                      </div>
                      <div className="py-3 flex justify-between items-center font-medium">
                        <span className="text-slate-500 font-bold">Database Server</span>
                        <span className="text-slate-800 font-bold flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          MongoDB Atlas
                        </span>
                      </div>
                      <div className="py-3 flex justify-between items-center font-medium">
                        <span className="text-slate-500 font-bold">Active Port Config</span>
                        <span className="text-slate-800 font-extrabold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">5050</span>
                      </div>
                      <div className="py-3 flex justify-between items-center font-medium">
                        <span className="text-slate-500 font-bold">Authorization Strategy</span>
                        <span className="text-slate-800 font-bold">JSON Web Tokens (JWT)</span>
                      </div>
                    </div>
                  </div>

                  {/* System Quick Links */}
                  <div className={`${glassPanel} p-8 space-y-6`}>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-indigo-650" size={18} />
                        Administrative Shortcuts
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Common workflows and management actions</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setActiveTab('tests'); setShowTestForm(true); }}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-500 text-left transition-all group"
                      >
                        <FileText size={18} className="text-indigo-655 transition-transform duration-300 group-hover:scale-110" />
                        <span className="block font-extrabold text-slate-800 text-xs mt-3 leading-snug">New Test Module</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Create untimed assessment</span>
                      </button>

                      <button 
                        onClick={() => { setActiveTab('users'); }}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-500 text-left transition-all group"
                      >
                        <Users size={18} className="text-indigo-650 transition-transform duration-300 group-hover:scale-110" />
                        <span className="block font-extrabold text-slate-800 text-xs mt-3 leading-snug">Audit Scholars</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Browse student contact logs</span>
                      </button>

                      <button 
                        onClick={() => { setActiveTab('inquiries'); }}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-500 text-left transition-all group"
                      >
                        <MessageSquare size={18} className="text-indigo-650 transition-transform duration-300 group-hover:scale-110" />
                        <span className="block font-extrabold text-slate-800 text-xs mt-3 leading-snug">Review Inquiries</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Read incoming support mails</span>
                      </button>

                      <button 
                        onClick={() => { setActiveTab('exams'); }}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-500 text-left transition-all group"
                      >
                        <Target size={18} className="text-indigo-650 transition-transform duration-300 group-hover:scale-110" />
                        <span className="block font-extrabold text-slate-800 text-xs mt-3 leading-snug">Exam List</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Edit or remove draft tests</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content: Exams List */}
            {activeTab === 'exams' && !showExamForm && (
              <div className="space-y-6">
                {/* Search & Filter Header */}
                <div className={`${glassPanel} p-6 flex flex-col md:flex-row gap-4 items-center justify-between`}>
                  <div className="text-left w-full md:w-auto">
                    <h3 className="font-extrabold text-slate-900 text-lg">Exam Modules</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Currently active exam banks on the student portal</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search exam title..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm font-medium" 
                      />
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <select 
                        value={selectedStdFilter}
                        onChange={e => setSelectedStdFilter(e.target.value)}
                        className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold shadow-sm w-full appearance-none cursor-pointer"
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
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>
                
                {filteredExams.length === 0 ? (
                  <div className={`${glassPanel} p-16 text-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <BookOpen size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-800 font-black text-lg">No Exam Modules Found</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-medium">We couldn't find any exams matching your filter settings. Create a new exam module to populate the list.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredExams.map(exam => (
                      <div key={exam._id} className={`${glassPanel} p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-slate-350 transition-all duration-300 group`}>
                        <div>
                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-150 shrink-0">
                              {exam.std || 'General'} Standard
                            </span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleEditExam(exam)} className="text-slate-400 hover:text-indigo-650 p-2 rounded-xl hover:bg-slate-100 transition-all" title="Edit Exam">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteExam(exam._id)} className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all" title="Delete Exam">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Card Info */}
                          <h4 
                            onClick={() => navigate(`/exams/${exam._id}`)}
                            className="font-extrabold text-xl text-slate-900 group-hover:text-indigo-655 transition-colors leading-tight mb-2 cursor-pointer hover:underline"
                          >
                            {exam.title}
                          </h4>
                          {exam.description && (
                            <p className="text-slate-550 text-xs font-semibold line-clamp-2 leading-relaxed mb-4">
                              {exam.description}
                            </p>
                          )}
                        </div>

                        {/* Card Stats Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Duration</span>
                            <span className="font-extrabold text-xs text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                              <Clock size={12} className="text-indigo-500" />
                              {exam.duration} mins
                            </span>
                          </div>
                          
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Marks</span>
                            <span className="font-extrabold text-xs text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                              <Target size={12} className="text-emerald-500" />
                              {exam.totalMarks} Marks
                            </span>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">MCQs</span>
                            <span className="font-extrabold text-xs text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                              <CheckCircle2 size={12} className="text-purple-500" />
                              {exam.questions?.length || 0} Questions
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content: Tests List */}
            {activeTab === 'tests' && !showTestForm && (
              <div className="space-y-6">
                {/* Search & Filter Header */}
                <div className={`${glassPanel} p-6 flex flex-col md:flex-row gap-4 items-center justify-between`}>
                  <div className="text-left w-full md:w-auto">
                    <h3 className="font-extrabold text-slate-900 text-lg">Test Modules</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Currently active untimed tests on the portal</p>
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search test title..." 
                      value={testSearchTerm}
                      onChange={e => setTestSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm font-medium" 
                    />
                  </div>
                </div>
                
                {filteredTests.length === 0 ? (
                  <div className={`${glassPanel} p-16 text-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <FileText size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-800 font-black text-lg">No Test Modules Found</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-medium">Create a new test module to populate the list.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTests.map(test => (
                      <div key={test._id} className={`${glassPanel} p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-slate-350 transition-all duration-300 group`}>
                        <div>
                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-150 shrink-0">
                              {test.category || 'General'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleEditTest(test)} className="text-slate-400 hover:text-indigo-650 p-2 rounded-xl hover:bg-slate-100 transition-all" title="Edit Test">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteTest(test._id)} className="text-slate-400 hover:text-rose-605 p-2 rounded-xl hover:bg-rose-50 transition-all" title="Delete Test">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Card Info */}
                          <h4 
                            onClick={() => navigate(`/tests/${test._id}`)}
                            className="font-extrabold text-xl text-slate-900 group-hover:text-indigo-655 transition-colors leading-tight mb-2 cursor-pointer hover:underline"
                          >
                            {test.title}
                          </h4>
                          {test.description && (
                            <p className="text-slate-550 text-xs font-semibold line-clamp-2 leading-relaxed mb-4">
                              {test.description}
                            </p>
                          )}
                        </div>

                        {/* Card Stats Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-slate-55 p-2 rounded-xl border border-slate-100/70">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-450">Limit</span>
                            <span className="font-extrabold text-xs text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                              Untimed
                            </span>
                          </div>
                          
                          <div className="bg-slate-55 p-2 rounded-xl border border-slate-100/70">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-455">Author</span>
                            <span className="font-extrabold text-[10px] text-slate-800 truncate block mt-0.5 max-w-[100px]" title={test.author}>
                              {test.author || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content: Scholars List */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search Header */}
                <div className={`${glassPanel} p-6 flex flex-col md:flex-row gap-4 items-center justify-between`}>
                  <div className="text-left w-full md:w-auto">
                    <h3 className="font-extrabold text-slate-900 text-lg">Scholar Profiles</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Audit system credentials, school listings, and progress</p>
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search name or email..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm font-medium" 
                    />
                  </div>
                </div>

                {users.length === 0 ? (
                  <div className={`${glassPanel} p-16 text-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <Users size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-800 font-black text-lg">No registered scholars found.</p>
                  </div>
                ) : (
                  <div className={`${glassPanel} overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-200 border-b border-slate-800">
                            <th className="px-6 py-4">Scholar Details</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Academic Info</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Teacher Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {users
                            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((u, index) => {
                              const initialsGradients = [
                                'from-indigo-500 to-purple-500',
                                'from-emerald-500 to-teal-500',
                                'from-cyan-500 to-blue-500',
                                'from-amber-500 to-orange-500',
                                'from-rose-500 to-red-500'
                              ];
                              const gradient = initialsGradients[index % initialsGradients.length];
                              return (
                                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                      {u.profilePic ? (
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-inner shrink-0">
                                          <img src={u.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0`}>
                                          {u.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <span className="font-extrabold text-slate-800 block text-sm leading-tight tracking-wide truncate">{u.name}</span>
                                        <span className="text-[11px] text-slate-450 font-semibold mt-0.5 block truncate">{u.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 shrink-0">
                                    <span className="text-xs font-bold text-slate-700 block tracking-wider">{u.mobile}</span>
                                    {u.age && <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Age: {u.age} Years</span>}
                                  </td>
                                  <td className="px-6 py-5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-750 border border-indigo-150 inline-block">
                                      Class {u.std || 'N/A'}
                                    </span>
                                    <span className="text-xs text-slate-500 font-bold block mt-1.5 truncate max-w-[180px]" title={u.schoolName}>{u.schoolName || 'N/A'}</span>
                                  </td>
                                  <td className="px-6 py-5 text-xs font-semibold text-slate-650 leading-relaxed max-w-[200px] truncate">
                                    {u.village && <span>{u.village}, </span>}
                                    {u.taluka && <span>{u.taluka}, </span>}
                                    {u.district && <span className="text-slate-800 font-bold">{u.district}</span>}
                                    {!u.village && !u.taluka && !u.district && <span className="text-slate-400">N/A</span>}
                                  </td>
                                  <td className="px-6 py-5 text-xs">
                                    <span className="font-extrabold text-slate-755 block leading-tight">{u.teacherName || 'N/A'}</span>
                                    {u.teacherContact && <span className="text-slate-400 font-semibold mt-0.5 block tracking-wider">{u.teacherContact}</span>}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content: Zoom Live Classes */}
            {activeTab === 'zoomClasses' && !showZoomForm && (
              <div className="space-y-6">
                <div className={`${glassPanel} p-6 flex flex-col md:flex-row gap-4 items-center justify-between`}>
                  <div className="text-left w-full md:w-auto">
                    <h3 className="font-extrabold text-slate-900 text-lg">Scheduled Live Classes</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Currently active or upcoming Zoom meetings for students</p>
                  </div>
                  <button onClick={() => setShowZoomForm(true)} className={btnPrimary}>
                    <Plus size={18} /> Schedule Live Class
                  </button>
                </div>

                {zoomClasses.length === 0 ? (
                  <div className={`${glassPanel} p-16 text-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <Video size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-800 font-black text-lg">No Live Classes Scheduled</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-medium">Add a zoom class link to display active classes on the student panels.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {zoomClasses.map((cls) => {
                      const start = new Date(cls.startTime);
                      const end = new Date(cls.endTime);
                      const isLive = new Date() >= start && new Date() <= end;
                      
                      return (
                        <div key={cls._id} className={`${glassPanel} p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-slate-350 transition-all duration-300 group`}>
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isLive 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150 animate-pulse' 
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-150'
                              }`}>
                                {cls.std === 'All' ? 'All Classes' : `${cls.std} Standard`}
                              </span>
                              
                              <button onClick={() => handleDeleteZoom(cls._id)} className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all" title="Remove Link">
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <h4 className="font-extrabold text-xl text-slate-900 leading-tight mb-2">
                              {cls.subject}
                            </h4>
                            
                            <p className="text-slate-550 text-xs font-semibold break-all bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-3 font-mono">
                              {cls.zoomLink}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-indigo-500 shrink-0" />
                              <span>
                                {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <a href={cls.zoomLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-850 hover:underline flex items-center gap-1">
                              Join Meeting <ChevronRight size={14} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Content: Schedule Live Class Form */}
            {activeTab === 'zoomClasses' && showZoomForm && (
              <div className="animate-in slide-in-from-right-8 duration-500 pb-20">
                <button 
                  onClick={resetZoomForm} 
                  className="mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-indigo-650 font-bold transition-colors text-sm"
                >
                  <ArrowLeft size={16} /> Return to Scheduled List
                </button>

                <div className={`${glassPanel} p-8 md:p-10`}>
                  <div className="border-b border-slate-100 pb-5 mb-8">
                    <h3 className="text-2xl font-black text-slate-900">Schedule Live Class</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Configure Zoom link, subject details, timing, and targeted standard.</p>
                  </div>

                  <form onSubmit={handleSubmitZoom} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subject Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newZoomClass.subject} 
                          onChange={e => setNewZoomClass({ ...newZoomClass, subject: e.target.value })} 
                          placeholder="e.g. Mathematics, Indian Penal Code" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold focus:bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Target Standard/Class</label>
                        <select 
                          value={newZoomClass.std} 
                          onChange={e => setNewZoomClass({ ...newZoomClass, std: e.target.value })} 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold appearance-none cursor-pointer focus:bg-white"
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Class Date</label>
                        <input 
                          type="date" 
                          required 
                          value={newZoomClass.date} 
                          onChange={e => setNewZoomClass({ ...newZoomClass, date: e.target.value })} 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold focus:bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
                        <input 
                          type="time" 
                          required 
                          value={newZoomClass.startTime} 
                          onChange={e => setNewZoomClass({ ...newZoomClass, startTime: e.target.value })} 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold focus:bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">End Time</label>
                        <input 
                          type="time" 
                          required 
                          value={newZoomClass.endTime} 
                          onChange={e => setNewZoomClass({ ...newZoomClass, endTime: e.target.value })} 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Zoom Meeting Link</label>
                      <input 
                        type="url" 
                        required 
                        value={newZoomClass.zoomLink} 
                        onChange={e => setNewZoomClass({ ...newZoomClass, zoomLink: e.target.value })} 
                        placeholder="https://zoom.us/j/..." 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold focus:bg-white"
                      />
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSubmittingZoom} 
                        className={`${btnPrimary} px-10 py-4 text-base shadow-xl shadow-indigo-600/10 hover:-translate-y-0.5 active:scale-95`}
                      >
                        {isSubmittingZoom ? (
                          <><Loader2 className="animate-spin" size={18} /> Scheduling Meeting...</>
                        ) : (
                          <><CheckCircle2 size={18} /> Schedule Live Class</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Content: Test Inquiries List */}
            {activeTab === 'testInquiries' && (
              <div className="space-y-6">
                <div className={`${glassPanel} p-6 flex flex-col md:flex-row gap-4 items-center justify-between`}>
                  <div className="text-left w-full md:w-auto">
                    <h3 className="font-extrabold text-slate-905 text-lg">Test Applications & Inquiries</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Review basic details and purpose of students requesting tests</p>
                  </div>
                </div>

                {testInquiries.length === 0 ? (
                  <div className={`${glassPanel} p-16 text-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-105 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <FileText size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-800 font-black text-lg">No Inquiries Found</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-medium">Students will submit inquiry forms when requesting specific tests.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {testInquiries.map((inq) => (
                      <div key={inq._id} className={`${glassPanel} p-6 border-l-4 border-l-indigo-600`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-150">
                              {inq.testTitle}
                            </span>
                            <h4 className="font-extrabold text-lg text-slate-900 mt-2">{inq.name}</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">{inq.email}</p>
                          </div>
                          <span className="text-slate-455 text-[11px] font-bold">
                            {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inq.password && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Password:</span>
                              <span className="text-xs text-slate-700 font-bold">{inq.password}</span>
                            </div>
                          )}
                          {inq.age && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Age:</span>
                              <span className="text-xs text-slate-700 font-bold">{inq.age} years</span>
                            </div>
                          )}
                          {inq.educationLevel && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Education Level:</span>
                              <span className="text-xs text-slate-700 font-bold">{inq.educationLevel}</span>
                            </div>
                          )}
                          {inq.medicalHistory && (
                            <div className="md:col-span-2">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Medical History / Condition:</span>
                              <p className="text-xs text-slate-705 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">{inq.medicalHistory}</p>
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Why they choose this test:</span>
                            <p className="text-xs text-slate-700 font-semibold bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50 mt-1">{inq.whyChoose}</p>
                          </div>
                          {inq.additionalInfo && (
                            <div className="md:col-span-2">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Additional Info:</span>
                              <p className="text-xs text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">{inq.additionalInfo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content: Syllabus Management */}
            {activeTab === 'syllabus' && (
              <SyllabusManager 
                admin={admin} 
                glassPanel={glassPanel} 
                btnPrimary={btnPrimary} 
              />
            )}

            {/* Content: Messages List */}
            {activeTab === 'inquiries' && (

              <div className="space-y-6">
                <div className={`${glassPanel} p-6`}>
                  <h3 className="font-extrabold text-slate-900 text-lg">Support Desk Inbox</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Read, mark as read, or organize incoming inquiry records</p>
                </div>

                {inquiries.length === 0 ? (
                  <div className={`${glassPanel} p-16 text-center`}>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <MessageSquare size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-850 font-black text-lg">Inbox is Empty</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-medium">No customer or scholar support tickets are registered on this site.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inquiries.map((inq) => (
                      <div key={inq._id} className={`${glassPanel} p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between gap-6 border-l-4 ${inq.isRead ? 'border-l-slate-350 bg-slate-50/30' : 'border-l-indigo-600'}`}>
                        <div className="space-y-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-105 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-705">
                                {inq.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-905 block text-sm leading-none">{inq.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-1">{inq.email}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-slate-455 text-[11px] font-bold">
                                {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              
                              {inq.isRead ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-455 border border-slate-200">
                                  Closed / Read
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse">
                                  Active Inquiry
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <h4 className="font-black text-slate-800 text-sm mb-1.5 flex items-center gap-1">
                              <span className="text-slate-455 font-normal">Subject:</span>
                              {inq.subject}
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                              {inq.message}
                            </p>
                          </div>
                        </div>

                        {!inq.isRead && (
                          <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/contact/${inq._id}/read`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' }
                                  });
                                  if (res.ok) {
                                    toast.success("Message marked as read!");
                                    fetchInitialData();
                                  } else {
                                    toast.error("Failed to update message");
                                  }
                                } catch (err) {
                                  toast.error("Error marking message as read");
                                }
                              }}
                              className="px-4 py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-600 hover:text-white rounded-xl text-indigo-600 text-xs font-black transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={14} /> Mark as Resolved
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content: Exam Creation Form */}
            {activeTab === 'exams' && showExamForm && (
              <div className="animate-in slide-in-from-right-8 duration-500 pb-20">
                <button 
                  onClick={resetForm} 
                  className="inline-flex items-center gap-2 text-slate-550 hover:text-indigo-650 font-extrabold mb-8 transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm shadow-sm"
                >
                  <ArrowLeft size={16} /> Back to Exam Bank
                </button>

                <form onSubmit={handleSubmitExam} className="space-y-8">
                  {/* Basic Details */}
                  <div className={`${glassPanel} p-8`}>
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-650 border border-indigo-100">
                        <BookOpen size={16} />
                      </div>
                      Exam Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Exam Title</label>
                        <input type="text" required value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} placeholder="e.g. Midterm Mathematics" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description / Instructions</label>
                        <textarea rows="3" value={newExam.description} onChange={e => setNewExam({...newExam, description: e.target.value})} placeholder="Write instructions for the students..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 resize-none font-semibold transition-all focus:bg-white"></textarea>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-405 ml-1">Duration (Minutes)</label>
                        <input type="number" required min="1" value={newExam.duration} onChange={e => setNewExam({...newExam, duration: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-405 ml-1">Total Marks</label>
                        <input type="number" required min="1" value={newExam.totalMarks} onChange={e => setNewExam({...newExam, totalMarks: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-405 ml-1">Target Standard / Class</label>
                        <select required value={newExam.std || ''} onChange={e => setNewExam({...newExam, std: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white appearance-none cursor-pointer">
                          <option value="" disabled>Select Target Standard...</option>
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
                    </div>
                  </div>

                  {/* Questions Builder */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-500" /> Questions ({newExam.questions.length})
                      </h3>
                      <button type="button" onClick={handleAddQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
                        <Plus size={16} /> Add MCQ Question
                      </button>
                    </div>

                    {newExam.questions.length === 0 ? (
                      <div className="text-center p-16 bg-slate-55 border-2 border-slate-200 border-dashed rounded-[2rem]">
                        <p className="text-slate-400 font-bold text-sm">Click "Add MCQ Question" to build your exam worksheet questions.</p>
                      </div>
                    ) : (
                      newExam.questions.map((q, qIndex) => (
                        <div key={qIndex} className={`${glassPanel} p-8 relative group border-l-4 border-l-indigo-600 hover:border-slate-305 transition-all duration-300`}>
                          <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 bg-slate-105 hover:bg-rose-50 p-2.5 rounded-xl transition-all" title="Delete Question">
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="mb-6 space-y-4 max-w-[90%]">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center font-black text-indigo-600 text-xs">
                                {qIndex + 1}
                              </span>
                              <label className="text-sm font-extrabold text-slate-850">Question Title</label>
                            </div>
                            <textarea required rows="2" value={q.questionText} onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)} placeholder="Type the question query..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold text-base focus:bg-white resize-none" ></textarea>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Question Illustration (Optional)</label>
                              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <input type="file" accept="image/*" onChange={e => handleImageUpload(qIndex, 'questionImage', e.target.files[0])} className="w-full text-slate-550 text-xs font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-755 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                                {q.questionImage && (
                                  <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                    <img src={q.questionImage} alt="Uploaded" className="h-full w-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Option {String.fromCharCode(65 + oIndex)}</label>
                                <input type="text" required value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIndex)}`} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-850 text-sm font-semibold transition-all focus:border-slate-305" />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-4 mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Solution Explanation (Optional)</label>
                            <textarea rows="2" value={q.explanation || ''} onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)} placeholder="Provide context or explanation for why the chosen option is correct..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 resize-none font-semibold focus:bg-white"></textarea>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Explanation Illustration (Optional)</label>
                              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <input type="file" accept="image/*" onChange={e => handleImageUpload(qIndex, 'explanationImage', e.target.files[0])} className="w-full text-slate-550 text-xs font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-755 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                                {q.explanationImage && (
                                  <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                    <img src={q.explanationImage} alt="Uploaded" className="h-full w-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2.5 p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                            <label className="text-xs font-black uppercase tracking-widest text-emerald-800 ml-1">Correct Choice</label>
                            <select required value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-505 outline-none text-emerald-900 font-extrabold text-sm appearance-none cursor-pointer">
                              <option value="" disabled>Select correct answer Option...</option>
                              {q.options.map((opt, oIndex) => opt && (
                                <option key={oIndex} value={opt}>Option {String.fromCharCode(65 + oIndex)}: {opt}</option>
                              ))}
                            </select>
                            <p className="text-[10px] text-emerald-600 font-bold px-1">Must exactly match one of the option input strings above.</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className={`${btnPrimary} px-10 py-4 text-base shadow-xl shadow-indigo-600/10 hover:-translate-y-0.5 active:scale-95`}>
                      {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> {isEditing ? 'Updating' : 'Publishing'} Exam...</> : <><CheckCircle2 size={18} /> {isEditing ? 'Update Module' : 'Publish Module'}</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Content: Test Creation Form */}
            {activeTab === 'tests' && showTestForm && (
              <div className="animate-in slide-in-from-right-8 duration-500 pb-20">
                <button 
                  onClick={resetTestForm} 
                  className="inline-flex items-center gap-2 text-slate-505 hover:text-indigo-655 font-extrabold mb-8 transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm shadow-sm"
                >
                  <ArrowLeft size={16} /> Back to Test Bank
                </button>

                <form onSubmit={handleSubmitTest} className="space-y-8">
                  <div className={`${glassPanel} p-8`}>
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                        <FileText size={16} />
                      </div>
                      Test Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Test Name / Title</label>
                        <input type="text" required value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} placeholder="e.g. Medical Test, IQ Test" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Test Code</label>
                        <input type="text" value={newTest.testCode || ''} onChange={e => setNewTest({...newTest, testCode: e.target.value})} placeholder="e.g. 3F856C-INQ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Author</label>
                        <input type="text" value={newTest.author || ''} onChange={e => setNewTest({...newTest, author: e.target.value})} placeholder="e.g. Dr. John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Age Range</label>
                        <input type="text" value={newTest.ageRange || ''} onChange={e => setNewTest({...newTest, ageRange: e.target.value})} placeholder="e.g. 14-17" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Language</label>
                        <input type="text" value={newTest.language || ''} onChange={e => setNewTest({...newTest, language: e.target.value})} placeholder="e.g. English, Hindi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                        <input type="text" value={newTest.category || ''} onChange={e => setNewTest({...newTest, category: e.target.value})} placeholder="e.g. Personality, Cognitive" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Administration Mode</label>
                        <select value={newTest.administration || 'GROUP'} onChange={e => setNewTest({...newTest, administration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold transition-all focus:bg-white appearance-none cursor-pointer">
                          <option value="GROUP">GROUP</option>
                          <option value="INDIVIDUAL">INDIVIDUAL</option>
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                        <textarea rows="3" value={newTest.description || ''} onChange={e => setNewTest({...newTest, description: e.target.value})} placeholder="Describe the test's scope and purpose..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold transition-all focus:bg-white resize-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex justify-end">
                    <button type="submit" disabled={isSubmittingTest} className={`${btnPrimary} bg-purple-650 hover:bg-purple-700 px-10 py-4 text-base shadow-xl shadow-purple-600/10 hover:-translate-y-0.5 active:scale-95`}>
                      {isSubmittingTest ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><CheckCircle2 size={18} /> {isEditingTest ? 'Update Test' : 'Publish Test'}</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;