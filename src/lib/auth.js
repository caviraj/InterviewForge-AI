/**
 * Real Express backend-based auth for InterviewForge AI.
 * Replaces localStorage mock.
 */

// Global config
const API_BASE = '/api/auth';

/** Returns { ok: true, user } or { ok: false, error: string } */
export async function signUp({ firstName, lastName, email, password }) {
    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error || 'Sign up failed' };
        return { ok: true, user: data.user };
    } catch (error) {
        return { ok: false, error: 'Network error during sign up' };
    }
}

/** Returns { ok: true, user } or { ok: false, error: string } */
export async function signIn({ email, password }) {
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error || 'Sign in failed' };
        return { ok: true, user: data.user };
    } catch (error) {
        return { ok: false, error: 'Network error during sign in' };
    }
}

/** Returns the logged-in user object or null */
export async function getSession() {
    try {
        const res = await fetch(`${API_BASE}/me`);
        const data = await res.json();
        if (!res.ok) return null;
        return data.user;
    } catch (error) {
        return null; // session check failed
    }
}

export async function signOut() {
    try {
        await fetch(`${API_BASE}/logout`, { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
}
