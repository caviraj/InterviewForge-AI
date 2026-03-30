import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardScreen } from './components/DashboardScreen.jsx';
import { getSession, signOut } from './lib/auth.js';

// Interview flow imports
import { useInterviewState } from './hooks/useInterviewState.js';
import { RoleSelectScreen } from './components/RoleSelectScreen.jsx';
import { InterviewScreen } from './components/InterviewScreen.jsx';
import { FeedbackScreen } from './components/FeedbackScreen.jsx';
import { FinalReportScreen } from './components/FinalReportScreen.jsx';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Dashboard vs Interview active state
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
  // The custom hook that manages the entire Groq interview process
  const interviewState = useInterviewState();

  useEffect(() => {
    async function initAuth() {
      const sessionUser = await getSession();
      if (sessionUser) {
        // Fetch full profile info with history
        try {
          const res = await fetch('/api/users/profile');
          const data = await res.json();
          if (res.ok) {
            setUser(data.profile);
          } else {
            setUser(sessionUser);
          }
        } catch (e) {
          setUser(sessionUser);
        }
      }
      setIsInitializing(false);
    }
    initAuth();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setIsInterviewStarted(false);
  };

  if (isInitializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0905', color: '#f59e0b' }}>
        <p style={{ fontFamily: 'Inter', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="lp-live-dot lp-live-dot--amber"></span> Forging Session...
        </p>
      </div>
    );
  }

  // 1. If not logged in → show the login page
  if (!user) {
    return <LoginPage onAuthSuccess={setUser} />;
  }

  // 2. If the user clicked "Start Interview" → show the Groq AI interview flow
  if (isInterviewStarted) {
    // Top-right exit button to bail out of the interview early
    const ExitButton = () => (
      <button 
        onClick={() => setIsInterviewStarted(false)}
        style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: '1px solid #78350f', padding: '6px 12px', color: '#f59e0b', borderRadius: '6px', cursor: 'pointer', zIndex: 100 }}
      >
        Exit Session
      </button>
    );

    if (interviewState.screen === "role_select") {
      return <><ExitButton /><RoleSelectScreen selectRole={interviewState.selectRole} isLoading={interviewState.isLoading} /></>;
    }
    if (interviewState.screen === "interview") {
      return <><ExitButton /><InterviewScreen state={interviewState} submitAnswer={interviewState.submitAnswer} /></>;
    }
    if (interviewState.screen === "feedback") {
      return <><ExitButton /><FeedbackScreen state={interviewState} nextQuestion={interviewState.nextQuestion} generateFinalReport={interviewState.generateFinalReport} /></>;
    }
    if (interviewState.screen === "final_report") {
      return (
        <FinalReportScreen 
          state={interviewState} 
          retryInterview={() => {
            interviewState.retryInterview();
            // Optionally go back to dashboard instead of direct to role select
            setIsInterviewStarted(false);
          }} 
        />
      );
    }
  }

  // 3. User is logged in but hasn't started an interview → show Welcome Dashboard
  return (
    <DashboardScreen 
      user={user} 
      setUser={setUser}
      handleSignOut={handleSignOut} 
      onStartInterview={() => {
        interviewState.retryInterview();
        setIsInterviewStarted(true);
      }} 
    />
  );
}

export default App;
