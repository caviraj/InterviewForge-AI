/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import NotificationBar from './components/NotificationBar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Coach from './pages/Coach';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';
import QuestionBank from './pages/QuestionBank';
import MockInterviews from './pages/MockInterviews';
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';
import ForgotPasswordPage from './pages/ForgotPassword';
import PracticeMode from './pages/PracticeMode';
import Feedback from './pages/Feedback';
import Insights from './pages/Insights';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { Link as RouterLink } from 'react-router-dom';
import { LayoutDashboard, Mic, Brain, User, Play } from 'lucide-react';
import { useAuth } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-white/50 text-sm font-label uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const authRoutes = ['/login', '/signup', '/forgot-password'];
  const isAuthPage = authRoutes.includes(location.pathname);
  const isInterviewSession = location.pathname === '/interviews/session';

  React.useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen]);

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-white">
      <NotificationBar />
      <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-30" />
        )}
      </AnimatePresence>

      <main className={`transition-all duration-500 ease-in-out pt-32 px-4 md:px-10 lg:px-14 pb-24 min-h-screen relative ${isSidebarOpen ? 'blur-sm' : 'blur-0'}`}>
        {/* Background Ambient Glows */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-5%] left-[5%] w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      {!isInterviewSession && (
        <footer className="xl:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-white/10 flex justify-around items-center h-18 px-4 z-50 pb-safe">
          {[
            { to: '/dashboard', icon: LayoutDashboard, label: 'Forge' },
            { to: '/practice', icon: Play, label: 'Practice' },
            { to: '/interviews', icon: Mic, label: 'Live' },
            { to: '/coach', icon: Brain, label: 'Coach' },
            { to: '/profile', icon: User, label: 'Profile' },
          ].map(({ to, icon: Icon, label }) => (
            <RouterLink key={to} to={to}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-colors ${location.pathname === to ? 'text-primary' : 'text-white/30 hover:text-white/60'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </RouterLink>
          ))}
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticeMode /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><MockInterviews /></ProtectedRoute>} />
          <Route path="/interviews/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/interviews/report" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
