import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Normal imports for layouts, utilities, and boundaries
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToHash from './components/ScrollToHash';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components for split bundles
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ExamsList = lazy(() => import('./pages/ExamsList'));
const ExamDetails = lazy(() => import('./pages/ExamDetails'));
const TakeExam = lazy(() => import('./pages/TakeExam'));
const Profile = lazy(() => import('./pages/Profile'));
const Results = lazy(() => import('./pages/Results'));
const StudyMaterial = lazy(() => import('./pages/StudyMaterial'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TestDetails = lazy(() => import('./pages/TestDetails'));
const TakeTest = lazy(() => import('./pages/TakeTest'));
const PDFViewer = lazy(() => import('./pages/PDFViewer'));
const LiveClasses = lazy(() => import('./pages/LiveClasses'));

// Premium, tailored loading spinner fallback
const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="relative w-16 h-16">
      {/* Ambient Pulsing Glow */}
      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
      {/* Precision Loading Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">
      Loading Scholar Portal...
    </p>
  </div>
);

// Wrapper so we can use useLocation inside Router
const AppContent = () => {
  const { user } = useSelector((state) => state.user);
  const { admin } = useSelector((state) => state.admin);
  const location = useLocation();

  // Pages that use a full-screen layout (no shared Navbar/Footer)
  const fullScreenPages = ['/login', '/register', '/admin-login', '/admin-dashboard'];
  const isFullScreen = fullScreenPages.includes(location.pathname) || location.pathname.startsWith('/take-exam/') || location.pathname.startsWith('/take-test/') || location.pathname.startsWith('/view-pdf/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isFullScreen && <Navbar />}
      <Toaster position="top-center" />
      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={!user ? <Login /> : (user.role === 'admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/" />)} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/exams" element={<ExamsList />} />
              <Route path="/exams/:id" element={<ExamDetails />} />
              <Route path="/take-exam/:id" element={user ? <TakeExam /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />} />
              <Route path="/tests/:id" element={<TestDetails />} />
              <Route path="/take-test/:id" element={user ? <TakeTest /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/results" element={user ? <Results /> : <Navigate to="/login" />} />
              <Route path="/study-material" element={user ? <StudyMaterial /> : <Navigate to="/login" />} />
              <Route path="/live-classes" element={user ? <LiveClasses /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />} />
              <Route path="/view-pdf/:id" element={user || admin ? <PDFViewer /> : <Navigate to="/login" />} />
              
              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={admin ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isFullScreen && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToHash />
      <AppContent />
    </Router>
  );
}

export default App;