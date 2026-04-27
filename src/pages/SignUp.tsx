import React from 'react';
import { AtSign, Lock, Terminal, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -bottom-20 -right-20 pointer-events-none" />

      <main className="w-full max-w-[1200px] grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Hero */}
        <div className="hidden md:flex flex-col space-y-8 pr-12">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-label tracking-widest uppercase font-bold"
            >
              Join the Elite
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-headline font-bold leading-tight tracking-tight"
            >
              Start Your <span className="text-gradient">Evolution</span> Today.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-lg max-w-md font-body leading-relaxed"
            >
              Create your profile and gain access to the most advanced AI interview simulations in the industry.
            </motion.p>
          </div>

          <div className="space-y-6">
            {[
              { title: 'Personalized Pathing', desc: 'AI-generated roadmaps tailored to your specific career goals.' },
              { title: 'Elite Community', desc: 'Connect with top-tier engineers and executive mentors.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-1 h-12 bg-primary rounded-full shadow-[0_0_10px_#81ecff]" />
                <div>
                  <h4 className="text-white font-bold font-headline">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel w-full max-w-md p-8 md:p-12 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <User className="text-black w-10 h-10" />
              </div>
              <h2 className="text-3xl font-headline font-bold text-white mb-2">Create Account</h2>
              <p className="text-on-surface-variant text-sm font-body">Begin your journey into the forge</p>
            </div>

            <form className="space-y-6" onSubmit={handleSignUp}>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-highest/40 border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-white placeholder:text-outline text-sm py-4 pl-12 pr-4 rounded-t-xl transition-all"
                    placeholder="Alex Vanguard"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-highest/40 border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-white placeholder:text-outline text-sm py-4 pl-12 pr-4 rounded-t-xl transition-all"
                    placeholder="name@company.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-highest/40 border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-white placeholder:text-outline text-sm py-4 pl-12 pr-4 rounded-t-xl transition-all"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="bg-gradient-primary w-full py-4 rounded-xl text-black font-headline font-bold text-sm tracking-wide shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'} <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            <p className="mt-10 text-center text-xs text-on-surface-variant font-body">
              Already have an account? <Link className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4" to="/login">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
