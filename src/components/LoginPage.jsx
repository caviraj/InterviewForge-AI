import { useEffect, useRef, useState } from 'react';
import './LoginPage.css';
import { signIn, signUp, forgotPassword } from '../lib/auth.js';

/* ── Interview scene content ─────────────────────────────── */
const QUESTIONS = [
  'Tell me about a time you led a difficult project.',
  'How do you handle conflicting priorities at work?',
  'Describe the hardest bug you ever debugged.',
  'Why do you want to join this company specifically?',
  "What's your approach to giving and receiving feedback?",
];
const ANSWERS = [
  'In my last role I coordinated a cross-functional migration across 6 teams while maintaining zero downtime…',
  'I map tasks to urgency and impact. I communicate blockers early and renegotiate scope when needed…',
  'A memory leak in production on Black Friday. Heap snapshots led me to a closure holding DOM references…',
  'Your engineering culture of radical ownership aligns with how I work. I want to own problems end-to-end…',
  'Feedback is a gift. I prefer real-time, specific, behavior-focused feedback over annual review cycles…',
];

function GoogleIcon() {
  return (
    <svg className="lp-google-icon" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.65 4.58 1.7l3.4-3.4A11.8 11.8 0 0 0 12 .9C8 .9 4.55 3.03 2.73 6.24l2.54 3.52z"/>
      <path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.9 0-5.39-1.74-6.6-4.27l-2.56 3.47C4.63 21.1 8.08 23.1 12 23.1c2.96 0 5.66-1 7.73-2.72l-3.69-2.37z"/>
      <path fill="#4A90D9" d="M19.73 20.38C21.9 18.3 23.1 15.26 23.1 12c0-.74-.08-1.45-.2-2.14H12v4.55h6.23a5.32 5.32 0 0 1-2.19 3.47l3.69 2.5z"/>
      <path fill="#FBBC05" d="M5.4 14.83A7.1 7.1 0 0 1 4.9 12c0-.99.17-1.94.5-2.83L2.73 5.65A11.9 11.9 0 0 0 .9 12c0 1.9.42 3.7 1.18 5.29l3.32-2.46z"/>
    </svg>
  );
}

function Waveform({ active, color }) {
  const heights = [4, 10, 16, 22, 16, 26, 18, 12, 22, 8, 18, 26, 14, 20, 10];
  return (
    <div className="lp-waveform">
      {heights.map((h, i) => (
        <span key={i} className={`lp-wave-bar ${active ? 'lp-wave-bar--active' : ''}`}
          style={{ '--h': `${h}px`, '--delay': `${i * 0.07}s`, '--color': color }} />
      ))}
    </div>
  );
}

export function LoginPage({ onAuthSuccess }) {
  const canvasRef  = useRef(null);
  const taglineRef = useRef(null);
  const formViewRef = useRef(null);

  const [mode, setMode]         = useState('login');
  const [animKey, setAnimKey]   = useState(0);
  const [slideDir, setSlideDir] = useState('');

  // Form fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [agreed, setAgreed]       = useState(false);

  const [pwVisible, setPwVisible]   = useState(false);
  const [pw2Visible, setPw2Visible] = useState(false);

  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Interview scene
  const [qIdx, setQIdx]       = useState(0);
  const [qText, setQText]     = useState('');
  const [aText, setAText]     = useState('');
  const [speaking, setSpeaking] = useState('ai');

  /* ── Interview scene rotation ─────────────────────────── */
  useEffect(() => {
    let qi = 0;
    let qTimer, aTimer, cycleTimer;

    const typeText = (str, setter, onDone, speed = 34) => {
      let i = 0;
      return setInterval(() => {
        i++;
        setter(str.slice(0, i));
        if (i >= str.length) { onDone(); }
      }, speed);
    };

    const runCycle = () => {
      qi = (qi + 1) % QUESTIONS.length;
      setQIdx(qi); setSpeaking('ai'); setQText(''); setAText('');
      qTimer = typeText(QUESTIONS[qi], setQText, () => {
        clearInterval(qTimer);
        aTimer = setTimeout(() => {
          setSpeaking('human');
          const at = typeText(ANSWERS[qi], setAText, () => {
            clearInterval(at);
            cycleTimer = setTimeout(runCycle, 3200);
          }, 26);
        }, 1100);
      }, 38);
    };

    // Initial
    setQText(QUESTIONS[0]);
    const initTimer = setTimeout(() => {
      setSpeaking('human');
      const at = typeText(ANSWERS[0], setAText, () => {
        clearInterval(at);
        cycleTimer = setTimeout(runCycle, 3200);
      }, 26);
    }, 1400);

    return () => {
      clearInterval(qTimer); clearTimeout(aTimer);
      clearTimeout(cycleTimer); clearTimeout(initTimer);
    };
  }, []);

  /* ── Typewriter tagline ───────────────────────────────── */
  useEffect(() => {
    const texts = {
      login:  'Your next offer is one session away',
      signup: 'Join 50,000+ engineers who got hired',
      forgot: 'Enter your email to restore access',
    };
    const el = taglineRef.current;
    if (!el) return;
    el.innerHTML = '<span class="lp-cursor"></span>';
    let i = 0, timer;
    const type = () => {
      if (i <= texts[mode].length) {
        el.innerHTML = texts[mode].slice(0, i) + '<span class="lp-cursor"></span>';
        i++;
        timer = setTimeout(type, 52);
      }
    };
    const d = setTimeout(type, 300);
    return () => { clearTimeout(d); clearTimeout(timer); };
  }, [mode]);

  /* ── Spark canvas ─────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    class Spark {
      constructor() { this.reset(); }
      reset() {
        const cx = window.innerWidth / 2;
        const ay = window.innerHeight / 2 - 110;
        this.x = cx + (Math.random() - 0.5) * 44;
        this.y = ay + 18;
        this.vx = (Math.random() - 0.5) * 2.8;
        this.vy = -(Math.random() * 2.6 + 1.2);
        this.life = 1; this.decay = Math.random() * 0.024 + 0.015;
        this.size = Math.random() * 1.8 + 0.7;
        this.color = Math.random() > 0.45 ? '#f59e0b' : '#fde68a';
      }
      update() { this.x += this.vx; this.y += this.vy; this.vy += 0.07; this.vx *= 0.97; this.life -= this.decay; if (this.life <= 0) this.reset(); }
      draw() { ctx.save(); ctx.globalAlpha = this.life * 0.8; ctx.fillStyle = this.color; ctx.shadowBlur = 5; ctx.shadowColor = '#f59e0b'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    }
    const sparks = Array.from({ length: 28 }, () => new Spark());
    const go = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); sparks.forEach(s => { s.update(); s.draw(); }); animId = requestAnimationFrame(go); };
    go();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  /* ── Mode switch ──────────────────────────────────────── */
  const switchMode = (next) => {
    if (next === mode) return;
    setSlideDir(next === 'signup' ? 'right' : 'left');
    setMode(next);
    setAnimKey(k => k + 1);
    setEmail(''); setPassword(''); setPassword2('');
    setFirstName(''); setLastName(''); setAgreed(false);
    setPwVisible(false); setPw2Visible(false);
    setBtnState('idle'); setErrorMsg('');
    // Reset scroll position of form viewport
    if (formViewRef.current) formViewRef.current.scrollTop = 0;
  };

  /* ── Real sign-in ─────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) { setErrorMsg('Please fill in all fields.'); return; }
    setBtnState('loading');
    
    const result = await signIn({ email, password });
    if (result.ok) {
        setBtnState('success');
        setTimeout(() => onAuthSuccess?.(result.user), 800);
    } else {
        setBtnState('error');
        setErrorMsg(result.error);
        setTimeout(() => setBtnState('idle'), 2000);
    }
  };

  /* ── Real sign-up ─────────────────────────────────────── */
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!firstName || !lastName) { setErrorMsg('Please enter your first and last name.'); return; }
    if (!email)    { setErrorMsg('Please enter your email.'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    if (password !== password2) { setErrorMsg('Passwords do not match.'); return; }
    if (!agreed)   { setErrorMsg('Please accept the Terms & Privacy Policy.'); return; }
    setBtnState('loading');
    
    const result = await signUp({ firstName, lastName, email, password });
    if (result.ok) {
        setBtnState('success');
        setTimeout(() => onAuthSuccess?.(result.user), 800);
    } else {
        setBtnState('error');
        setErrorMsg(result.error);
        setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  /* ── Forgot Password Logic ─────────────────────────────── */
  const handleForgot = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) { setErrorMsg('Please enter your email.'); return; }
    setBtnState('loading');

    const result = await forgotPassword(email);
    if (result.ok) {
      setBtnState('success');
      setErrorMsg(''); // clear error if any
      // Show success message within the form or as a popup
    } else {
      setBtnState('error');
      setErrorMsg(result.error);
      setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  const loginLabel  = btnState === 'loading' ? '⟳  Signing in...'        : btnState === 'success' ? '✓  Welcome back!'          : '🔥\u00a0\u00a0Ignite Your Prep';
  const signupLabel = btnState === 'loading' ? '⟳  Creating account...'  : btnState === 'success' ? '✓  Account created!'       : '⚡\u00a0\u00a0Forge My Account';
  const forgotLabel = btnState === 'loading' ? '⟳  Sending...'            : btnState === 'success' ? '✓  Instructions Sent!'      : '📨\u00a0\u00a0Send Reset Link';

  const btnStyle =
    btnState === 'success' ? { background: 'linear-gradient(135deg,#16a34a,#15803d)' } :
    btnState === 'error'   ? { background: 'linear-gradient(135deg,#dc2626,#991b1b)' } :
    btnState === 'loading' ? { opacity: 0.8 } : {};

  const formClass = `lp-form-panel lp-slide-${slideDir || 'initial'}`;

  return (
    <div className="lp-root">
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />
      <canvas ref={canvasRef} className="lp-spark-canvas" />
      <svg className="lp-crack-layer" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <path className="lp-crack-line lp-cl-1" d="M0,900 Q200,860 350,920 Q500,980 700,910 Q900,840 1100,900 Q1300,960 1500,880 Q1700,800 1920,870"/>
        <path className="lp-crack-line lp-cl-2" d="M100,1080 Q250,1020 400,1050 Q550,1080 750,1000 Q950,920 1200,980 Q1400,1040 1600,960 Q1800,880 1920,940"/>
      </svg>

      {/* TOP BAR */}
      <div className="lp-top-bar">
        <div className="lp-brand-mini">
          <span className="lp-brand-interview">Interview</span>
          <span className="lp-brand-forge">Forge</span>
          <span className="lp-brand-ai"> AI</span>
          <span className="lp-brand-glow" aria-hidden="true">InterviewForge AI</span>
        </div>
        <div className="lp-proof-badge">🔥 50K+ Offers Landed</div>
      </div>

      {/* 3-COLUMN LAYOUT */}
      <div className="lp-layout">

        {/* ── LEFT: CANDIDATE ────────────────────────── */}
        <div className="lp-side-panel lp-candidate-panel">
          <div className="lp-panel-label lp-panel-label--blue">
            <span className="lp-live-dot lp-live-dot--blue" /> You — Candidate
          </div>
          <div className="lp-avatar-wrap">
            <div className="lp-avatar-ring lp-avatar-ring--blue">
              <img src="/candidate.png" alt="Candidate" className="lp-avatar-img" />
            </div>
            <div className={`lp-avatar-status ${speaking === 'human' ? 'lp-avatar-status--active' : ''}`}>
              {speaking === 'human' ? '🎙 Answering...' : '⏸ Listening'}
            </div>
          </div>
          <div className={`lp-speech-bubble lp-speech-bubble--blue ${speaking === 'human' ? 'lp-speech-bubble--visible' : 'lp-speech-bubble--dim'}`}>
            <p className="lp-speech-text">{aText || ANSWERS[qIdx]}<span className="lp-cursor lp-cursor--blue" /></p>
          </div>
          <Waveform active={speaking === 'human'} color="var(--teal)" />
          <div className="lp-stats">
            <span className="lp-stat-chip lp-stat-chip--blue">🎯 87% Offer Rate</span>
            <span className="lp-stat-chip lp-stat-chip--blue">⚡ Real-Time Feedback</span>
          </div>
        </div>

        {/* ── CENTER: AUTH CARD ──────────────────────── */}
        <div className="lp-center-col">
          <div className="lp-anvil-wrapper">
            <div className="lp-anvil-glow-ring" />
            <svg className="lp-anvil-svg" viewBox="0 0 110 80" fill="none">
              <polygon points="15,55 95,55 85,75 25,75" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5"/>
              <rect x="10" y="32" width="90" height="25" rx="4" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="1.5"/>
              <path d="M10,44 Q-5,44 5,38 L10,38 Z" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="1.2"/>
              <line x1="12" y1="35" x2="98" y2="35" stroke="rgba(253,230,138,0.5)" strokeWidth="1"/>
              <line x1="25" y1="55" x2="30" y2="75" stroke="rgba(245,158,11,0.3)" strokeWidth="0.8"/>
              <line x1="55" y1="55" x2="55" y2="75" stroke="rgba(245,158,11,0.3)" strokeWidth="0.8"/>
              <line x1="85" y1="55" x2="80" y2="75" stroke="rgba(245,158,11,0.3)" strokeWidth="0.8"/>
            </svg>
          </div>

          <div className="lp-auth-card">
            <div className="lp-logo-row">
              <div className="lp-logo-text">InterviewForge</div>
              <div className="lp-ai-badge">AI</div>
            </div>
            <div className="lp-tagline" ref={taglineRef}><span className="lp-cursor" /></div>

            <div className="lp-tabs" role="tablist">
              <button role="tab" aria-selected={mode === 'login'}
                className={`lp-tab ${mode === 'login' ? 'lp-tab--active' : ''}`}
                onClick={() => switchMode('login')} type="button">Sign In</button>
              <button role="tab" aria-selected={mode === 'signup'}
                className={`lp-tab ${mode === 'signup' ? 'lp-tab--active' : ''}`}
                onClick={() => switchMode('signup')} type="button">Create Account</button>
              <div className={`lp-tab-indicator ${mode === 'signup' ? 'lp-tab-indicator--right' : mode === 'forgot' ? 'lp-tab-indicator--hidden' : ''}`} />
            </div>

            {/* Success banner for forgot mode */}
            {mode === 'forgot' && btnState === 'success' && (
              <div className="lp-success-banner" role="alert">
                ✓ Check your console for the reset token! 
                <button onClick={() => switchMode('login')} className="lp-back-text">Back to Sign In</button>
              </div>
            )}

            {/* Error banner */}
            {errorMsg && (
              <div className="lp-error-banner" role="alert">⚠ {errorMsg}</div>
            )}

            <div className="lp-form-viewport" ref={formViewRef}>
              <div key={animKey} className={formClass}>

                {mode === 'login' && (
                  <form onSubmit={handleLogin} autoComplete="on" noValidate>
                    <div className="lp-field">
                      <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder=" " autoComplete="email" required />
                      <label htmlFor="email">Email address</label>
                    </div>
                    <div className="lp-field">
                      <input type={pwVisible ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder=" " autoComplete="current-password" required />
                      <label htmlFor="password">Password</label>
                      <button type="button" className="lp-eye-btn" onClick={() => setPwVisible(v => !v)}>{pwVisible ? '🙈' : '👁'}</button>
                    </div>
                    <button type="button" className="lp-forgot" onClick={() => switchMode('forgot')}>Forgot password?</button>
                    <button type="submit" id="ignite-btn" className="lp-ignite-btn" style={btnStyle} disabled={btnState !== 'idle'}>{loginLabel}</button>
                    <div className="lp-divider"><span>or</span></div>
                    <button className="lp-google-btn" type="button"><GoogleIcon /> Continue with Google</button>
                    <div className="lp-switch-row">
                      No account yet?
                      <button type="button" className="lp-switch-link" onClick={() => switchMode('signup')}>Create one free →</button>
                    </div>
                  </form>
                )}

                {mode === 'signup' && (
                  <form onSubmit={handleSignup} autoComplete="on" noValidate>
                    <div className="lp-field-row">
                      <div className="lp-field">
                        <input type="text" id="first-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder=" " autoComplete="given-name" required />
                        <label htmlFor="first-name">First name</label>
                      </div>
                      <div className="lp-field">
                        <input type="text" id="last-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder=" " autoComplete="family-name" required />
                        <label htmlFor="last-name">Last name</label>
                      </div>
                    </div>
                    <div className="lp-field">
                      <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} placeholder=" " autoComplete="email" required />
                      <label htmlFor="signup-email">Work / personal email</label>
                    </div>
                    <div className="lp-field">
                      <input type={pwVisible ? 'text' : 'password'} id="signup-pw" value={password} onChange={e => setPassword(e.target.value)} placeholder=" " autoComplete="new-password" required />
                      <label htmlFor="signup-pw">Create password</label>
                      <button type="button" className="lp-eye-btn" onClick={() => setPwVisible(v => !v)}>{pwVisible ? '🙈' : '👁'}</button>
                    </div>
                    <div className="lp-field">
                      <input type={pw2Visible ? 'text' : 'password'} id="signup-pw2" value={password2} onChange={e => setPassword2(e.target.value)} placeholder=" " autoComplete="new-password" required />
                      <label htmlFor="signup-pw2">Confirm password</label>
                      <button type="button" className="lp-eye-btn" onClick={() => setPw2Visible(v => !v)}>{pw2Visible ? '🙈' : '👁'}</button>
                    </div>
                    <div className="lp-terms-row">
                      <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                      <label htmlFor="terms" className="lp-terms-label">
                        I agree to the <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
                      </label>
                    </div>
                    <button type="submit" className="lp-ignite-btn lp-signup-btn" style={btnStyle} disabled={btnState !== 'idle'}>{signupLabel}</button>
                    <div className="lp-divider"><span>or</span></div>
                    <button className="lp-google-btn" type="button"><GoogleIcon /> Sign up with Google</button>
                    <div className="lp-switch-row">
                      Already have an account?
                      <button type="button" className="lp-switch-link" onClick={() => switchMode('login')}>Sign in →</button>
                    </div>
                  </form>
                )}

                {mode === 'forgot' && (
                  <form onSubmit={handleForgot} noValidate>
                    <div className="lp-field">
                      <input type="email" id="forgot-email" value={email} onChange={e => setEmail(e.target.value)} placeholder=" " autoComplete="email" required />
                      <label htmlFor="forgot-email">Recovery email</label>
                    </div>
                    <button type="submit" className="lp-ignite-btn" style={btnStyle} disabled={btnState !== 'idle'}>{forgotLabel}</button>
                    <div className="lp-switch-row">
                      Remembered?
                      <button type="button" className="lp-switch-link" onClick={() => switchMode('login')}>Back to Sign In →</button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: AI INTERVIEWER ──────────────────── */}
        <div className="lp-side-panel lp-ai-panel">
          <div className="lp-panel-label lp-panel-label--amber">
            <span className="lp-live-dot lp-live-dot--amber" /> AI Interviewer
          </div>
          <div className="lp-avatar-wrap">
            <div className="lp-avatar-ring lp-avatar-ring--amber">
              <img src="/ai-interviewer.png" alt="AI Interviewer" className="lp-avatar-img" />
            </div>
            <div className={`lp-avatar-status lp-avatar-status--amber ${speaking === 'ai' ? 'lp-avatar-status--active' : ''}`}>
              {speaking === 'ai' ? '🔴 Asking...' : '✅ Analysing'}
            </div>
          </div>
          <div className={`lp-speech-bubble lp-speech-bubble--amber ${speaking === 'ai' ? 'lp-speech-bubble--visible' : 'lp-speech-bubble--dim'}`}>
            <p className="lp-speech-text">
              {qText || QUESTIONS[qIdx]}{speaking === 'ai' && <span className="lp-cursor" />}
            </p>
          </div>
          <Waveform active={speaking === 'ai'} color="var(--amber)" />
          <div className="lp-stats">
            <span className="lp-stat-chip lp-stat-chip--amber">🏆 Google · Meta · Amazon</span>
            <span className="lp-stat-chip lp-stat-chip--amber">Q {qIdx + 1}&thinsp;/&thinsp;{QUESTIONS.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
