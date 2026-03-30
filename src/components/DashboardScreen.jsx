import React, { useState } from 'react';
import './DashboardScreen.css';

export function DashboardScreen({ user, setUser, handleSignOut, onStartInterview }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    domain: user.domain || 'Software Engineer',
    bio: user.bio || '',
    linkedinUrl: user.linkedinUrl || '',
    githubUrl: user.githubUrl || ''
  });

  const history = user.interviewHistory || [];
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((a, b) => a + b.overallScore, 0) / history.length) 
    : 0;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.profile);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="db-root">
      <nav className="db-nav">
        <div className="db-brand">
          <span className="db-brand-text">InterviewForge</span>
          <span className="db-ai-badge">AI</span>
        </div>
        <div className="db-user-pill">
          <div className="db-avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <button className="db-signout-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>

      <main className="db-main">
        <div className="db-left-col">
          <div className="db-card db-hero-card">
            <div className="db-hero-header">
              <div>
                <h1 className="db-welcome-title">Welcome, {user.firstName}! 🔥</h1>
                <p className="db-welcome-subtitle">Ready to forge your career path in {user.domain}?</p>
              </div>
              <button className="db-start-btn" onClick={onStartInterview}>
                🎤 Start Mock Session
              </button>
            </div>

            <div className="db-stats-grid">
              <div className="db-stat-box">
                <div className="db-stat-val">{history.length}</div>
                <div className="db-stat-label">Sessions</div>
              </div>
              <div className="db-stat-box">
                <div className="db-stat-val">{avgScore}%</div>
                <div className="db-stat-label">Avg Score</div>
              </div>
              <div className="db-stat-box">
                <div className="db-stat-val">{user.domain?.split(' ')[0]}</div>
                <div className="db-stat-label">Focus</div>
              </div>
            </div>

            <div className="db-history-section">
              <h2 className="db-history-title">🕒 Recent Forgings</h2>
              <div className="db-history-list">
                {history.length === 0 ? (
                  <p style={{ color: '#92400e', textAlign: 'center', padding: '20px' }}>
                    No sessions yet. Time to start your first one!
                  </p>
                ) : (
                  history.slice().reverse().map((session, i) => (
                    <div key={i} className="db-history-item">
                      <div className="db-hi-left">
                        <div className="db-hi-role">{session.role}</div>
                        <div className="db-hi-date">{new Date(session.date).toLocaleDateString()}</div>
                      </div>
                      <div className="db-hi-score">{session.overallScore}%</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="db-right-col">
          <div className="db-card db-profile-card">
            <div className="db-profile-header">
              <h2 className="db-history-title">👤 Profile Hub</h2>
              <button className="db-edit-btn" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="db-profile-field">
                  <label className="db-field-label">Domain Focus</label>
                  <input 
                    style={{ width: '100%', background: '#1a120a', border: '1px solid #78350f', color: '#fef3c7', padding: '8px', borderRadius: '4px' }}
                    value={profileForm.domain}
                    onChange={e => setProfileForm({...profileForm, domain: e.target.value})}
                  />
                </div>
                <div className="db-profile-field">
                  <label className="db-field-label">Brief Bio</label>
                  <textarea 
                    style={{ width: '100%', background: '#1a120a', border: '1px solid #78350f', color: '#fef3c7', padding: '8px', borderRadius: '4px', height: '80px' }}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                  />
                </div>
                <div className="db-profile-field">
                  <label className="db-field-label">LinkedIn URL</label>
                  <input 
                    style={{ width: '100%', background: '#1a120a', border: '1px solid #78350f', color: '#fef3c7', padding: '8px', borderRadius: '4px' }}
                    value={profileForm.linkedinUrl}
                    onChange={e => setProfileForm({...profileForm, linkedinUrl: e.target.value})}
                  />
                </div>
                <button type="submit" className="db-start-btn" style={{ width: '100%', padding: '12px' }}>
                  Save Changes
                </button>
              </form>
            ) : (
              <>
                <div className="db-profile-field">
                  <div className="db-field-label">Domain</div>
                  <div className="db-field-val">{user.domain}</div>
                </div>
                <div className="db-profile-field">
                  <div className="db-field-label">Bio</div>
                  <div className="db-field-val">{user.bio || 'No bio added yet.'}</div>
                </div>
                <div className="db-profile-field">
                  <div className="db-field-label">Socials</div>
                  <div className="db-field-val">
                    {user.linkedinUrl ? <a href={user.linkedinUrl} target="_blank" style={{ color: '#f59e0b' }}>LinkedIn</a> : 'No links'}
                  </div>
                </div>
                <div className="db-profile-field">
                  <div className="db-field-label">Skills</div>
                  <div className="db-skills-container">
                    {user.skills?.length > 0 ? user.skills.map(s => (
                      <span key={s} className="db-skill-tag">{s}</span>
                    )) : <span style={{ color: '#92400e', fontSize: '12px' }}>Add skills to your profile</span>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
