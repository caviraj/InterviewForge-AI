import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Database, Share2, Code, Brain, 
  Timer, Target, Cpu, ChevronRight, Star,
  Users, Zap
} from 'lucide-react';

const mockCategories = [
  {
    id: 'sde',
    title: 'SDE (Software Development Engineer)',
    registrations: '68,963',
    time: '50 Minutes',
    objective: 5,
    programming: 2,
    icon: Terminal,
    color: 'text-primary',
    bg: 'bg-primary/10',
    popular: false
  },
  {
    id: 'sql',
    title: 'SQL (Database Management)',
    registrations: '16,018',
    time: '30 Minutes',
    objective: 15,
    programming: 0,
    icon: Database,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    popular: false
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    registrations: '11,664',
    time: '30 Minutes',
    objective: 15,
    programming: 0,
    icon: Share2,
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    popular: false
  },
  {
    id: 'python',
    title: 'Python Development',
    registrations: '12,175',
    time: '30 Minutes',
    objective: 5,
    programming: 2,
    icon: Code,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    popular: false
  },
  {
    id: 'dsml',
    title: 'DSML (Data Science & ML)',
    registrations: '9,432',
    time: '30 Minutes',
    objective: 10,
    programming: 0,
    icon: Brain,
    color: 'text-primary-dim',
    bg: 'bg-primary-dim/10',
    popular: true
  }
];

export default function MockInterviews() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label tracking-widest uppercase"
        >
          <Zap className="w-4 h-4" />
          Neural Mock Simulations
        </motion.div>
        <h1 className="text-5xl font-headline font-bold text-white tracking-tight">
          Ready to enter the <span className="text-primary">Interview Forge?</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Select your specialization and begin a high-fidelity interview simulation powered by Sylvia V4.2.
        </p>
      </header>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {mockCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className={`glass-panel rounded-3xl border border-white/5 flex flex-col p-6 relative group overflow-hidden ${cat.popular ? 'ring-2 ring-primary/20' : ''}`}
          >
            {/* Popular Badge */}
            {cat.popular && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 z-10">
                <Star className="w-3 h-3 fill-current" />
                Popular
              </div>
            )}

            {/* Registration Count */}
            <div className="flex items-center gap-1.5 text-[10px] font-label uppercase tracking-widest text-white/40 mb-6">
              <Users className="w-3 h-3" />
              {cat.registrations} Registrations
            </div>

            {/* Icon & Title */}
            <div className="space-y-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform duration-500`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-headline font-bold text-white leading-tight min-h-[3rem]">
                {cat.title}
              </h3>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-white/60">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Time: {cat.time}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Target className="w-4 h-4 text-secondary" />
                <span className="text-xs font-medium">Objective: {cat.objective}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Cpu className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-medium">Programming: {cat.programming}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/interviews/session')}
              className="mt-auto w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center justify-center gap-2 group/btn"
            >
              Attempt Now
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Background Glow */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${cat.bg} blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          </motion.div>
        ))}
      </div>

      {/* Explore More */}
      <div className="text-center pt-8">
        <button className="px-8 py-4 rounded-2xl glass-panel border border-white/10 text-white font-bold hover:bg-white/5 transition-all">
          Explore All Mocks
        </button>
      </div>
    </div>
  );
}
