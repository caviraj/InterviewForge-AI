import React, { useState, useEffect } from 'react';
import { 
  Edit3, TrendingUp, CheckCircle, Terminal, Award, Bolt, Brain, Medal, 
  Shield, CreditCard, Network, Bot, Settings, Bell, Sliders, Globe, 
  Lock, User, Mail, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth, useApi } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const authFetch = useApi();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [sessionCount, setSessionCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/sessions').then(data => {
      if (Array.isArray(data)) {
        setSessionCount(data.length);
        const avg = data.reduce((sum, s) => sum + (s.score || 0), 0) / (data.length || 1);
        setAvgConfidence(Math.round(avg));
      }
    }).finally(() => setLoading(false));
  }, []);

  const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`;


  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row gap-8 items-start md:items-end">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-surface ring-2 ring-primary-dim/30">
            <img
              src={avatarSrc}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-secondary-container text-white rounded-full flex items-center justify-center border border-white/10 hover:scale-110 transition-transform">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-5xl font-headline font-bold tracking-tight text-white">{user?.name || 'Candidate'}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-label tracking-widest rounded-full border border-primary/20">SENIOR DEVELOPER</span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-label tracking-widest rounded-full border border-secondary/20">AI ENTHUSIAST</span>
            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-label tracking-widest rounded-full">EST. 2024</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('settings')}
            className="px-6 py-3 rounded-xl glass-panel border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
          >
            Edit Profile
          </button>
          <button className="px-6 py-3 rounded-xl bg-primary text-black font-bold shadow-[0_0_15px_rgba(129,236,255,0.4)] active:scale-95 transition-transform">
            Share Stats
          </button>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 glass-panel p-6 rounded-xl border border-white/5 space-y-2">
          <p className="text-on-surface-variant text-xs font-label tracking-widest uppercase">Sessions Completed</p>
          <p className="text-4xl font-headline font-bold text-primary">{loading ? '...' : sessionCount}</p>
          <div className="pt-2 flex items-center text-xs text-primary">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12% this month
          </div>
        </div>
        <div className="md:col-span-1 glass-panel p-6 rounded-xl border border-white/5 space-y-2">
          <p className="text-on-surface-variant text-xs font-label tracking-widest uppercase">Avg Confidence</p>
          <p className="text-4xl font-headline font-bold text-secondary">{loading ? '...' : `${avgConfidence}%`}</p>
          <div className="pt-2 flex items-center text-xs text-secondary">
            <CheckCircle className="w-4 h-4 mr-1" />
            Tier: {avgConfidence > 85 ? 'Master' : avgConfidence > 70 ? 'Pro' : 'Apprentice'}
          </div>
        </div>
        <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-white/5 flex items-center justify-between overflow-hidden relative">
          <div className="z-10">
            <p className="text-on-surface-variant text-xs font-label tracking-widest uppercase">Forge IQ Score</p>
            <p className="text-5xl font-headline font-bold text-white mt-1">{loading ? '...' : sessionCount * 12 + 850}</p>
            <p className="text-primary/60 text-sm font-medium mt-2">Top 3% of all candidates</p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
            <Terminal className="w-48 h-48 text-primary" />
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-lg font-label text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(129,236,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 rounded-lg font-label text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'settings' ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(129,236,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Settings & Preferences
        </button>
      </div>

      {/* Main Content Grid */}
      {activeTab === 'overview' ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Confidence Mapping */}
            <div className="glass-panel p-8 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-headline font-bold text-white">Confidence Mapping</h3>
                  <p className="text-on-surface-variant text-sm">Competency breakdown across core dimensions</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_#81ecff]"></span>
                  <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_#ac8aff]"></span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {[
                  { label: 'Technical Knowledge', value: 94, color: 'bg-primary' },
                  { label: 'Behavioral Clarity', value: 78, color: 'bg-secondary' },
                  { label: 'Code Logic & Optimization', value: 91, color: 'bg-primary' },
                  { label: 'System Architecture', value: 85, color: 'bg-secondary' },
                ].map((item) => (
                  <div key={item.label} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-white/80">{item.label}</span>
                      <span className={`${item.color === 'bg-primary' ? 'text-primary' : 'text-secondary'} font-bold`}>{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${item.color} shadow-[0_0_10px_currentColor]`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mini Chart */}
              <div className="mt-12 h-40 w-full relative flex items-end gap-1">
                {[30, 45, 40, 60, 85, 70, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-primary/20 rounded-t-lg border-t border-primary/40"
                  ></motion.div>
                ))}
                <div className="absolute bottom-0 w-full h-px bg-white/10"></div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="space-y-4">
              <h3 className="text-xl font-headline font-bold text-white px-2">Achievement Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Award, title: 'First Blood', desc: 'Completed 1st Mock', color: 'text-primary', border: 'border-primary/20' },
                  { icon: Bolt, title: 'Speed Demon', desc: 'Solved in under 5min', color: 'text-secondary', border: 'border-secondary/20' },
                  { icon: Brain, title: 'Deep Thinker', desc: 'AI Mentor 100% Flow', color: 'text-tertiary', border: 'border-tertiary/20' },
                  { icon: Medal, title: 'Pro Architect', desc: 'Design System Ace', color: 'text-primary', border: 'border-primary/20' },
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center text-center gap-3 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className={`w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border ${badge.border} ${badge.color} group-hover:scale-110 transition-transform`}>
                      <badge.icon className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-bold text-white">{badge.title}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-tighter">{badge.desc}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-8">
            <div className="glass-panel p-8 rounded-xl border border-white/5">
              <h3 className="text-xl font-headline font-bold text-white mb-6">Account Control</h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Security & Privacy', desc: '2FA is enabled', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: CreditCard, title: 'Subscription', desc: 'Forge Pro · Annual Plan', color: 'text-secondary', bg: 'bg-secondary/10' },
                  { icon: Network, title: 'Integrations', desc: 'GitHub, LinkedIn connected', color: 'text-white/60', bg: 'bg-surface-container-highest' },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTab('settings')}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-xs text-white/40">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Next Session Widget */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-panel p-8 rounded-xl border border-white/5 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-xl font-headline font-bold text-white mb-2 z-10 relative">Next Session</h3>
              <p className="text-white/60 text-sm mb-6 z-10 relative">System Design for Scalable Distributed Databases</p>
              <div className="flex items-center gap-4 mb-6 z-10 relative">
                <div className="flex -space-x-2">
                  <img src="https://picsum.photos/seed/mentor/100/100" className="w-8 h-8 rounded-full border-2 border-surface object-cover" alt="Mentor" />
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                </div>
                <span className="text-xs font-label uppercase tracking-widest text-primary">AI MENTOR: SYLVIA</span>
              </div>
              <button className="w-full py-3 rounded-xl border border-primary/40 text-primary font-bold hover:bg-primary hover:text-black transition-all active:scale-95 z-10 relative">
                Resume Prep
              </button>
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Account Settings */}
            <div className="glass-panel p-8 rounded-xl border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-white">Account Settings</h3>
                  <p className="text-on-surface-variant text-sm">Manage your personal identification and access</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name || ''} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-body text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="email" 
                      defaultValue={user?.email || ''} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-body text-sm" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button className="px-6 py-2 bg-primary text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(129,236,255,0.4)] transition-all">
                  Save Changes
                </button>
                <button className="px-6 py-2 bg-white/5 text-white/60 font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="glass-panel p-8 rounded-xl border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-white">Notifications</h3>
                  <p className="text-on-surface-variant text-sm">Control how and when you receive system alerts</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Session Reminders', desc: 'Get notified 15 minutes before your scheduled interview.', enabled: true },
                  { label: 'Performance Reports', desc: 'Weekly summary of your AI coach feedback and progress.', enabled: true },
                  { label: 'Community Updates', desc: 'New challenges and platform feature announcements.', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-white/40 max-w-md">{item.desc}</p>
                    </div>
                    <button className={`w-12 h-6 rounded-full relative transition-all duration-300 ${item.enabled ? 'bg-primary' : 'bg-white/10'}`}>
                      <motion.div 
                        animate={{ x: item.enabled ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Application Preferences */}
            <div className="glass-panel p-8 rounded-xl border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-white">Preferences</h3>
                  <p className="text-on-surface-variant text-sm">Customize your forge experience</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">AI Mentor Voice</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all font-body text-sm appearance-none cursor-pointer">
                    <option className="bg-surface">Sylvia (Default)</option>
                    <option className="bg-surface">Marcus (Professional)</option>
                    <option className="bg-surface">Elena (Casual)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Interface Language</label>
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 group hover:border-white/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="text-sm text-white">English (US)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Lockdown */}
            <div className="glass-panel p-8 rounded-xl border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-white">Security</h3>
                  <p className="text-on-surface-variant text-sm">Lock down your neural profile</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-3 rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  Change Password
                </button>
                <button className="w-full py-3 rounded-xl border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  Enable 2FA
                </button>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">Active Sessions</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-white/60">Current Terminal (SF, CA)</span>
                  </div>
                  <button className="text-primary hover:underline">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
