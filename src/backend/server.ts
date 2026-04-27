import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'interview_forge_secret_2024';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.warn('⚠️ Missing GEMINI_API_KEY in .env. AI features will be limited.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase Client Initialized');


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());


// Auth middleware
async function authenticate(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('Invalid token');
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Initialize AI
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    // Check existing
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const userObj = {
      name,
      email,
      password_hash: hashed,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: 'Software Engineer',
      experience: 'Junior',
      stats: { sessions: 0, xp: 0, streak: 0, rank: 9999 }
    };

    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert(userObj)
      .select()
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign({ id: user.id, email, name }, JWT_SECRET, { expiresIn: '7d' });

    // Welcome notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Welcome to Interview Forge AI! 🎉',
      message: 'Your account has been created. Start your first practice session!',
      read: false
    });

    res.json({ token, user: { id: user.id, name, email, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/oauth', async (req, res) => {
  try {
    const { provider, name, email, avatar } = req.body;
    let { data: user } = await supabase.from('users').select('*').eq('email', email).single();

    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name, email, avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          role: 'Software Engineer', experience: 'Junior'
        })
        .select()
        .single();
      if (insertError) throw insertError;
      user = newUser;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

app.get('/api/user/profile', authenticate, async (req: any, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error || !user) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/user/profile', authenticate, async (req: any, res) => {
  try {
    const { name, role, experience, appearance } = req.body;
    const { error } = await supabase
      .from('users')
      .update({ name, role, experience, appearance, updated_at: new Date() })
      .eq('id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── SESSION ROUTES ───────────────────────────────────────────────────────────

app.post('/api/reports/generate', authenticate, async (req: any, res: any) => {
  const SYSTEM_INSTRUCTION = `
    You are the "Forge Synthesis Engine", a high-fidelity AI analyzer for the Interview Forge platform.
    Your task is to take raw interview session data and generate a comprehensive, personalized performance report.
    
    THEME:
    - Use "Kinetic Foundry" terminology: "neural patterns", "logic processing", "vocal mapping", "synthesis", "evolution".
    - Be professional, objective, and encouraging.
  `;

  try {
    const sessionData = req.body;
    
    const schema = {
      forgeIqScore: 1250,
      percentile: "92nd",
      confidenceDelta: "+5.2%",
      masteryPercentage: 88,
      metrics: {
        technicalAccuracy: 90,
        problemSolving: 85,
        communication: 95,
        aptitudeScore: 80
      },
      stageAnalysis: {
        aptitude: { score: 80, details: "Fast processing", strengths: ["Logic"], improvements: ["Speed"] },
        technical: { score: 85, details: "Clean code", strengths: ["DRY"], improvements: ["Big O"] },
        hr: { score: 95, details: "Clear speech", strengths: ["Empathy"], improvements: ["Nuance"] }
      },
      neuralFeedback: {
        technicalStrength: "Exceptional logic processing.",
        growthVector: "Optimize for edge cases."
      },
      recommendations: [
        { title: "Advanced Concurrency", type: "Technical", duration: "2h" },
        { title: "System Design", type: "Architecture", duration: "3h" }
      ]
    };

    const prompt = `
      ${SYSTEM_INSTRUCTION}
      
      Generate a report based on this data: ${JSON.stringify(sessionData)}
      
      The output MUST be a JSON object matching this EXACT structure:
      ${JSON.stringify(schema, null, 2)}
      
      Fill in the values realistically based on the interview data.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const report = JSON.parse(result.text || '{}');
    
    res.json(report);
  } catch (err) {
    console.error('Report Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate AI report' });
  }
});

app.post('/api/sessions', authenticate, async (req: any, res) => {
  try {
    const { session_data, report_data } = req.body;
    
    const { data: session, error: insertError } = await supabase
      .from('sessions')
      .insert({
        user_id: req.user.id,
        session_data,
        report_data,
        score: report_data?.forgeIqScore || 0,
        type: session_data?.type || 'mock_interview'
      })
      .select()
      .single();
    
    if (insertError) throw insertError;

    // Update user stats
    const { data: user } = await supabase.from('users').select('stats').eq('id', req.user.id).single();
    const currentStats = user?.stats || { sessions: 0, xp: 0, streak: 0, rank: 9999 };
    
    const bonusXp = Math.floor(Math.random() * 200 + 100);
    const newStats = {
      ...currentStats,
      sessions: (currentStats.sessions || 0) + 1,
      xp: (currentStats.xp || 0) + bonusXp
    };
    
    await supabase.from('users').update({ stats: newStats }).eq('id', req.user.id);

    // Achievement notification
    await supabase.from('notifications').insert({
      user_id: req.user.id,
      type: 'achievement',
      title: 'Session Completed! 🏆',
      message: `Neural synthesis complete. You've earned ${bonusXp} XP.`,
      read: false
    });

    res.json({ id: session.id, xpEarned: bonusXp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/sessions', authenticate, async (req: any, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── NOTIFICATION ROUTES ──────────────────────────────────────────────────────

app.get('/api/notifications', authenticate, async (req: any, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/notifications/:id/read', authenticate, async (req: any, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/notifications/read-all', authenticate, async (req: any, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Practice Mode Evaluation endpoint
app.post('/api/evaluate/practice', authenticate, async (req: any, res: any) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Question and userAnswer are required' });
    }

    const SYSTEM_INSTRUCTION = `
      You are Sylvia V4.2, the AI Mentor for the "Interview Forge" platform. 
      Your task is to evaluate user solutions to technical interview questions in "Practice Mode".

      GUIDELINES:
      1. Provide constructive, high-fidelity feedback.
      2. Evaluate the logic, completeness, and clarity of the user's response.
      3. Be encouraging but rigorous.
      4. Use "foundry" themed language (e.g., "neural patterns", "logic vectors", "forge").
      5. Provide a score out of 100 based on the quality of the answer.

      RESPONSE FORMAT:
      You must return a JSON object with:
      1. "feedback": A concise summary of the evaluation.
      2. "score": A numerical score from 0 to 100.
      3. "strengths": An array of 2-3 points the user did well.
      4. "improvements": An array of 2-3 points for improvement.
      5. "modelAnswer": A high-quality version of the answer for the user to learn from.
    `;

    const prompt = `
      ${SYSTEM_INSTRUCTION}
      
      QUESTION: ${question}
      USER_ANSWER: ${userAnswer}
      
      Analyze the user's answer and provide detailed feedback in the specified JSON format.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const feedbackText = result.text || '{}';
    
    // Simple cleanup if JSON is wrapped in code blocks
    const cleanedFeedbackText = feedbackText.replace(/```json\n?/, '').replace(/```/, '').trim();
    
    const feedback = JSON.parse(cleanedFeedbackText);
    res.json(feedback);
  } catch (error) {
    console.error('Practice evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate practice response' });
  }
});

// Coach Service endpoint
app.post('/api/coach/response', async (req: any, res: any) => {
  const { history } = req.body;
  
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'History array is required' });
  }

  const SYSTEM_INSTRUCTION = `
    You are Sylvia V4.2, an elite AI Career Coach for the "Interview Forge" platform. 
    Your goal is to provide high-fidelity, personalized guidance to users (like Alex) to help them master technical interviews and behavioral assessments.

    CONTEXT:
    - The user is preparing for high-stakes tech interviews.
    - You have access to their "Neural Skill Vectors" (System Architecture: 88%, Behavioral: 74%, Problem Solving: 91%, Linguistic Fluidity: 65%).
    - You should be encouraging but professional, using tech-forward and "foundry" themed language (e.g., "neural patterns", "trajectory", "forge", "synthesis").

    PROACTIVE COACHING:
    - Always analyze the user's input deeply.
    - Provide actionable advice.
    - CRITICAL: Always proactively ask 1-2 follow-up questions that guide the user deeper into their preparation or challenge their current thinking.
    - These follow-up questions should be based on their performance data (e.g., if their behavioral score is lower, ask about leadership or soft skills).

    RESPONSE FORMAT:
    You must return a JSON object with:
    1. "content": The main body of your coaching response.
    2. "followUps": An array of 1-2 proactive follow-up questions.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any, // Schema types may vary for GoogleGenAI v1.48.0 but ignoring for JSON
          properties: {
            content: { type: "STRING" },
            followUps: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["content", "followUps"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({
      content: result.content || "I'm processing your request. Let's focus on your next evolution.",
      followUps: result.followUps || []
    });
  } catch (error) {
    console.error("Coach Service Error:", error);
    res.status(500).json({
      content: "I encountered a neural desync while processing your request. Let's try re-establishing the link.",
      followUps: ["Would you like to try rephrasing your last query?", "Shall we focus on a different skill vector for now?"]
    });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
