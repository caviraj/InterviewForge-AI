import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Palette, Info, Shield, Bell, Moon, Sun, Save, ChevronRight, Camera, Briefcase, Globe, Volume2 } from 'lucide-react';
import { useAuth, useApi } from '../context/AuthContext';

const tabs = [
  { id: 'profile', label: 'Profile & Preferences', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'about', label: 'About & License', icon: Info },
];

const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UX Designer'];
const experiences = ['Student', 'Junior (0–2 yrs)', 'Mid-Level (2–5 yrs)', 'Senior (5–10 yrs)', 'Lead / Architect (10+ yrs)'];
const notifTypes = ['Session reminders', 'Achievement alerts', 'Daily tips', 'Weekly reports', 'New content alerts'];
const accentColors = [
  { name: 'Cyan', value: '#81ecff' },
  { name: 'Amber', value: '#FFB800' },
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Green', value: '#34d399' },
  { name: 'Rose', value: '#f87171' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const authFetch = useApi();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState('Software Engineer');
  const [experience, setExperience] = useState('Junior (0–2 yrs)');
  const [enabledNotifs, setEnabledNotifs] = useState<string[]>(['Session reminders', 'Achievement alerts', 'Daily tips']);

  // Appearance state
  const [darkMode, setDarkMode] = useState(true);
  const [accent, setAccent] = useState('#81ecff');
  const [fontSize, setFontSize] = useState('medium');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('forge_settings');
    if (saved) {
      const s = JSON.parse(saved);
      setRole(s.role || 'Software Engineer');
      setExperience(s.experience || 'Junior (0–2 yrs)');
      setAccent(s.accent || '#81ecff');
      setFontSize(s.fontSize || 'medium');
      setDarkMode(s.darkMode !== false);
      setVoiceEnabled(s.voiceEnabled !== false);
      setEnabledNotifs(s.enabledNotifs || ['Session reminders', 'Achievement alerts', 'Daily tips']);
    }
  }, []);

  const saveSettings = async () => {
    const settings = { role, experience, accent, fontSize, darkMode, voiceEnabled, enabledNotifs };
    localStorage.setItem('forge_settings', JSON.stringify(settings));
    authFetch('/api/user/profile', { method: 'PUT', body: JSON.stringify({ name, role, experience }) }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleNotif = (notif: string) => {
    setEnabledNotifs(prev => prev.includes(notif) ? prev.filter(n => n !== notif) : [...prev, notif]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-1">Configuration</p>
        <h1 className="text-4xl font-headline font-bold text-white">Settings</h1>
      </div>

      {/* Save Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-green-500/90 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-2xl">
            <Save className="w-4 h-4" /> Settings saved!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="glass-panel rounded-2xl p-3 border border-white/10 h-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-l-4 border-primary'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          <div className="mt-4 pt-4 border-t border-white/5">
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
              <Shield className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Avatar */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-4">Profile</h3>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative">
                      <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                        alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30" />
                      <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5 text-black" />
                      </button>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-white text-lg">{user?.name || name}</p>
                      <p className="text-white/40 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-label uppercase tracking-widest text-white/40 mb-2 block">Display Name</label>
                      <input value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary text-white px-4 py-3 rounded-xl outline-none text-sm transition-all" />
                    </div>
                  </div>
                </div>

                {/* Job Preferences */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Job Preferences
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-label uppercase tracking-widest text-white/40 mb-2 block">Target Role</label>
                      <select value={role} onChange={e => setRole(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary text-white px-4 py-3 rounded-xl outline-none text-sm transition-all">
                        {roles.map(r => <option key={r} value={r} className="bg-[#111]">{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-label uppercase tracking-widest text-white/40 mb-2 block">Experience Level</label>
                      <select value={experience} onChange={e => setExperience(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary text-white px-4 py-3 rounded-xl outline-none text-sm transition-all">
                        {experiences.map(e => <option key={e} value={e} className="bg-[#111]">{e}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-secondary" /> Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    {notifTypes.map(notif => (
                      <div key={notif} className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-sm text-white/70">{notif}</span>
                        <button onClick={() => toggleNotif(notif)}
                          className={`w-12 h-6 rounded-full transition-all relative ${enabledNotifs.includes(notif) ? 'bg-primary' : 'bg-white/10'}`}>
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${enabledNotifs.includes(notif) ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-6">Appearance</h3>
                  {/* Dark/Light */}
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold text-white text-sm">Dark Mode</p>
                        <p className="text-xs text-white/40">Toggle between dark and light interface</p>
                      </div>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)}
                      className={`w-14 h-7 rounded-full transition-all relative ${darkMode ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all absolute top-0.5 ${darkMode ? 'left-7 bg-black' : 'left-0.5 bg-white'}`}>
                        {darkMode ? <Moon className="w-3 h-3 text-primary" /> : <Sun className="w-3 h-3 text-amber-500" />}
                      </div>
                    </button>
                  </div>
                  {/* Voice */}
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-bold text-white text-sm">TTS Voice</p>
                        <p className="text-xs text-white/40">AI reads questions aloud in practice mode</p>
                      </div>
                    </div>
                    <button onClick={() => setVoiceEnabled(!voiceEnabled)}
                      className={`w-14 h-7 rounded-full transition-all relative ${voiceEnabled ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-all ${voiceEnabled ? 'left-7' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {/* Accent Color */}
                  <div className="py-4 border-b border-white/5">
                    <p className="font-bold text-white text-sm mb-1">Accent Color</p>
                    <p className="text-xs text-white/40 mb-4">Customize the primary highlight color</p>
                    <div className="flex gap-3">
                      {accentColors.map(c => (
                        <button key={c.name} onClick={() => setAccent(c.value)} title={c.name}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${accent === c.value ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
                          style={{ background: c.value }} />
                      ))}
                    </div>
                  </div>
                  {/* Font Size */}
                  <div className="py-4">
                    <p className="font-bold text-white text-sm mb-1">Text Size</p>
                    <div className="flex gap-2 mt-3">
                      {['small', 'medium', 'large'].map(s => (
                        <button key={s} onClick={() => setFontSize(s)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                            fontSize === s ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-white/40'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <Globe className="w-10 h-10 text-black" />
                  </div>
                  <h2 className="text-3xl font-headline font-bold text-white mb-2">Interview Forge AI</h2>
                  <p className="text-primary text-sm font-label uppercase tracking-widest mb-4">Version 2.4.0 — Stable</p>
                  <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">
                    An AI-powered interview preparation platform that helps you practice, improve, and succeed in technical and behavioral interviews using advanced voice recognition and real-time feedback.
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> License
                  </h3>
                  <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                    <p className="text-primary font-bold text-sm mb-2">Apache License 2.0</p>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. You may obtain a copy of the License at
                      <span className="text-primary"> http://www.apache.org/licenses/LICENSE-2.0</span>.
                      Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
                    </p>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h3 className="font-headline font-bold text-white mb-4">Tech Stack & Acknowledgments</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Frontend', 'React 19 + TypeScript'],
                      ['Build Tool', 'Vite 6'],
                      ['Styling', 'Tailwind CSS v4'],
                      ['Database', 'MongoDB Atlas'],
                      ['AI Integration', 'Google Gemini API'],
                      ['Charts', 'Recharts'],
                      ['Animations', 'Motion (Framer)'],
                      ['Voice', 'Web Speech API'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/5">
                        <span className="text-white/40 text-xs">{k}</span>
                        <span className="text-white font-bold text-xs">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab !== 'about' && (
            <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={saveSettings}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-primary text-black font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
