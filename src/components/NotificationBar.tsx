import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Bell, X, Info, Sparkles } from 'lucide-react';

const tips = [
  "Tip: Maintain consistent eye contact to boost your AI confidence score.",
  "New technical questions added to the Question Bank!",
  "Maintain your 3-day streak to unlock the 'Consistency' badge.",
  "Check your new insights to see your improved Problem Solving score.",
  "Forge Pro: Master the System Design round with our new AI templates.",
];

export default function NotificationBar() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[60] h-10 bg-gradient-to-r from-primary/20 via-black to-secondary/20 backdrop-blur-md border-b border-white/10 flex items-center justify-center px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
        <div className="flex items-center gap-3 max-w-7xl w-full">
          <div className="flex items-center gap-2 text-primary whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Updates</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTip}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-[11px] text-white/70 font-medium truncate"
              >
                {tips[currentTip]}
              </motion.p>
            </AnimatePresence>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-white/20 hover:text-white transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
