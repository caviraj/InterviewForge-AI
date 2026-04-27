import React from 'react';
import { motion } from 'motion/react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Target, Lightbulb, Award, ArrowUpRight, Brain, Sparkles, Zap } from 'lucide-react';

const radarData = [
  { subject: 'Technical', score: 78 },
  { subject: 'Behavioral', score: 72 },
  { subject: 'Communication', score: 82 },
  { subject: 'Confidence', score: 69 },
  { subject: 'Speed', score: 85 },
  { subject: 'Problem Solving', score: 88 },
];

const trendData = [
  { date: 'Week 1', score: 58, practice: 3 },
  { date: 'Week 2', score: 63, practice: 5 },
  { date: 'Week 3', score: 70, practice: 4 },
  { date: 'Week 4', score: 68, practice: 6 },
  { date: 'Week 5', score: 75, practice: 7 },
  { date: 'Week 6', score: 79, practice: 8 },
  { date: 'Week 7', score: 82, practice: 9 },
];

const improvements = [
  { area: 'Confidence Under Pressure', current: 69, target: 85, priority: 'high',
    actions: ['Practice 10 min daily voice sessions', 'Use the Practice Mode mic trainer', 'Record and review 3 answers per week'] },
  { area: 'Behavioral Storytelling', current: 72, target: 88, priority: 'high',
    actions: ['Master the STAR framework', 'Prepare 5 STAR stories from your experience', 'Practice aloud with a timer'] },
  { area: 'Technical Depth', current: 78, target: 90, priority: 'medium',
    actions: ['Study system design patterns', 'Solve 3 LeetCode medium questions daily', 'Review data structures weekly'] },
  { area: 'Communication Clarity', current: 82, target: 92, priority: 'low',
    actions: ['Eliminate filler words (um, uh)', 'Practice structured 2-minute answers', 'Join a speaking group'] },
];

const priorityConfig = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'High Priority' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Medium Priority' },
  low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Low Priority' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-sm font-bold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Insights() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-1">Performance Analysis</p>
            <h1 className="text-4xl font-headline font-bold text-white">Insights</h1>
            <p className="text-white/50 mt-1 font-body">Visual breakdown of your performance and personalized improvement roadmap</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Award className="w-4 h-4" />
            Export Insights
          </button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Score', value: '79%', delta: '+12%', icon: Award, color: 'text-primary' },
          { label: 'Best Skill', value: 'Problem Solving', delta: '88/100', icon: Target, color: 'text-green-400' },
          { label: 'Improvement', value: 'Confidence', delta: '↑ Focus', icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Sessions', value: '14', delta: 'This month', icon: Lightbulb, color: 'text-secondary' },
        ].map(({ label, value, delta, icon: Icon, color }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
            <Icon className={`${color} w-6 h-6 mb-3`} />
            <p className="text-white font-headline font-bold text-xl">{value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-xs text-primary mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{delta}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Skill Radar — Current Session</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={100}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Radar name="Score" dataKey="score" stroke="#81ecff" fill="#81ecff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Score Progression — Last 7 Weeks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" name="Score" stroke="#81ecff" strokeWidth={2.5}
                dot={{ fill: '#81ecff', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#FFB800' }} />
              <Line type="monotone" dataKey="practice" name="Sessions" stroke="#FFB800" strokeWidth={1.5}
                strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Score Visual */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10">
        <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-8">Skill Vector Breakdown</h3>
        <div className="space-y-5">
          {radarData.map((skill, i) => (
            <div key={skill.subject}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-headline text-white/80">{skill.subject}</span>
                <span className="text-sm font-bold text-primary">{skill.score}%</span>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div initial={{ width: 0 }} animate={{ width: `${skill.score}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(129,236,255,0.3)]" />
                <div className="absolute top-0 right-0 h-full bg-white/3 rounded-full" style={{ width: `${100 - skill.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Certificate / Image Section */}
      <div className="glass-panel rounded-3xl p-10 border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-20 -mb-20 transition-all duration-1000" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-12 z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              AI Performance Asset Generated
            </div>
            <h2 className="text-4xl font-headline font-bold text-white leading-tight">Your Neural Performance <span className="text-primary tracking-tighter italic">Signature</span></h2>
            <p className="text-white/50 leading-relaxed max-w-xl">
              Our AI has analyzed your 14 sessions this month to forge a unique performance signature. This visualization represents your cognitive speed, technical depth, and linguistic confidence.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button className="px-6 py-3 rounded-xl glass-panel border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all">
                View Signature Asset
              </button>
              <button className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-all">
                Download PDF
              </button>
            </div>
          </div>
          
          {/* Stylized Visual Representation (mimics the generated image) */}
          <div className="w-full max-w-[320px] aspect-[4/5] glass-panel rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-40" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            
            <div className="relative h-full flex flex-col justify-between border border-white/5 p-4 rounded-xl bg-black/40 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-white/30 uppercase tracking-[0.3em]">Validation</p>
                  <p className="text-[10px] text-primary font-bold">V-2.4 ACTIVE</p>
                </div>
              </div>
              
              <div className="space-y-4 py-8">
                <div className="space-y-1">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest text-center">Neural Confidence</p>
                  <p className="text-4xl font-headline font-bold text-white text-center">79.2<span className="text-primary text-xl">%</span></p>
                </div>
                {/* Abstract Bar Visuals */}
                <div className="flex justify-center gap-1 items-end h-16">
                  {[20, 45, 60, 35, 90, 75, 50, 65].map((h, i) => (
                    <div key={i} className="w-2 rounded-full bg-primary/30" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-white/80">ALEX VANGUARD</p>
                  <p className="text-[8px] text-white/30 uppercase tracking-[0.2em]">CANDIDATE SIG</p>
                </div>
                <div className="w-12 h-12 border border-primary/20 rounded flex items-center justify-center">
                   <Zap className="w-6 h-6 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Roadmap */}
      <div className="space-y-4 pb-12">
        <h2 className="text-xl font-headline font-bold text-white">Personalized Improvement Plan</h2>
        {improvements.map((item, i) => {
          const cfg = priorityConfig[item.priority as keyof typeof priorityConfig];
          const gap = item.target - item.current;
          return (
            <motion.div key={item.area} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-panel rounded-2xl p-6 border ${cfg.border} ${cfg.bg} transition-all hover:bg-white/5`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-headline font-bold text-white text-lg">{item.area}</h4>
                  <span className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-xl">{item.current}<span className="text-white/30 text-sm"> → {item.target}</span></p>
                  <p className={`text-xs font-bold ${cfg.color}`}>+{gap} points gap</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4 relative">
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.current}%` }} transition={{ duration: 1 }}
                  className={`h-full rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                <div className="absolute top-0 h-full w-px bg-white/30" style={{ left: `${item.target}%` }} />
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {item.actions.map((action, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-primary">→</span> {action}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
