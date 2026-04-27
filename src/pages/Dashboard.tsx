import React, { useState, useEffect } from 'react';
import { Terminal, Brain, Activity, Sparkles, Play, ArrowRight, Mic, Zap, MessageSquare, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useApi } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authFetch = useApi();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/sessions').then(data => {
      if (Array.isArray(data)) setSessions(data);
    }).finally(() => setLoading(false));
  }, []);

  const stats = user?.stats || { sessions: 0, xp: 0, streak: 0, rank: 9999 };
  const lastSession = sessions[0];
  const timeSinceLast = lastSession ? 'Recent' : 'N/A';
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div>
            <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-2">Systems Online</p>
            <h1 className="text-5xl font-headline font-bold tracking-tight text-white">
              {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Commander Console'}
            </h1>
          </div>
          <button 
            onClick={() => navigate('/interviews/session')}
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 group"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Session
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="flex items-center gap-4 glass-panel ghost-border px-6 py-4 rounded-xl">
          <div className="text-right">
            <p className="text-xs text-on-surface-variant font-label uppercase">Last Simulation</p>
            <p className="text-lg font-bold text-secondary">{loading ? '...' : timeSinceLast}</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10"></div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant font-label uppercase">Global Rank</p>
            <p className="text-lg font-bold text-primary">#{stats.rank || 'N/A'}</p>
          </div>
        </div>
      </header>

      {/* Hero Stats Cards (from Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Terminal, title: 'Technical Core', desc: 'Advanced algorithmic and system design challenges.', color: 'text-primary', border: 'hover:border-primary/30' },
          { icon: Brain, title: 'Behavioral Sync', desc: 'AI-driven soft-skill mapping for leadership values.', color: 'text-secondary', border: 'hover:border-secondary/30' },
          { icon: Activity, title: 'Biometric Insights', desc: 'Real-time analysis of confidence and speech patterns.', color: 'text-tertiary', border: 'hover:border-tertiary/30' },
          { icon: Sparkles, title: 'Adaptive Pathing', desc: 'Personalized roadmap evolving with your data.', color: 'text-primary-dim', border: 'hover:border-primary-dim/30' },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className={`glass-panel p-8 rounded-xl border border-white/5 group ${card.border} transition-all duration-500 hover:shadow-[0_0_40px_rgba(129,236,255,0.05)] cursor-pointer`}
          >
            <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-white/5 transition-colors">
              <card.icon className={`${card.color} w-8 h-8`} />
            </div>
            <h3 className="font-headline text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-on-surface-variant text-sm font-body">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Mic, title: 'Practice Mode', desc: 'Voice-only confidence trainer with real-time feedback',
            path: '/practice', color: 'from-primary/20 to-secondary/10', border: 'border-primary/30', textColor: 'text-primary'
          },
          {
            icon: MessageSquare, title: 'View Feedback', desc: 'Session-based detailed feedback and action items',
            path: '/feedback', color: 'from-green-500/10 to-green-500/5', border: 'border-green-500/20', textColor: 'text-green-400'
          },
          {
            icon: BarChart3, title: 'Analytics', desc: 'Charts and performance graphs over time',
            path: '/analytics', color: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20', textColor: 'text-amber-400'
          },
        ].map((action, i) => (
          <motion.button key={i} onClick={() => navigate(action.path)}
            whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${action.color} border ${action.border} text-left hover:shadow-lg transition-all group`}>
            <div className={`w-12 h-12 rounded-xl ${action.color} border ${action.border} flex items-center justify-center flex-shrink-0`}>
              <action.icon className={`w-6 h-6 ${action.textColor}`} />
            </div>
            <div className="flex-1">
              <p className={`font-headline font-bold ${action.textColor} text-sm`}>{action.title}</p>
              <p className="text-white/40 text-xs mt-0.5">{action.desc}</p>
            </div>
            <ArrowRight className={`w-4 h-4 ${action.textColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
          </motion.button>
        ))}
      </div>

      {/* Bento Grid Layout (from Image 3) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Architect Status */}
        <div className="col-span-12 lg:col-span-4 glass-panel ghost-border rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full"></div>
          <h3 className="text-on-surface-variant font-label text-[0.6875rem] uppercase tracking-widest self-start mb-8">Architect Status</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
              <motion.circle
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 88.46 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary drop-shadow-[0_0_15px_rgba(129,236,255,0.6)]"
                cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeLinecap="round" strokeWidth="12"
              ></motion.circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-headline font-bold text-white">84%</span>
              <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-tighter">Ready for Tier 1</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-on-surface-variant uppercase mb-1">Precision</p>
              <p className="text-md font-bold text-white">92.4%</p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-on-surface-variant uppercase mb-1">Velocity</p>
              <p className="text-md font-bold text-white">78.1%</p>
            </div>
          </div>
        </div>

        {/* Skill Vectors */}
        <div className="col-span-12 lg:col-span-8 glass-panel ghost-border rounded-xl p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-on-surface-variant font-label text-[0.6875rem] uppercase tracking-widest">Skill Vectors</h3>
            <span className="text-primary text-xs font-mono">NEURAL_MAPPING_ACTIVE</span>
          </div>
          <div className="space-y-8">
            {[
              { label: 'System Architecture', value: 88, color: 'from-primary to-secondary' },
              { label: 'Behavioral Intelligence', value: 74, color: 'from-secondary to-tertiary' },
              { label: 'Problem Solving Latency', value: 91, color: 'from-tertiary to-primary' },
              { label: 'Linguistic Fluidity', value: 65, color: 'from-white/20 to-white/10' },
            ].map((skill) => (
              <div key={skill.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-headline text-white/80">{skill.label}</span>
                  <span className={`text-sm font-bold ${skill.label === 'Linguistic Fluidity' ? 'text-white' : 'text-primary'}`}>{skill.value}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${skill.color} shadow-[0_0_12px_rgba(129,236,255,0.4)]`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Timeline */}
        <div className="col-span-12 lg:col-span-7 glass-panel ghost-border rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-on-surface-variant font-label text-[0.6875rem] uppercase tracking-widest">Performance Timeline</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-sm bg-primary"></span>
              <span className="text-[10px] text-white/40 uppercase">Activity Vol.</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[45, 62, 58, 84, 72, 55, 68].map((val, i) => (
              <div key={i} className="w-full flex flex-col items-center group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`w-full rounded-t-lg relative transition-all duration-300 ${i === 3 ? 'bg-primary' : 'bg-surface-container-highest hover:bg-primary/20'}`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-primary text-black px-2 py-1 rounded font-bold">
                    {val}.0
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-white/30 uppercase font-label">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
          </div>
        </div>

        {/* Recent Simulations */}
        <div className="col-span-12 lg:col-span-5 glass-panel ghost-border rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-on-surface-variant font-label text-[0.6875rem] uppercase tracking-widest">Recent Simulations</h3>
            <button 
              onClick={() => navigate('/analytics')}
              className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline"
            >
              View Analytics
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="py-10 flex flex-col items-center gap-3 opacity-20">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-[10px] uppercase font-label">Syncing...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-white/20 uppercase font-bold">No sessions logged</p>
              </div>
            ) : (
              sessions.slice(0, 3).map((session, i) => (
                <motion.div
                  key={session.id}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate('/interviews/report')}
                  className="group p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors border border-white/5 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${i === 0 ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                      {session.type || 'Mock'}
                    </span>
                    <span className="text-white/40 text-[10px]">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-white font-bold group-hover:text-primary transition-colors">
                    Score: {session.score}%
                  </h4>
                  <p className="text-on-surface-variant text-xs mt-1">
                    Language: {session.session_data?.technicalLanguage || 'N/A'}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <footer className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
        {[
          { label: 'Missions', value: stats.sessions || '0' },
          { label: 'XP Points', value: (stats.xp || 0).toLocaleString() },
          { label: 'Streak', value: `${stats.streak || 0} Days` },
        ].map((stat, i) => (
          <div key={i} className="p-6 glass-panel ghost-border rounded-xl">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-headline font-bold text-white">{stat.value}</p>
          </div>
        ))}
        <button 
          onClick={() => navigate('/interviews/session')}
          className="p-6 glass-panel border border-primary/30 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all group flex flex-col justify-center"
        >
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1 font-bold">Neural Link Ready</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-headline font-bold text-white">Start Session</p>
            <Play className="w-6 h-6 text-primary fill-current group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </footer>
    </div>
  );
}
