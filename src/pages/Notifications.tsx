import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Trophy, Lightbulb, AlertCircle, Settings, Zap, BookOpen } from 'lucide-react';
import { useApi } from '../context/AuthContext';

interface Notification {
  _id: string;
  type: 'system' | 'achievement' | 'reminder' | 'feedback' | 'tip';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const typeConfig = {
  system: { icon: Settings, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  achievement: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  reminder: { icon: Bell, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  feedback: { icon: Lightbulb, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  tip: { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

const defaultNotifications: Notification[] = [
  { _id: '1', type: 'achievement', title: 'Session Completed! 🏆', message: 'Great job completing your interview session. Check your feedback for insights.', read: false, createdAt: new Date().toISOString() },
  { _id: '2', type: 'reminder', title: 'Practice Streak at Risk! ⚠️', message: "You haven't practiced in 2 days. Maintain your streak by completing a session today!", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '3', type: 'tip', title: 'Interview Tip of the Day 💡', message: 'Use the STAR method (Situation, Task, Action, Result) to structure your behavioral answers clearly.', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '4', type: 'system', title: 'New Question Sets Available!', message: '15 new technical questions on System Design have been added to the Question Bank.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: '5', type: 'feedback', title: 'Confidence Score Improved! 📈', message: 'Your voice confidence score improved by 12% compared to last week. Keep practicing!', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: '6', type: 'achievement', title: 'New Badge Unlocked! 🎖️', message: 'You earned the "Consistent Learner" badge for completing 5 sessions in a week.', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { _id: '7', type: 'reminder', title: 'Weekly Goal Check-In', message: 'You\'ve completed 3 out of 5 sessions this week. 2 more to reach your weekly goal!', read: true, createdAt: new Date(Date.now() - 345600000).toISOString() },
  { _id: '8', type: 'tip', title: 'System Design Interview Tips', message: 'For system design interviews, always start by clarifying requirements before jumping into the solution.', read: true, createdAt: new Date(Date.now() - 432000000).toISOString() },
];

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function Notifications() {
  const authFetch = useApi();
  const [notes, setNotes] = useState<Notification[]>(defaultNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    authFetch('/api/notifications').then(data => {
      if (Array.isArray(data) && data.length > 0) setNotes(data);
    }).catch(() => {});
  }, []);

  const unreadCount = notes.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotes(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    authFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  };

  const markAllRead = () => {
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
    authFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  };

  const filtered = filter === 'unread' ? notes.filter(n => !n.read) : notes;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-1">Notification Center</p>
          <h1 className="text-4xl font-headline font-bold text-white">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-bold transition-all">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 w-fit">
        {(['all', 'unread'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              filter === t ? 'bg-gradient-primary text-black' : 'text-white/40 hover:text-white'
            }`}>
            {t === 'unread' ? `Unread (${unreadCount})` : 'All'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 text-center">
              <Bell className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-white/40 font-headline font-bold">All caught up!</p>
              <p className="text-white/20 text-sm">No {filter === 'unread' ? 'unread' : ''} notifications.</p>
            </motion.div>
          ) : filtered.map((note, i) => {
            const cfg = typeConfig[note.type] || typeConfig.system;
            const Icon = cfg.icon;
            return (
              <motion.div key={note._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  note.read ? 'bg-white/3 border-white/5 hover:bg-white/5' : `${cfg.bg} ${cfg.border} hover:bg-white/10`
                }`}
                onClick={() => !note.read && markRead(note._id)}>
                <div className={`w-11 h-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-headline font-bold ${note.read ? 'text-white/60' : 'text-white'}`}>{note.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-white/30 font-mono">{relativeTime(note.createdAt)}</span>
                      {!note.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <p className={`text-sm mt-1 leading-relaxed ${note.read ? 'text-white/30' : 'text-white/60'}`}>{note.message}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 inline-block ${cfg.color}`}>{note.type}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
