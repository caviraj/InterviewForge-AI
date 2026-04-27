import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, MessageSquare, ChevronDown,
  Search, Play, ArrowLeft, Brain, Sparkles, Loader2, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';
import { useApi } from '../context/AuthContext';
import { getPracticeFeedback, PracticeFeedback } from '../services/practiceService';

const interviewTopics = [
  { id: 'sde', title: 'SDE' },
  { id: 'sql', title: 'SQL' },
  { id: 'dsa', title: 'DSA' },
  { id: 'python', title: 'Python' },
  { id: 'dsml', title: 'DSML' }
];

const interviewQuestions = {
  sde: [
    {
      q: "What is the difference between a Process and a Thread?",
      a: "A process is an independent execution unit that has its own memory space. A thread is a subset of a process that shares the same memory space as other threads within the same process. Threads are lighter and faster to create/switch, but a crash in one thread can affect the entire process.",
      difficulty: 'Medium',
      tags: ['Operating Systems', 'Concurrency'],
      companies: ['Google', 'Microsoft']
    },
    {
      q: "Explain the SOLID principles in Object-Oriented Design.",
      a: "SOLID stands for: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. These principles help in creating more maintainable, scalable, and robust software architectures.",
      difficulty: 'Medium',
      tags: ['System Design', 'OOP'],
      companies: ['Amazon', 'Meta']
    },
    {
      q: "What is Microservices Architecture?",
      a: "It's an architectural style where an application is built as a collection of small, independent services that communicate over well-defined APIs. Each service is focused on a specific business capability and can be deployed independently.",
      difficulty: 'Hard',
      tags: ['System Design', 'Architecture'],
      companies: ['Netflix', 'Uber']
    }
  ],
  sql: [
    {
      q: "What is the difference between INNER JOIN and LEFT JOIN?",
      a: "INNER JOIN returns only the rows where there is a match in both tables. LEFT JOIN returns all rows from the left table, and the matched rows from the right table; if no match is found, NULL values are returned for the right table's columns.",
      difficulty: 'Easy',
      tags: ['Databases', 'SQL'],
      companies: ['Oracle', 'Salesforce']
    },
    {
      q: "Explain Database Normalization.",
      a: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. It involves dividing large tables into smaller ones and defining relationships between them (1NF, 2NF, 3NF, BCNF).",
      difficulty: 'Medium',
      tags: ['Databases', 'Design'],
      companies: ['IBM', 'Microsoft']
    },
    {
      q: "What are ACID properties in a Database?",
      a: "ACID stands for Atomicity (all or nothing), Consistency (valid state), Isolation (independent transactions), and Durability (permanent changes). These ensure reliable processing of database transactions.",
      difficulty: 'Medium',
      tags: ['Databases', 'Transactions'],
      companies: ['Google', 'Amazon']
    }
  ],
  dsa: [
    {
      q: "What is the time complexity of searching in a Binary Search Tree (BST)?",
      a: "In a balanced BST, the time complexity is O(log n). In the worst case (skewed tree), it can be O(n).",
      difficulty: 'Easy',
      tags: ['Algorithms', 'Trees'],
      companies: ['Meta', 'Apple']
    },
    {
      q: "Explain the difference between a Stack and a Queue.",
      a: "A Stack follows the LIFO (Last-In-First-Out) principle, where the last element added is the first one removed. A Queue follows the FIFO (First-In-First-Out) principle, where the first element added is the first one removed.",
      difficulty: 'Easy',
      tags: ['Data Structures', 'Basics'],
      companies: ['Adobe', 'Cisco']
    },
    {
      q: "How does a Hash Map work?",
      a: "A Hash Map uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found. It provides O(1) average time complexity for insertion and retrieval.",
      difficulty: 'Medium',
      tags: ['Data Structures', 'Hashing'],
      companies: ['Google', 'Amazon']
    }
  ],
  python: [
    {
      q: "What is the difference between a List and a Tuple in Python?",
      a: "Lists are mutable (can be changed), while Tuples are immutable (cannot be changed after creation). Lists use square brackets [], and Tuples use parentheses ().",
      difficulty: 'Easy',
      tags: ['Python', 'Basics'],
      companies: ['Dropbox', 'Instagram']
    },
    {
      q: "Explain Python's Global Interpreter Lock (GIL).",
      a: "The GIL is a mutex that allows only one thread to execute Python bytecodes at a time, even on multi-core systems. This simplifies memory management but can be a bottleneck for CPU-bound multi-threaded programs.",
      difficulty: 'Hard',
      tags: ['Python', 'Concurrency'],
      companies: ['Google', 'Quora']
    },
    {
      q: "What are Decorators in Python?",
      a: "Decorators are a way to modify or enhance the behavior of functions or classes without changing their source code. They are higher-order functions that take another function as an argument and return a new function.",
      difficulty: 'Medium',
      tags: ['Python', 'Advanced'],
      companies: ['Netflix', 'Spotify']
    }
  ],
  dsml: [
    {
      q: "What is the difference between Supervised and Unsupervised Learning?",
      a: "Supervised learning uses labeled data (input-output pairs) to train models. Unsupervised learning finds hidden patterns or structures in unlabeled data (e.g., clustering).",
      difficulty: 'Easy',
      tags: ['Machine Learning', 'Basics'],
      companies: ['Tesla', 'Nvidia']
    },
    {
      q: "Explain Overfitting and how to prevent it.",
      a: "Overfitting occurs when a model learns the noise in the training data too well, leading to poor performance on new data. Prevention methods include Cross-validation, Regularization (L1/L2), and Pruning (for trees).",
      difficulty: 'Medium',
      tags: ['Machine Learning', 'Optimization'],
      companies: ['DeepMind', 'OpenAI']
    },
    {
      q: "What is a Confusion Matrix?",
      a: "A confusion matrix is a table used to evaluate the performance of a classification model. It shows True Positives, True Negatives, False Positives, and False Negatives.",
      difficulty: 'Easy',
      tags: ['Machine Learning', 'Evaluation'],
      companies: ['Meta', 'Google']
    }
  ]
};

export default function QuestionBank() {
  const authFetch = useApi();
  const [activeTopic, setActiveTopic] = useState<keyof typeof interviewQuestions>('sde');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [companyFilter, setCompanyFilter] = useState<string>('All');

  // Practice Mode State
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceQuestionIdx, setPracticeQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const allTags = Array.from(new Set(Object.values(interviewQuestions).flatMap(cat => cat.flatMap(q => q.tags))));
  const allCompanies = Array.from(new Set(Object.values(interviewQuestions).flatMap(cat => cat.flatMap(q => q.companies))));

  const filteredQuestions = interviewQuestions[activeTopic].filter(q => {
    const matchesSearch = q.q.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesTag = tagFilter === 'All' || q.tags.includes(tagFilter);
    const matchesCompany = companyFilter === 'All' || q.companies.includes(companyFilter);
    return matchesSearch && matchesDifficulty && matchesTag && matchesCompany;
  });

  const startPractice = () => {
    setIsPracticeMode(true);
    setPracticeQuestionIdx(0);
    setUserAnswer('');
    setFeedback(null);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsAnalyzing(true);
    try {
      const currentQ = interviewQuestions[activeTopic][practiceQuestionIdx];
      const result = await getPracticeFeedback(authFetch, currentQ.q, userAnswer);
      setFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextPracticeQuestion = () => {
    if (practiceQuestionIdx < interviewQuestions[activeTopic].length - 1) {
      setPracticeQuestionIdx(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setIsPracticeMode(false);
    }
  };

  if (isPracticeMode) {
    const currentQ = interviewQuestions[activeTopic][practiceQuestionIdx];
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <header className="flex items-center justify-between">
          <button 
            onClick={() => setIsPracticeMode(false)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest font-label">Exit Practice</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest font-label">Practice Mode: {activeTopic.toUpperCase()}</span>
          </div>
        </header>

        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Question {practiceQuestionIdx + 1} of {interviewQuestions[activeTopic].length}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                  currentQ.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                  currentQ.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{currentQ.difficulty}</span>
              </div>
              <h2 className="text-2xl font-headline font-bold text-white leading-tight">
                {currentQ.q}
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentQ.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded bg-white/5 text-[10px] text-white/40 uppercase tracking-widest">{tag}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-label tracking-widest uppercase text-white/40">Your Neural Synthesis</label>
              <textarea 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={!!feedback || isAnalyzing}
                placeholder="Synthesize your response here..."
                className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {!feedback ? (
              <button 
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || isAnalyzing}
                className="w-full py-4 rounded-2xl bg-gradient-primary text-black font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Response Vectors...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Submit for AI Evaluation
                  </>
                )}
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 pt-8 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Neural Score</span>
                    <span className="text-4xl font-headline font-bold text-primary">{feedback.score}</span>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${feedback.score}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sylvia's Synthesis</span>
                    <p className="text-sm text-white/80 leading-relaxed">{feedback.feedback}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-label tracking-widest uppercase text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Neural Strengths
                    </h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-label tracking-widest uppercase text-secondary flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Optimization Vectors
                    </h4>
                    <ul className="space-y-2">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                  <h4 className="text-xs font-label tracking-widest uppercase text-primary">Reference Synthesis (Model Answer)</h4>
                  <p className="text-sm text-white/80 leading-relaxed italic">"{feedback.modelAnswer}"</p>
                </div>

                <button 
                  onClick={nextPracticeQuestion}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  {practiceQuestionIdx < interviewQuestions[activeTopic].length - 1 ? 'Next Neural Challenge' : 'Complete Practice Session'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <header className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label tracking-widest uppercase"
        >
          <Zap className="w-4 h-4" />
          Neural Question Bank
        </motion.div>
        <h1 className="text-5xl font-headline font-bold text-white tracking-tight">
          Deep Dive into <span className="text-primary">Technical Concepts</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Master the most frequently asked interview questions with detailed neural syntheses of the correct answers.
        </p>
      </header>

      <div className="space-y-8">
        {/* QA Controls */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {interviewTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopic(topic.id as keyof typeof interviewQuestions);
                      setExpandedQuestion(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      activeTopic === topic.id 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block" />
              <button 
                onClick={startPractice}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-black text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Practice Mode
              </button>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Difficulty</label>
              <select 
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition-all min-w-[120px]"
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Topic Tag</label>
              <select 
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition-all min-w-[120px]"
              >
                <option value="All">All Topics</option>
                {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Company</label>
              <select 
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition-all min-w-[120px]"
              >
                <option value="All">All Companies</option>
                {allCompanies.map(company => <option key={company} value={company}>{company}</option>)}
              </select>
            </div>

            <button 
              onClick={() => {
                setDifficultyFilter('All');
                setTagFilter('All');
                setCompanyFilter('All');
                setSearchQuery('');
              }}
              className="mt-auto mb-1 px-4 py-2 text-[10px] font-bold text-white/40 hover:text-primary uppercase tracking-widest transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold group-hover:text-primary transition-colors">
                      {item.q}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                        item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                        item.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {item.difficulty}
                      </span>
                      {item.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-white/30 uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/5">
                          {tag}
                        </span>
                      ))}
                      {item.companies.slice(0, 1).map(company => (
                        <span key={company} className="text-[9px] font-bold text-primary/40 uppercase tracking-tighter px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-white/20 transition-transform duration-300 ${expandedQuestion === idx ? 'rotate-180 text-primary' : ''}`} />
              </button>
              
              <AnimatePresence>
                {expandedQuestion === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-6 bg-primary/5">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-white/80 text-sm leading-relaxed">
                            {item.a}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 rounded bg-white/5 text-[10px] text-white/40 uppercase tracking-widest">{tag}</span>
                            ))}
                            {item.companies.map(company => (
                              <span key={company} className="px-2 py-1 rounded bg-primary/5 text-[10px] text-primary/60 uppercase tracking-widest border border-primary/10">{company}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
          ) : (
            <div className="text-center py-20 glass-panel rounded-3xl border border-white/5">
              <p className="text-white/40 text-lg">No questions match your current neural filters.</p>
              <button 
                onClick={() => {
                  setDifficultyFilter('All');
                  setTagFilter('All');
                  setCompanyFilter('All');
                  setSearchQuery('');
                }}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Explore More */}
      <div className="text-center pt-8">
        <button className="px-8 py-4 rounded-2xl glass-panel border border-white/10 text-white font-bold hover:bg-white/5 transition-all">
          Request Custom Topic
        </button>
      </div>
    </div>
  );
}
