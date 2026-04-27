import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Menu, Trophy, Lightbulb, AlertCircle, BookOpen, X, CheckCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface Notif {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const defaultNotifs: Notif[] = [
  { _id: '1', type: 'achievement', title: 'Session Completed! 🏆', message: 'Check your feedback for insights.', read: false, createdAt: new Date().toISOString() },
  { _id: '2', type: 'reminder', title: 'Practice Streak at Risk! ⚠️', message: "You haven't practiced in 2 days.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '3', type: 'tip', title: 'Interview Tip 💡', message: 'Use the STAR method for behavioral answers.', read: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '4', type: 'system', title: 'New Questions Available!', message: '15 new System Design questions added.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const typeIcon = (type: string) => {
  switch(type) {
    case 'achievement': return <Trophy className="w-4 h-4 text-amber-400" />;
    case 'reminder': return <AlertCircle className="w-4 h-4 text-secondary" />;
    case 'tip': return <Lightbulb className="w-4 h-4 text-green-400" />;
    default: return <BookOpen className="w-4 h-4 text-primary" />;
  }
};

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(defaultNotifs);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Simulate periodic notifications
  useEffect(() => {
    const reminderMessages = [
      { title: 'Practice Reminder 🎯', message: 'Your daily practice session is waiting!', type: 'reminder' },
      { title: 'New Tip Available 💡', message: 'Check your daily interview tip.', type: 'tip' },
      { title: 'Weekly Goal Progress 📊', message: "You're 60% of the way to your weekly goal!", type: 'system' },
    ];
    const interval = setInterval(() => {
      const msg = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
      setNotifs(prev => [{
        _id: Date.now().toString(),
        ...msg,
        read: false,
        createdAt: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
    }, 120000); // Every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`;

  return (
    <nav className="fixed top-10 w-full z-50 bg-black/5 dark:bg-[#0e0e0e]/60 backdrop-blur-[25px] border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,229,255,0.06)] flex justify-between items-center px-6 md:px-8 h-20 font-headline tracking-tight transition-all duration-300">
      {/* Left: Menu + Logo + Nav Links */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-primary hover:border-primary/30 transition-all active:scale-95">
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/dashboard" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
          Interview Forge AI
        </Link>
        <div className="hidden lg:flex items-center gap-1 ml-2">
          {[
            { to: '/practice', label: 'Practice' },
            { to: '/feedback', label: 'Feedback' },
            { to: '/insights', label: 'Insights' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Notifications + Settings + Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2.5 text-white/50 hover:text-white hover:bg-white/5 transition-all rounded-xl active:scale-95">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center shadow-lg">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 w-80 bg-[#0e0e0e]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h4 className="font-headline font-bold text-white text-sm">Notifications</h4>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> All read
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} className="text-white/30 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Notification Items */}
                <div className="max-h-72 overflow-y-auto">
                  {notifs.slice(0, 6).map(n => (
                    <div key={n._id} onClick={() => { markRead(n._id); }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${!n.read ? 'bg-primary/3' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-tight ${n.read ? 'text-white/50' : 'text-white'}`}>{n.title}</p>
                        <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{n.message}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] text-white/20">{relativeTime(n.createdAt)}</span>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Footer */}
                <div className="p-3">
                  <button onClick={() => { setShowNotifs(false); navigate('/notifications'); }}
                    className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white transition-all">
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button onClick={() => navigate('/settings')}
          className="p-2.5 text-white/50 hover:text-white hover:bg-white/5 transition-all rounded-xl active:scale-95">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <button onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full border-2 border-primary/20 overflow-hidden hover:border-primary/50 transition-all active:scale-95 flex-shrink-0">
          <img src={avatarSrc} alt={user?.name || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </button>
      </div>
    </nav>
  );
}
