import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Trophy, Calendar, Target, Zap, Clock, BarChart3 } from 'lucide-react';

const weeklyData = [
  { week: 'Week 1', sessions: 2, avgScore: 58 },
  { week: 'Week 2', sessions: 4, avgScore: 63 },
  { week: 'Week 3', sessions: 3, avgScore: 70 },
  { week: 'Week 4', sessions: 6, avgScore: 68 },
  { week: 'Week 5', sessions: 5, avgScore: 75 },
  { week: 'Week 6', sessions: 7, avgScore: 79 },
  { week: 'Week 7', sessions: 9, avgScore: 82 },
];

const dailyScores = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: Math.floor(55 + Math.random() * 35 + (i / 30) * 15),
}));

const timeDistribution = [
  { name: 'Technical', value: 40, color: '#81ecff' },
  { name: 'HR Round', value: 30, color: '#FFB800' },
  { name: 'Aptitude', value: 20, color: '#a78bfa' },
  { name: 'Practice', value: 10, color: '#34d399' },
];

const leaderboard = [
  { rank: 1, name: 'Arjun Sharma', score: 97, sessions: 82, badge: '🥇' },
  { rank: 2, name: 'Priya Nair', score: 95, sessions: 74, badge: '🥈' },
  { rank: 3, name: 'Karan Singh', score: 93, sessions: 70, badge: '🥉' },
  { rank: 4, name: 'Divya Rao', score: 90, sessions: 65, badge: '⭐' },
  { rank: 5, name: 'Alex Chen', score: 88, sessions: 60, badge: '⭐' },
];

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

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'leaderboard'>('overview');

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-1">Data Dashboard</p>
          <h1 className="text-4xl font-headline font-bold text-white">Analytics</h1>
          <p className="text-white/50 mt-1 font-body">Graphical representation of your performance over time</p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {(['overview', 'progress', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === t ? 'bg-gradient-primary text-black' : 'text-white/40 hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: '36', delta: '+9 this week', icon: Calendar, color: 'text-primary' },
          { label: 'Avg Score', value: '79%', delta: '+12% growth', icon: Target, color: 'text-green-400' },
          { label: 'Practice Hours', value: '28h', delta: 'This month', icon: Clock, color: 'text-secondary' },
          { label: 'Total XP', value: '12,450', delta: 'Level 7', icon: Zap, color: 'text-amber-400' },
        ].map(({ label, value, delta, icon: Icon, color }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
            <Icon className={`${color} w-5 h-5 mb-3`} />
            <p className="text-white font-headline font-bold text-2xl">{value}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-xs text-primary mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{delta}</p>
          </motion.div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Sessions Per Week */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Sessions Per Week</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" name="Sessions" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#81ecff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#81ecff" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Avg Score Per Week Line */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Average Score Per Week</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#FFB800" strokeWidth={2.5}
                    dot={{ fill: '#FFB800', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Time Distribution Pie */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Practice Time Distribution</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie data={timeDistribution} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {timeDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {timeDistribution.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs text-white/60">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">30-Day Score Trend</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={dailyScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={4} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" name="Score" stroke="#81ecff" strokeWidth={2}
                  dot={false} activeDot={{ r: 5, fill: '#FFB800' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Growths */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <h3 className="text-white/40 font-label text-[11px] uppercase tracking-widest mb-6">Skill Growth This Month</h3>
            <div className="space-y-5">
              {[
                { skill: 'Technical', from: 62, to: 78 },
                { skill: 'Behavioral', from: 58, to: 72 },
                { skill: 'Communication', from: 70, to: 82 },
                { skill: 'Confidence', from: 50, to: 69 },
                { skill: 'Problem Solving', from: 75, to: 88 },
              ].map((s, i) => (
                <div key={s.skill} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">{s.skill}</span>
                    <span className="text-green-400 font-bold">+{s.to - s.from} pts</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: `${s.from}%` }} animate={{ width: `${s.to}%` }}
                      transition={{ duration: 1.2, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30">
                    <span>Start: {s.from}%</span><span>Now: {s.to}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-secondary" />
            <h3 className="font-headline font-bold text-white text-xl">Global Leaderboard</h3>
            <span className="ml-auto text-xs text-white/30 font-label">Your rank: <span className="text-primary font-bold">#1,402</span></span>
          </div>
          <div className="space-y-3">
            {leaderboard.map((user, i) => (
              <motion.div key={user.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${i === 0 ? 'bg-secondary/10 border-secondary/30' : 'bg-white/5 border-white/5 hover:bg-white/8'}`}>
                <span className="text-2xl w-8 text-center">{user.badge}</span>
                <span className="w-8 text-center font-headline font-bold text-white/40 text-sm">#{user.rank}</span>
                <div className="flex-1">
                  <p className="font-headline font-bold text-white">{user.name}</p>
                  <p className="text-xs text-white/40">{user.sessions} sessions completed</p>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold text-primary text-xl">{user.score}</p>
                  <p className="text-[10px] text-white/30 uppercase">Score</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
