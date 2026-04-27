import { AtSign, Terminal, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -bottom-20 -right-20 pointer-events-none" />

      <main className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel w-full p-8 md:p-12 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 border border-white/10">
              <Terminal className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-white mb-2 text-center">Reset Password</h2>
            <p className="text-on-surface-variant text-sm font-body text-center">Enter your email to receive a recovery link</p>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <AtSign className="w-5 h-5" />
                </div>
                <input
                  className="w-full bg-surface-container-highest/40 border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-white placeholder:text-outline text-sm py-4 pl-12 pr-4 rounded-t-xl transition-all"
                  placeholder="name@company.com"
                  type="email"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-primary w-full py-4 rounded-xl text-black font-headline font-bold text-sm tracking-wide shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
              type="submit"
            >
              SEND RECOVERY LINK <Send className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="mt-10 flex justify-center">
            <Link className="flex items-center gap-2 text-xs text-on-surface-variant font-bold hover:text-primary transition-colors" to="/login">
              <ArrowLeft className="w-4 h-4" /> BACK TO LOGIN
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
