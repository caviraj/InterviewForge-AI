import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal, Brain, ArrowLeft, MoreVertical, Paperclip, Smile, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCoachResponse, CoachMessage } from '../services/coachService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  followUps?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Greetings, Alex. I am Sylvia V4.2, your AI Career Coach. I've analyzed your recent mock interview performance. Your technical logic is sharp (91%), but your behavioral delivery (74%) and linguistic fluidity (65%) show room for evolution. How can I assist your trajectory today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    followUps: [
      "Analyze my last system design session",
      "How can I improve my behavioral delivery?"
    ]
  }
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string) => {
    e?.preventDefault();
    const messageContent = contentOverride || inputValue;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const history: CoachMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      history.push({ role: 'user', content: messageContent });

      const response = await getCoachResponse(history);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        followUps: response.followUps
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get coach response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="text-black w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              AI Career Coach
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-label tracking-widest uppercase border border-primary/20">Active</span>
            </h2>
            <p className="text-xs text-on-surface-variant">Neural Link Established · Sylvia V4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <Terminal className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-3xl border border-white/5 flex flex-col overflow-hidden relative">
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                    msg.role === 'user' 
                      ? 'bg-surface-container-highest border-white/10 text-white' 
                      : 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_rgba(129,236,255,0.1)]'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-2xl text-sm font-body leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary/20 to-secondary/20 text-white border border-white/10 rounded-tr-none'
                        : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Follow-up Questions */}
                    {msg.role === 'assistant' && msg.followUps && msg.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.followUps.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(undefined, q)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-[11px] text-primary hover:bg-primary/10 transition-all group"
                          >
                            {q}
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-white/20 font-label uppercase tracking-widest">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 border-t border-white/5 bg-[#0e0e0e]/50">
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-3"
          >
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center gap-2 text-white/20 group-focus-within:text-primary transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your AI Coach anything..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-sm text-white placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
              <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                <button type="button" className="p-2 text-white/20 hover:text-white transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 text-white/20 hover:text-white transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-black shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </form>
          <p className="text-[10px] text-center mt-4 text-white/20 uppercase tracking-widest font-label">
            Sylvia V4.2 is analyzing your neural skill vectors for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
