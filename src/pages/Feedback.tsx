import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Star, Brain, Zap, Clock, BarChart3 } from 'lucide-react';
import { useApi } from '../context/AuthContext';

interface FeedbackItem {
  aspect: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work';
  feedback: string;
  tips: string[];
}

const defaultFeedback: FeedbackItem[] = [
  {
    aspect: 'Communication Clarity',
    score: 82,
    status: 'good',
    feedback: 'Your responses were clear and well-structured. Technical terminology was used appropriately.',
    tips: ['Use more concrete examples in your answers', 'Vary your sentence length for better engagement']
  },
  {
    aspect: 'Technical Accuracy',
    score: 74,
    status: 'good',
    feedback: 'Good understanding of fundamental concepts demonstrated. Some gaps in advanced topics.',
    tips: ['Review dynamic programming patterns', 'Practice system design whiteboarding']
  },
  {
    aspect: 'Confidence & Delivery',
    score: 68,
    status: 'needs-work',
    feedback: 'Voice confidence varied throughout the session. Some hesitations detected.',
    tips: ['Practice the STAR method for behavioral questions', 'Record yourself and review for filler words']
  },
  {
    aspect: 'Problem-Solving Approach',
    score: 89,
    status: 'excellent',
    feedback: 'Excellent methodical thinking! You consistently broke problems down into manageable steps.',
    tips: ['Continue verbalizing your thought process', 'Consider edge cases proactively']
  },
  {
    aspect: 'Behavioral Responses',
    score: 71,
    status: 'good',
    feedback: 'Behavioral answers showed empathy and leadership potential. More STAR structure needed.',
    tips: ['Lead with the Situation and Task', 'Quantify your impact wherever possible']
  }
];

const statusConfig = {
  excellent: { color: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/30', icon: CheckCircle },
  good: { color: 'text-primary', bg: 'bg-primary', border: 'border-primary/30', icon: Star },
  'needs-work': { color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', icon: AlertTriangle }
};

export default function Feedback() {
  const authFetch = useApi();
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [feedback] = useState<FeedbackItem[]>(defaultFeedback);

  useEffect(() => {
    // Load last session from localStorage
    const local = localStorage.getItem('last_session_data');
    if (local) {
      const parsed = JSON.parse(local);
      setSessionData(parsed);
      // Simulate mapping real confidence score to aspects
      const baseScore = parsed.overallScore || parsed.score || 75;
      const adaptiveFeedback = defaultFeedback.map(f => ({
        ...f,
        score: Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 15)),
        status: (baseScore > 85 ? 'excellent' : baseScore > 70 ? 'good' : 'needs-work') as any
      }));
      setFeedbackData(adaptiveFeedback);
    } else {
      setFeedbackData(defaultFeedback);
    }

    // Load from API
    authFetch('/api/sessions').then(data => {
      if (Array.isArray(data)) setSessions(data);
    }).catch(() => {});
  }, []);

  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>(defaultFeedback);
  const currentOverallScore = Math.round(feedbackData.reduce((sum, f) => sum + f.score, 0) / feedbackData.length);

  const improvements = feedback
    .filter(f => f.status === 'needs-work' || f.status === 'good')
    .flatMap(f => f.tips)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-1">Session Analysis</p>
          <h1 className="text-4xl font-headline font-bold text-white">Interview Feedback</h1>
          <p className="text-white/50 mt-1 font-body">Based on your most recent session performance</p>
        </div>
        {sessionData && (
          <div className="glass-panel px-5 py-3 rounded-xl flex items-center gap-3 border border-white/10">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/60 font-label">
              Time Used: <span className="text-white font-bold">{Math.floor((sessionData.totalTimeUsed || 0) / 60)}m {(sessionData.totalTimeUsed || 0) % 60}s</span>
            </span>
          </div>
        )}
      </div>

      {/* Overall Score Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Circular Score */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle cx="70" cy="70" r="60" fill="transparent" stroke="url(#scoreGrad)"
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - currentOverallScore / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#81ecff" />
                  <stop offset="100%" stopColor="#FFB800" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-headline font-bold text-white">{currentOverallScore}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Score</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-headline font-bold text-white mb-1">
                {currentOverallScore >= 85 ? 'Outstanding Performance! 🎉' : currentOverallScore >= 70 ? 'Good Progress! 🌟' : 'Keep Practicing! 💪'}
              </h2>
              <p className="text-white/60 font-body">
                {currentOverallScore >= 85
                   ? 'You are well-prepared for technical interviews. Focus on polishing edge cases and refining delivery.'
                   : currentOverallScore >= 70
                   ? 'Solid foundation shown. Work on confidence delivery and deepen your technical knowledge.'
                   : 'Great commitment to improvement! Focus on structured responses and daily practice.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Answered', value: sessionData?.questionsAnswered ? `${sessionData.questionsAnswered}/10` : '8/10', icon: MessageSquare },
                { label: 'Avg Score', value: `${currentOverallScore}%`, icon: BarChart3 },
                { label: 'XP Earned', value: '+320', icon: Zap },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-headline font-bold text-white">{value}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confidence Timeline */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10">
        <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Confidence Timeline</h3>
        <div className="flex items-end gap-2 h-32">
          {[72, 65, 78, 82, 74, 86, 79, 83, 88, 75].map((v, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${v}%` }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="flex-1 rounded-t-lg relative group cursor-pointer"
              style={{ background: v >= 80 ? 'rgba(129,236,255,0.7)' : v >= 70 ? 'rgba(129,236,255,0.4)' : 'rgba(255,184,0,0.4)' }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] bg-black/80 text-primary px-2 py-1 rounded font-bold whitespace-nowrap">
                Q{i + 1}: {v}%
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="text-[10px] text-white/20 font-mono">Q{i + 1}</span>
          ))}
        </div>
      </div>

      {/* Detailed Feedback Cards */}
      <div className="space-y-4">
        <h3 className="text-white font-headline font-bold text-xl">Detailed Breakdown</h3>
        {feedbackData.map((item, i) => {
          const cfg = statusConfig[item.status];
          const StatusIcon = cfg.icon;
          return (
            <motion.div key={item.aspect} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-panel rounded-2xl p-6 border ${cfg.border} transition-all hover:bg-white/5`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg}/20 flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-white">{item.aspect}</h4>
                    <p className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
                      {item.status === 'needs-work' ? 'Needs Work' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-2xl font-headline font-bold ${cfg.color}`}>{item.score}</span>
                  <span className="text-white/30 text-sm">/100</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full rounded-full ${cfg.bg}`} />
              </div>
              <p className="text-white/60 text-sm mb-3">{item.feedback}</p>
              <div className="space-y-1.5">
                {item.tips.map((tip, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-white/40">
                    <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Improvements */}
      <div className="glass-panel rounded-3xl p-8 border border-secondary/20 bg-secondary/5">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-secondary" />
          <h3 className="font-headline font-bold text-white text-xl">Top Action Items</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {improvements.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <p className="text-sm text-white/70">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
