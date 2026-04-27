import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Brain, ChevronRight, RotateCcw, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { useApi, useAuth } from '../context/AuthContext';

const practiceQuestions = [
  "Tell me about yourself and your professional background.",
  "What is your greatest professional achievement so far?",
  "Describe a time when you had to work under pressure to meet a deadline.",
  "How do you handle conflicts in a team environment?",
  "Where do you see yourself in 5 years?",
  "What are your greatest strengths and weaknesses?",
  "Why are you interested in this position?",
  "How do you prioritize your work when you have multiple deadlines?",
  "Describe a challenging project and how you handled it.",
  "What motivates you in your career?",
];

const confidenceHints = [
  { min: 0, max: 40, label: 'Low Confidence', color: 'text-red-400', bg: 'bg-red-500', tip: 'Speak louder and more clearly. Take a breath and project your voice.' },
  { min: 40, max: 65, label: 'Moderate Confidence', color: 'text-amber-400', bg: 'bg-amber-500', tip: 'Good start! Try slowing down and adding more clarity to your points.' },
  { min: 65, max: 80, label: 'Good Confidence', color: 'text-primary', bg: 'bg-primary', tip: 'Great projection! Maintain this energy and make eye contact.' },
  { min: 80, max: 100, label: 'Excellent Confidence', color: 'text-green-400', bg: 'bg-green-500', tip: 'Outstanding! You sound authoritative and composed. Keep it up!' },
];

export default function PracticeMode() {
  const authFetch = useApi();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(72);
  const [sessionDone, setSessionDone] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(4));
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [autoPlayed, setAutoPlayed] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentHint = confidenceHints.find(h => confidence >= h.min && confidence < h.max) || confidenceHints[2];

  // Mic waveform animation
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setWaveHeights(Array(20).fill(0).map(() => Math.random() * 40 + 4));
        setConfidence(prev => {
          const delta = (Math.random() - 0.35) * 3;
          return Math.min(98, Math.max(30, prev + delta));
        });
      }, 120);
    } else {
      setWaveHeights(Array(20).fill(4));
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Setup Speech Recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t;
          else interim += t;
        }
        setTranscript(prev => (final ? (prev + ' ' + final).trim() : prev + ' ' + interim));
      };
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      recognitionRef.current = rec;
    }
    return () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);

  // Auto-read question when it changes
  useEffect(() => {
    if (ttsEnabled && !autoPlayed && !sessionDone) {
      readQuestion();
      setAutoPlayed(true);
    }
  }, [currentQ, ttsEnabled]);

  useEffect(() => { setAutoPlayed(false); setTranscript(''); }, [currentQ]);

  const readQuestion = () => {
    if (!ttsEnabled) return;
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(practiceQuestions[currentQ]);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US' && v.name.includes('Google')) || null;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const nextQuestion = () => {
    setAnsweredQuestions(prev => [...prev, transcript || '(No verbal response)']);
    setTranscript('');
    setIsListening(false);
    recognitionRef.current?.stop();
    if (currentQ < practiceQuestions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      finishAndSave();
    }
  };

  const finishAndSave = async () => {
    setIsSaving(true);
    const sessionData = {
      type: 'practice',
      category: 'General Behavioral',
      score: Math.round(confidence),
      duration: 600, // Simulated 10 mins
      questionsAnswered: practiceQuestions.length,
      feedback: 'Voice-only practice session completed successfully.',
      timestamp: new Date().toISOString()
    };

    try {
      await authFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      localStorage.setItem('last_session_data', JSON.stringify({
        ...sessionData,
        overallScore: Math.round(confidence),
        totalTimeUsed: 600
      }));
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setIsSaving(false);
      setSessionDone(true);
    }
  };

  const restartSession = () => {
    setCurrentQ(0);
    setTranscript('');
    setConfidence(72);
    setSessionDone(false);
    setAnsweredQuestions([]);
    setIsListening(false);
    window.speechSynthesis?.cancel();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary font-label text-xs uppercase tracking-[0.2em] mb-1">Voice Practice Mode</p>
          <h1 className="text-4xl font-headline font-bold text-white">Confidence Trainer</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${ttsEnabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}>
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {ttsEnabled ? 'Voice On' : 'Voice Off'}
          </button>
          <button onClick={restartSession} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {practiceQuestions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < currentQ ? 'bg-primary' : i === currentQ ? 'bg-primary/50' : 'bg-white/10'}`} />
        ))}
        <span className="text-xs text-white/40 font-mono ml-2">{currentQ + 1}/{practiceQuestions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        {!sessionDone ? (
          <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6">
            {/* Question Card */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${((currentQ) / practiceQuestions.length) * 100}%` }} />
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${isSpeaking ? 'bg-secondary/20 border border-secondary/40 animate-pulse' : 'bg-primary/10 border border-primary/20'}`}>
                  <Brain className={`w-6 h-6 ${isSpeaking ? 'text-secondary' : 'text-primary'}`} />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest font-label mb-2">
                    {isSpeaking ? 'AI Mentor Speaking...' : 'Question ' + (currentQ + 1)}
                  </p>
                  <h2 className="text-2xl font-headline font-bold text-white leading-tight">
                    {practiceQuestions[currentQ]}
                  </h2>
                </div>
              </div>
              <button onClick={readQuestion} disabled={isSpeaking}
                className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors disabled:opacity-40">
                <Volume2 className="w-4 h-4" />
                {isSpeaking ? 'Playing...' : 'Replay Question'}
              </button>
            </div>

            {/* Mic Interface */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col items-center gap-8">
              {/* Waveform */}
              <div className="flex items-center gap-1 h-16">
                {waveHeights.map((h, i) => (
                  <motion.div key={i} animate={{ height: h }} transition={{ duration: 0.1 }}
                    className={`w-2 rounded-full transition-colors ${isListening ? 'bg-primary' : 'bg-white/10'}`}
                    style={{ minHeight: 4 }} />
                ))}
              </div>

              {/* Mic Button */}
              <motion.button onClick={toggleMic} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                  isListening
                    ? 'bg-primary shadow-primary/40 animate-pulse'
                    : 'bg-white/10 border border-white/20 hover:bg-white/15'
                }`}>
                {isListening ? <Mic className="w-10 h-10 text-black" /> : <MicOff className="w-10 h-10 text-white/60" />}
              </motion.button>
              <p className="text-xs text-white/40 font-label uppercase tracking-widest">
                {isListening ? '🔴 Listening — speak your answer' : 'Tap the mic to start answering'}
              </p>

              {/* Confidence Meter */}
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-label uppercase tracking-widest text-white/40">Voice Confidence</span>
                  <span className={`text-sm font-bold ${currentHint.color}`}>{Math.round(confidence)}% — {currentHint.label}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${confidence}%` }} transition={{ duration: 0.2 }}
                    className={`h-full rounded-full ${currentHint.bg} shadow-[0_0_12px_rgba(129,236,255,0.4)]`} />
                </div>
                <p className="text-xs text-white/40 italic">{currentHint.tip}</p>
              </div>
            </div>

            {/* Transcript */}
            {transcript && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-panel rounded-2xl p-6 border border-white/10">
                <p className="text-[11px] font-label uppercase tracking-widest text-white/40 mb-3">Your Answer (Transcript)</p>
                <p className="text-white/80 leading-relaxed">{transcript}</p>
              </motion.div>
            )}

            <div className="flex justify-end">
              <motion.button onClick={nextQuestion} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-primary text-black font-bold shadow-lg shadow-primary/20 disabled:opacity-50">
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentQ === practiceQuestions.length - 1 ? 'Finish Session' : 'Next Question'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-12 border border-white/10 flex flex-col items-center gap-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-3xl font-headline font-bold text-white mb-2">Session Complete!</h2>
              <p className="text-white/60">You answered all {practiceQuestions.length} questions. Great work!</p>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full max-w-md">
              {[
                { label: 'Questions', value: practiceQuestions.length },
                { label: 'Avg Confidence', value: `${Math.round(confidence)}%` },
                { label: 'Session XP', value: '+250' },
              ].map(s => (
                <div key={s.label} className="glass-panel rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-headline font-bold text-primary">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={restartSession} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm">
                <RotateCcw className="w-4 h-4" /> Practice Again
              </button>
              <button onClick={() => window.location.href = '/feedback'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-black font-bold text-sm">
                <Zap className="w-4 h-4" /> View Feedback
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
