import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, CheckCircle, AlertCircle, 
  Brain, Zap, MessageSquare, Download, Share2,
  ArrowLeft, Award, Star, Target, Mic, Activity,
  Volume2, Timer, Code, UserCheck, ShieldAlert, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { useInterviewService, SessionData } from '../services/interviewService';

export default function InterviewReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { generateReport, saveSession } = useInterviewService();

  useEffect(() => {
    const fetchReport = async () => {
      const savedData = localStorage.getItem('last_session_data');
      if (!savedData) {
        setLoading(false);
        return;
      }

      try {
        const data: SessionData = JSON.parse(savedData);
        // 1. Generate report via backend
        const aiReport = await generateReport(data);
        if (aiReport.error) throw new Error(aiReport.error);
        setReport(aiReport);

        // 2. Persist session to Supabase
        await saveSession(data, aiReport);
        
        // 3. Clear local storage
        localStorage.removeItem('last_session_data');
      } catch (error) {
        console.error("Failed to process interview report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [generateReport, saveSession]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-[60vh]">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 animate-ping absolute inset-0"></div>
          <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin relative flex items-center justify-center">
            <Zap className="w-12 h-12 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-headline font-bold text-white">Synthesizing Neural Report</h2>
          <p className="text-on-surface-variant animate-pulse">Sylvia is analyzing your performance vectors...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-white">No Session Data Found</h2>
        <p className="text-on-surface-variant">Complete an interview session to generate your performance synthesis.</p>
        <button 
          onClick={() => navigate('/interviews/session')}
          className="px-8 py-3 rounded-xl bg-primary text-black font-bold"
        >
          Start New Session
        </button>
      </div>
    );
  }

  const metrics = [
    { label: 'Technical Accuracy', value: report.metrics.technicalAccuracy, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Problem Solving', value: report.metrics.problemSolving, icon: Brain, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Communication', value: report.metrics.communication, icon: MessageSquare, color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { label: 'Aptitude Score', value: report.metrics.aptitudeScore, icon: Target, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  const pitchData = [
    { time: '0s', pitch: 110 },
    { time: '10s', pitch: 125 },
    { time: '20s', pitch: 115 },
    { time: '30s', pitch: 140 },
    { time: '40s', pitch: 130 },
    { time: '50s', pitch: 145 },
    { time: '60s', pitch: 135 },
  ];

  const toneData = [
    { subject: 'Confidence', A: 85, fullMark: 100 },
    { subject: 'Empathy', A: 65, fullMark: 100 },
    { subject: 'Clarity', A: 90, fullMark: 100 },
    { subject: 'Energy', A: 75, fullMark: 100 },
    { subject: 'Authority', A: 80, fullMark: 100 },
  ];

  const stagePerformance = [
    { 
      id: 'aptitude', 
      label: 'Aptitude Forge', 
      score: report.stageAnalysis.aptitude.score, 
      icon: Zap, 
      color: 'text-primary',
      details: report.stageAnalysis.aptitude.details,
      strengths: report.stageAnalysis.aptitude.strengths,
      improvements: report.stageAnalysis.aptitude.improvements
    },
    { 
      id: 'technical', 
      label: 'Technical Terminal', 
      score: report.stageAnalysis.technical.score, 
      icon: Code, 
      color: 'text-secondary',
      details: report.stageAnalysis.technical.details,
      strengths: report.stageAnalysis.technical.strengths,
      improvements: report.stageAnalysis.technical.improvements
    },
    { 
      id: 'hr', 
      label: 'HR Synthesis', 
      score: report.stageAnalysis.hr.score, 
      icon: UserCheck, 
      color: 'text-green-400',
      details: report.stageAnalysis.hr.details,
      strengths: report.stageAnalysis.hr.strengths,
      improvements: report.stageAnalysis.hr.improvements
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors text-xs font-label uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="space-y-2">
            <h1 className="text-5xl font-headline font-bold text-white tracking-tight">Session Synthesis</h1>
            <p className="text-on-surface-variant">Comprehensive performance analysis for Session #8429</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl glass-panel border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="px-6 py-3 rounded-xl bg-primary text-black font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Report
          </button>
        </div>
      </header>

      {/* Main Score Hero */}
      <section className="glass-panel p-12 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label tracking-widest uppercase">
              <Award className="w-4 h-4" />
              Elite Performance Tier
            </div>
            <h2 className="text-6xl font-headline font-bold text-white leading-tight">
              Forge IQ Score: <span className="text-primary">{report.forgeIqScore.toLocaleString()}</span>
            </h2>
            <p className="text-xl text-white/60 leading-relaxed max-w-lg">
              {report.neuralFeedback.technicalStrength}
            </p>
            <div className="flex gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Global Percentile</p>
                <p className="text-3xl font-headline font-bold text-white">{report.percentile}</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Confidence Delta</p>
                <p className="text-3xl font-headline font-bold text-secondary">{report.confidenceDelta}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={753}
                  initial={{ strokeDashoffset: 753 }}
                  animate={{ strokeDashoffset: 753 - (753 * (report.masteryPercentage / 100)) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-primary shadow-[0_0_20px_rgba(129,236,255,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-headline font-bold text-white">{report.masteryPercentage}%</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-label">Mastery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 group hover:bg-white/10 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center ${m.color} group-hover:scale-110 transition-transform`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">{m.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-headline font-bold text-white">{m.value}%</p>
                <TrendingUp className="w-5 h-5 text-green-400 mb-1" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.value}%` }}
                className={`h-full bg-current ${m.color}`}
              />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Stage Performance Breakdown */}
      <section className="space-y-6">
        <h3 className="text-2xl font-headline font-bold text-white px-2">Stage Performance Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stagePerformance.map((stage) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stage.color}`}>
                  <stage.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Stage Score</p>
                  <p className={`text-2xl font-headline font-bold ${stage.color}`}>{stage.score}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">{stage.label}</h4>
                <p className="text-sm text-white/60 leading-relaxed">{stage.details}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5 mt-auto">
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Key Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {stage.strengths.map(s => (
                      <span key={s} className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Growth Vectors</p>
                  <div className="flex flex-wrap gap-2">
                    {stage.improvements.map(i => (
                      <span key={i} className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider border border-secondary/20">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Acoustic Signature Analysis */}
      <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold text-white">Acoustic Signature Analysis</h3>
              <p className="text-on-surface-variant text-sm">Neural voice patterns and biometric vocal mapping</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-label uppercase tracking-widest text-white/60">
            Vocal Clarity: High
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pitch Variation Chart */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Pitch Variation (Hz)
              </h4>
              <span className="text-xs text-primary font-mono">Avg: 128Hz</span>
            </div>
            <div className="h-64 w-full glass-panel rounded-2xl border border-white/5 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pitchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#ffffff40" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#131313', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#81ecff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pitch" 
                    stroke="#81ecff" 
                    strokeWidth={3} 
                    dot={{ fill: '#81ecff', r: 4 }}
                    activeDot={{ r: 6, stroke: '#81ecff', strokeWidth: 2, fill: '#000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-white/40 leading-relaxed px-2">
              Your pitch modulation shows high engagement. The spikes at 30s and 50s correlate with key technical explanations, indicating strong conviction.
            </p>
          </div>

          {/* Tone Radar Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-secondary" />
                Vocal Tone Mapping
              </h4>
            </div>
            <div className="h-64 w-full glass-panel rounded-2xl border border-white/5 p-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={toneData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" stroke="#ffffff40" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" tick={false} />
                  <Radar
                    name="Tone"
                    dataKey="A"
                    stroke="#ac8aff"
                    fill="#ac8aff"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white/60">Speaking Rate</span>
                </div>
                <span className="text-xs font-bold text-white">145 WPM</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-[85%] shadow-[0_0_8px_#4ade80]" />
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest text-center">Optimal Range: 130-160 WPM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-8">
            <h3 className="text-2xl font-headline font-bold text-white">Neural Feedback Loop</h3>
            
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-widest">Technical Strength</h4>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {report.neuralFeedback.technicalStrength}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-secondary">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-widest">Growth Vector</h4>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {report.neuralFeedback.growthVector}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-xl font-headline font-bold text-white">Next Evolution</h3>
            <div className="space-y-4">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-lg ${i % 2 === 0 ? 'bg-primary/10 text-primary group-hover:bg-primary' : 'bg-secondary/10 text-secondary group-hover:bg-secondary'} flex items-center justify-center group-hover:text-black transition-all`}>
                    {i % 2 === 0 ? <Zap className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{rec.title}</p>
                    <p className="text-xs text-white/40">{rec.type} · {rec.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
              View All Recommendations
            </button>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center text-black shadow-lg shadow-primary/20">
              <Star className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-headline font-bold text-white">New Badge Unlocked</h4>
              <p className="text-sm text-white/60">"The Architect" - Mastered System Design Stage</p>
            </div>
            <button className="w-full py-3 rounded-xl bg-primary text-black font-bold">
              Claim Achievement
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
