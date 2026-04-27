import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Settings, X, 
  Brain, Code, MessageSquare, Zap, ArrowRight,
  ShieldCheck, AlertCircle, Loader2, Bot, Terminal,
  Play, CheckCircle2, Globe, ChevronRight
} from 'lucide-react';

type Stage = 'setup' | 'aptitude' | 'technical' | 'hr' | 'analyzing';

export default function InterviewSession() {
  const [stage, setStage] = useState<Stage>('setup');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('TypeScript');
  const [code, setCode] = useState('// Write your solution here\n\nfunction solve() {\n  \n}');
  const [testResults, setTestResults] = useState<{passed: boolean, name: string}[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [hrResponse, setHrResponse] = useState('');
  const [aptitudeAnswers, setAptitudeAnswers] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [biometrics, setBiometrics] = useState({
    confidence: 82,
    stress: 14,
    articulation: 95,
    facialExpression: 'Neutral',
    eyeTracking: 98,
    gsr: 2.4
  });

  const [aiInsight, setAiInsight] = useState("AI Insight: Initializing neural analysis...");

  useEffect(() => {
    if (stage !== 'setup' && stage !== 'analyzing') {
      const expressions = ['Neutral', 'Focused', 'Thinking', 'Slightly Stressed', 'Confident'];
      const interval = setInterval(() => {
        setBiometrics(prev => {
          const newConfidence = Math.round(Math.min(100, Math.max(0, prev.confidence + (Math.random() * 4 - 2))));
          const newStress = Math.round(Math.min(100, Math.max(0, prev.stress + (Math.random() * 2 - 1))));
          const newEye = Math.round(Math.min(100, Math.max(80, prev.eyeTracking + (Math.random() * 2 - 1))));
          
          // Update AI Insight based on biometrics
          if (newStress > 30) {
            setAiInsight("AI Insight: Neural stress detected. Take a deep breath to stabilize logic.");
          } else if (newConfidence < 70) {
            setAiInsight("AI Insight: Confidence vector dropping. Project more authority in your synthesis.");
          } else if (newEye < 85) {
            setAiInsight("AI Insight: Eye focus drifting. Maintain direct neural engagement with the mentor.");
          } else {
            setAiInsight("AI Insight: Neural patterns stabilized. Optimal performance trajectory detected.");
          }

          return {
            confidence: newConfidence,
            stress: newStress,
            articulation: Math.round(Math.min(100, Math.max(0, prev.articulation + (Math.random() * 2 - 1)))),
            facialExpression: expressions[Math.floor(Math.random() * expressions.length)],
            eyeTracking: newEye,
            gsr: Number((Math.min(10, Math.max(1, prev.gsr + (Math.random() * 0.2 - 0.1)))).toFixed(1))
          };
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Camera handling
  useEffect(() => {
    async function startCamera() {
      if (stage !== 'setup' && stage !== 'analyzing' && isVideoOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera/mic:", err);
        }
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stage, isVideoOn, isMicOn]);

  // Timers
  const [totalTimeLeft, setTotalTimeLeft] = useState(1200); // 20 minutes
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120); // 2 minutes
  
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem('interview_session');
    if (saved) {
      setHasSavedSession(true);
    }
  }, []);

  // Auto-save session state
  useEffect(() => {
    if (stage !== 'setup' && stage !== 'analyzing') {
      const sessionData = {
        stage,
        currentQuestion,
        selectedLanguage,
        code,
        totalTimeLeft,
        questionTimeLeft,
        timestamp: Date.now()
      };
      localStorage.setItem('interview_session', JSON.stringify(sessionData));
    }
  }, [stage, currentQuestion, selectedLanguage, code, totalTimeLeft, questionTimeLeft]);

  const resumeSession = () => {
    const saved = localStorage.getItem('interview_session');
    if (saved) {
      const data = JSON.parse(saved);
      setStage(data.stage);
      setCurrentQuestion(data.currentQuestion);
      setSelectedLanguage(data.selectedLanguage);
      setCode(data.code);
      setTotalTimeLeft(data.totalTimeLeft);
      setQuestionTimeLeft(data.questionTimeLeft);
      setHasSavedSession(false);
    }
  };

  const clearSavedSession = () => {
    localStorage.removeItem('interview_session');
    setHasSavedSession(false);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setHrResponse(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const languages = ['TypeScript', 'Python', 'Java', 'C++', 'Go'];

  const stages: { id: Stage; label: string; icon: any }[] = [
    { id: 'aptitude', label: 'Aptitude', icon: Zap },
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'hr', label: 'HR Round', icon: MessageSquare },
  ];

  const questions = {
    aptitude: [
      "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
      "In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?",
      "Which number should come next in the series: 1, 1, 2, 3, 5, 8, 13, ...?",
      "If you rearrange the letters 'CIFAIPC', you would have the name of a(n):"
    ],
    technical: [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        testCases: ["nums = [2,7,11,15], target = 9", "nums = [3,2,4], target = 6"]
      },
      {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        testCases: ["s = '()'", "s = '()[]{}'", "s = '(]'"]
      },
      {
        title: "Merge Intervals",
        description: "Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals.",
        testCases: ["intervals = [[1,3],[2,6],[8,10],[15,18]]", "intervals = [[1,4],[4,5]]"]
      }
    ],
    hr: [
      "Tell me about a time you had to handle a significant technical failure in production. What was your role and how did you resolve it?"
    ]
  };

  useEffect(() => {
    if (stage !== 'setup' && stage !== 'analyzing') {
      startGlobalTimer();
    }
    return () => stopTimer();
  }, [stage]);

  const startGlobalTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 0) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
      
      setQuestionTimeLeft(prev => {
        if (prev <= 0) {
          handleNextQuestion();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNextQuestion = () => {
    const stageQuestions = questions[stage as keyof typeof questions];
    if (currentQuestion < stageQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionTimeLeft(120);
      setTestResults([]);
      setIsRunning(false);
    } else {
      if (stage === 'aptitude') {
        setStage('technical');
        setCurrentQuestion(0);
        setQuestionTimeLeft(120);
      } else if (stage === 'technical') {
        setStage('hr');
        setCurrentQuestion(0);
        setQuestionTimeLeft(120);
      } else if (stage === 'hr') {
        validateAndSubmit();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      if (stage === 'technical') {
        setStage('aptitude');
        setCurrentQuestion(questions.aptitude.length - 1);
      } else if (stage === 'hr') {
        setStage('technical');
        setCurrentQuestion(questions.technical.length - 1);
      }
    }
  };

  const validateAndSubmit = () => {
    const isAptitudeComplete = aptitudeAnswers.length === questions.aptitude.length;
    const isTechnicalComplete = code.trim().length > 50; // Simple check
    const isHrComplete = hrResponse.trim().length > 10;

    if (!isAptitudeComplete || !isTechnicalComplete || !isHrComplete) {
      setShowConfirmModal(true);
    } else {
      endSession();
    }
  };

  const endSession = () => {
    setIsSubmitting(true);
    setStage('analyzing');
    stopTimer();
    
    // Collect session data for AI Synthesis
    const sessionData = {
      aptitudeScore: aptitudeAnswers.length * 20, 
      technicalCode: code,
      technicalLanguage: selectedLanguage,
      technicalTestResults: testResults,
      hrResponse: hrResponse || "User completed behavioral round.",
      totalTimeUsed: 1200 - totalTimeLeft,
      timestamp: Date.now()
    };
    
    localStorage.setItem('last_session_data', JSON.stringify(sessionData));
    localStorage.removeItem('interview_session');
    
    setTimeout(() => navigate('/interviews/report'), 3000);
  };

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTestResults([
        { name: "Test Case 1", passed: true },
        { name: "Test Case 2", passed: true },
        { name: "Test Case 3", passed: Math.random() > 0.3 }
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = () => {
    setStage('aptitude');
  };

  const isFinalQuestion = stage === 'hr' && currentQuestion === questions.hr.length - 1;
  const totalQuestionsInStage = questions[stage as keyof typeof questions]?.length || 0;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6 pb-32">
      <AnimatePresence mode="wait">
        {stage === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center gap-12"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-headline font-bold text-white tracking-tight">Initialize Neural Link</h1>
              <p className="text-on-surface-variant max-w-md mx-auto">Configure your hardware and biometrics before entering the forge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden relative aspect-video bg-black/40 flex items-center justify-center">
                {isVideoOn ? (
                  <img 
                    src="https://picsum.photos/seed/user-cam/1280/720" 
                    className="w-full h-full object-cover opacity-60 grayscale" 
                    alt="Camera Feed"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/20">
                    <VideoOff className="w-16 h-16" />
                    <span className="text-xs font-label tracking-widest uppercase">Optical Link Offline</span>
                  </div>
                )}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                  <button 
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/40'}`}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOn ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/40'}`}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-sm font-label tracking-widest uppercase text-primary">Session Parameters</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Total Duration</span>
                      <span className="text-white font-bold">20:00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Time Per Question</span>
                      <span className="text-white font-bold">02:00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">AI Mentor</span>
                      <span className="text-secondary font-bold">Sylvia V4.2</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Systems Ready</p>
                    <p className="text-xs text-white/40">Hardware integrity verified</p>
                  </div>
                </div>

                {hasSavedSession && (
                  <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-bold">Ongoing Session Detected</p>
                    </div>
                    <p className="text-xs text-white/60">You have an incomplete session. Would you like to resume from where you left off?</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={resumeSession}
                        className="flex-1 py-2 rounded-xl bg-primary text-black text-xs font-bold uppercase tracking-widest"
                      >
                        Resume
                      </button>
                      <button 
                        onClick={clearSavedSession}
                        className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest"
                      >
                        Start Fresh
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={startInterview}
                  className="w-full py-4 rounded-2xl bg-gradient-primary text-black font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 group"
                >
                  Enter the Forge
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : stage === 'analyzing' ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-8"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 animate-ping absolute inset-0"></div>
              <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin relative flex items-center justify-center">
                <Brain className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-headline font-bold text-white">
                {isSubmitting ? 'Finalizing Neural Synthesis' : 'Synthesizing Performance Data'}
              </h2>
              <p className="text-on-surface-variant animate-pulse">
                {isSubmitting ? 'Compiling all response vectors and biometric data...' : 'Analyzing neural patterns and response vectors...'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col gap-6 pb-32"
          >
            {/* Session Header */}
            <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-white/5">
              <div className="flex gap-4">
                {stages.map((s) => (
                  <div 
                    key={s.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${stage === s.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/20'}`}
                  >
                    <s.icon className="w-4 h-4" />
                    <span className="text-xs font-label tracking-widest uppercase font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Question Timer</p>
                    <p className={`text-sm font-mono font-bold ${questionTimeLeft < 30 ? 'text-red-500' : 'text-primary'}`}>{formatTime(questionTimeLeft)}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Total Time</p>
                    <p className="text-sm font-mono text-white font-bold">{formatTime(totalTimeLeft)}</p>
                  </div>
                </div>
                <button 
                  onClick={endSession}
                  className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex gap-6 overflow-hidden">
              {/* Sidebar for Technical Round */}
              {stage === 'technical' && (
                <div className="w-64 glass-panel rounded-3xl border border-white/5 p-6 flex flex-col gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-label tracking-widest uppercase text-white/40">Language</h3>
                    <div className="space-y-2">
                      {languages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${selectedLanguage === lang ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:bg-white/5'}`}
                        >
                          <span className="text-sm font-bold">{lang}</span>
                          {selectedLanguage === lang && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Compiler V1.0</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Auto-save enabled. Test cases are validated against the current buffer.
                    </p>
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {stage === 'technical' ? (
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                    {/* Problem Description */}
                    <div className="glass-panel rounded-3xl border border-white/5 p-8 flex flex-col gap-6 overflow-y-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-label">Problem {currentQuestion + 1} of 3</p>
                          <h2 className="text-xl font-headline font-bold text-white">{(questions.technical[currentQuestion] as any).title}</h2>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-white/80 leading-relaxed">
                          {(questions.technical[currentQuestion] as any).description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-white uppercase tracking-widest">Test Cases:</p>
                          {(questions.technical[currentQuestion] as any).testCases.map((tc: string, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-primary/80">
                              {tc}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="glass-panel rounded-3xl border border-white/5 flex flex-col overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-white/40" />
                          <span className="text-xs font-mono text-white/40">editor.main.{selectedLanguage.toLowerCase()}</span>
                        </div>
                        <button 
                          onClick={runCode}
                          disabled={isRunning}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-black text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(129,236,255,0.4)] transition-all disabled:opacity-50"
                        >
                          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                          Run Code
                        </button>
                      </div>
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent p-6 font-mono text-sm text-white/80 outline-none resize-none"
                        spellCheck={false}
                      />
                      {testResults.length > 0 && (
                        <div className="p-6 border-t border-white/5 bg-black/40">
                          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Execution Results</h4>
                          <div className="space-y-2">
                            {testResults.map((res, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                <span className="text-xs text-white/60">{res.name}</span>
                                <span className={`text-xs font-bold ${res.passed ? 'text-green-400' : 'text-red-400'}`}>
                                  {res.passed ? 'PASSED' : 'FAILED'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 glass-panel rounded-3xl border border-white/5 p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(120 - questionTimeLeft) / 1.2}%` }}
                        className="h-full bg-primary shadow-[0_0_10px_#81ecff]"
                      />
                    </div>
                    
                    <div className="space-y-8 max-w-2xl z-10">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary animate-pulse">
                          <Bot className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-label tracking-[0.3em] uppercase text-secondary font-bold">AI Mentor: Sylvia</span>
                      </div>
                      
                      <h2 className="text-3xl font-headline font-bold text-white leading-tight">
                        {stage === 'aptitude' ? questions.aptitude[currentQuestion] : questions.hr[currentQuestion]}
                      </h2>

                      {stage === 'hr' && (
                        <div className="relative w-full">
                          <textarea
                            value={hrResponse}
                            onChange={(e) => setHrResponse(e.target.value)}
                            placeholder="Type your response here or speak clearly..."
                            className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:border-secondary outline-none transition-all resize-none pr-16"
                          />
                          <button
                            onClick={toggleListening}
                            className={`absolute bottom-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              isListening 
                                ? 'bg-secondary text-black shadow-[0_0_15px_rgba(255,184,0,0.4)] animate-pulse' 
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                          </button>
                          {isListening && (
                            <div className="absolute -top-8 right-0 flex items-center gap-2">
                              <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                  <motion.div 
                                    key={i}
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                    className="w-1 bg-secondary rounded-full"
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Listening...</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-center gap-2">
                        {questions[stage as keyof typeof questions].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i === currentQuestion ? 'bg-primary shadow-[0_0_8px_#81ecff]' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Background Accents */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full" />
                  </div>
                )}
              </div>

              {/* User Feed & Biometrics */}
              <div className="w-80 flex flex-col gap-6">
                <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden aspect-square relative bg-black">
                  {isVideoOn ? (
                    <video 
                      ref={videoRef}
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <VideoOff className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live Feed
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 flex-1 space-y-6">
                  <h3 className="text-xs font-label tracking-widest uppercase text-white/40">Biometric Analysis</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Confidence', value: biometrics.confidence, unit: '%', color: 'text-primary', max: 100 },
                      { label: 'Stress Level', value: biometrics.stress, unit: '%', color: 'text-secondary', max: 100 },
                      { label: 'Facial Expression', value: biometrics.facialExpression, unit: '', color: 'text-purple-400', max: 100, isText: true },
                      { label: 'Eye Focus', value: biometrics.eyeTracking, unit: '%', color: 'text-green-400', max: 100 },
                      { label: 'Skin Conductance', value: biometrics.gsr, unit: ' μS', color: 'text-amber-400', max: 10 },
                    ].map((bio) => (
                      <div key={bio.label} className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-label uppercase tracking-widest">
                          <span className="text-white/40">{bio.label}</span>
                          <span className={bio.color}>{bio.value}{bio.unit}</span>
                        </div>
                        {!bio.isText && (
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(Number(bio.value) / bio.max) * 100}%` }}
                              className={`h-full bg-current ${bio.color}`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <Brain className="w-5 h-5 text-primary" />
                      <p className="text-[10px] text-primary leading-relaxed uppercase tracking-wider font-bold">
                        {aiInsight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Persistent Navigation Bar */}
      {stage !== 'setup' && stage !== 'analyzing' && (
        <div className="fixed bottom-0 left-0 w-full z-[60] p-6 flex justify-center pointer-events-none">
          <div className="max-w-7xl w-full glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between pointer-events-auto backdrop-blur-xl bg-black/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePreviousQuestion}
                disabled={stage === 'aptitude' && currentQuestion === 0}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-20 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Previous
              </button>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [8, 16, 10] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                      className="w-1 bg-primary/40 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-label tracking-widest uppercase text-white/40">Neural Link Active</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-label mb-1">
                {stage.toUpperCase()} Progress
              </p>
              <p className="text-sm font-bold text-white">
                Question {currentQuestion + 1} of {totalQuestionsInStage}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleNextQuestion}
                className={`px-8 py-2 rounded-xl text-black text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  isFinalQuestion 
                    ? 'bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(129,236,255,0.5)] hover:scale-105' 
                    : 'bg-primary hover:shadow-[0_0_15px_rgba(129,236,255,0.4)]'
                }`}
              >
                {isFinalQuestion ? 'Finalize Neural Synthesis' : 'Next Question'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-headline font-bold text-white">Incomplete Synthesis</h3>
                <p className="text-white/60 text-sm">
                  We've detected unanswered question vectors. Submitting now will result in a partial performance analysis.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Return to Test
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    endSession();
                  }}
                  className="py-3 rounded-xl bg-secondary text-black text-xs font-bold uppercase tracking-widest shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all"
                >
                  Finalize Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
