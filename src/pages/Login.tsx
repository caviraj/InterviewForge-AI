import React, { useState } from 'react';
import { AtSign, Lock, Terminal, Brain, BarChart3, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, oauthLogin, error, clearError, loading } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Sign In state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(siEmail, siPassword);
      showToast('success', 'Welcome back!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      showToast('error', err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await register(regName, regEmail, regPassword);
      showToast('success', 'Account created successfully!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      showToast('error', err.message || 'Registration failed');
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await oauthLogin(provider);
    } catch (err: any) {
      showToast('error', err.message || `${provider} login failed`);
    }
  };



  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -bottom-32 -right-32 pointer-events-none" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm ${
              toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full max-w-[1200px] grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Hero */}
        <div className="hidden md:flex flex-col space-y-8 pr-12">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-label tracking-widest uppercase font-bold">
              Platform V2.4 Active
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-6xl font-headline font-bold leading-tight tracking-tight">
              Forge Your <span className="text-gradient">Career</span> Future.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-lg max-w-md font-body leading-relaxed">
              Harness the power of high-fidelity AI simulations to master technical interviews and executive-level behavioral assessments.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { Icon: Brain, title: 'AI Mentorship', desc: 'Real-time feedback loop based on industry-standard rubrics.', color: 'text-primary' },
              { Icon: BarChart3, title: 'Data Insights', desc: 'Granular analysis of your verbal and technical performance.', color: 'text-secondary' },
              { Icon: User, title: 'Voice Practice', desc: 'Mic-only practice mode with confidence tracking.', color: 'text-tertiary' },
              { Icon: Terminal, title: 'Smart Feedback', desc: 'Session-based actionable feedback after every round.', color: 'text-primary-dim' },
            ].map(({ Icon, title, desc, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-panel p-6 rounded-xl space-y-2 group hover:border-white/20 transition-all">
                <Icon className={`${color} w-8 h-8`} />
                <h3 className="font-headline font-semibold text-white">{title}</h3>
                <p className="text-xs text-on-surface-variant">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex flex-col items-center">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass-panel w-full max-w-md p-8 md:p-10 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <Terminal className="text-black w-10 h-10" />
              </div>
              <h2 className="text-3xl font-headline font-bold text-white mb-1">Interview Forge AI</h2>
              <p className="text-on-surface-variant text-sm font-body">Your AI-powered career launchpad</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-8">
              {(['signin', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); clearError(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    tab === t ? 'bg-gradient-primary text-black shadow-lg' : 'text-white/40 hover:text-white'
                  }`}>
                  {t === 'signin' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'signin' ? (
                <motion.form key="signin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-5" onSubmit={handleSignIn}>
                  <div className="space-y-1">
                    <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                    <div className="relative group">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                      <input value={siEmail} onChange={e => setSiEmail(e.target.value)} required type="email"
                        className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white placeholder:text-white/20 text-sm py-3.5 pl-11 pr-4 rounded-xl transition-all outline-none"
                        placeholder="name@company.com" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">Password</label>
                      <Link className="text-[10px] font-label uppercase tracking-widest text-primary hover:underline" to="/forgot-password">Forgot?</Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                      <input value={siPassword} onChange={e => setSiPassword(e.target.value)} required type={showPassword ? 'text' : 'password'}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white placeholder:text-white/20 text-sm py-3.5 pl-11 pr-11 rounded-xl transition-all outline-none"
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="remember" type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary" />
                    <label htmlFor="remember" className="text-xs text-white/40 font-body">Remember me for 30 days</label>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-primary text-black font-bold text-sm tracking-wide shadow-lg shadow-primary/20 disabled:opacity-60 transition-all">
                    {loading ? 'Signing In...' : 'SIGN IN'}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="space-y-4" onSubmit={handleRegister}>
                  {[
                    { label: 'Full Name', val: regName, set: setRegName, type: 'text', ph: 'John Doe', icon: User },
                    { label: 'Email', val: regEmail, set: setRegEmail, type: 'email', ph: 'john@company.com', icon: AtSign },
                    { label: 'Password', val: regPassword, set: setRegPassword, type: 'password', ph: '••••••••', icon: Lock },
                    { label: 'Confirm Password', val: regConfirm, set: setRegConfirm, type: 'password', ph: '••••••••', icon: Lock },
                  ].map(({ label, val, set, type, ph, icon: Icon }) => (
                    <div key={label} className="space-y-1">
                      <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant ml-1">{label}</label>
                      <div className="relative group">
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input value={val} onChange={e => (set as any)(e.target.value)} required type={type}
                          className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white placeholder:text-white/20 text-sm py-3 pl-11 pr-4 rounded-xl transition-all outline-none"
                          placeholder={ph} />
                      </div>
                    </div>
                  ))}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-primary text-black font-bold text-sm tracking-wide shadow-lg shadow-primary/20 disabled:opacity-60 transition-all mt-2">
                    {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* OAuth Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0e0e0e] px-4 text-white/30 font-label tracking-widest">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleOAuth('google')} type="button"
                className="flex items-center justify-center gap-2 glass-panel py-3 px-4 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleOAuth('github')} type="button"
                className="flex items-center justify-center gap-2 glass-panel py-3 px-4 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20">
                <img src="https://github.com/favicon.ico" className="w-4 h-4 invert" alt="GitHub" />
                GitHub
              </motion.button>
            </div>


            <p className="mt-6 text-center text-xs text-white/30 font-body">
              {tab === 'signin' ? (
                <>New to the forge? <button onClick={() => setTab('register')} className="text-secondary font-bold hover:underline">Create Account</button></>
              ) : (
                <>Already have an account? <button onClick={() => setTab('signin')} className="text-primary font-bold hover:underline">Sign In</button></>
              )}
            </p>
          </motion.div>
        </div>
      </main>

      <footer className="fixed bottom-8 left-0 w-full px-8 flex justify-between items-center pointer-events-none">
        <div className="text-[10px] font-label text-white/30 tracking-[0.2em] pointer-events-auto">
          SYSTEM STATUS: <span className="text-primary">OPERATIONAL</span>
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <a className="text-[10px] font-label text-white/30 hover:text-white transition-colors" href="#">PRIVACY POLICY</a>
          <a className="text-[10px] font-label text-white/30 hover:text-white transition-colors" href="#">TERMS OF SERVICE</a>
        </div>
      </footer>
    </div>
  );
}
