import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  oauthLogin: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.warn('Profile fetch error:', error);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar
            });
          }
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Try to fetch profile
        let profile = await fetchProfile(session.user.id);
        
        if (!profile) {
          console.warn('⚠️ Profile missing for user. Creating recovery profile...', session.user.id);
          // Fallback: Create profile if missing (useful for migrations or external signups)
          const { data: newProfile, error: createError } = await supabase.from('users').insert({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email!,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email!)}`,
            stats: { sessions: 0, xp: 0, streak: 0, rank: 9999 }
          }).select().single();
          
          if (!createError) profile = newProfile;
        }

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar
          });
        } else {
          // If profile still missing and creation failed, at least set basic user to allow access
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'User',
            email: session.user.email || '',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Registration failed');

      // 2. Create the user profile in public.users table
      // Note: In production, this is better handled via a Supabase DB Trigger on auth.users insert
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        stats: { sessions: 0, xp: 0, streak: 0, rank: 9999 }
      });

      if (profileError && profileError.code !== '23505') { // Ignore if already exists
        console.error('Profile creation error:', profileError);
      }

      // 3. Manually set user state to avoid redirecting back to login during race condition
      setUser({
        id: data.user.id,
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      });

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const oauthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, 
      token: session?.access_token || null, 
      isAuthenticated: !!user, 
      loading,
      login, 
      register, 
      oauthLogin, 
      logout, 
      error, 
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useApi() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const authFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    return res.json();
  }, [token]);

  return authFetch;
}
