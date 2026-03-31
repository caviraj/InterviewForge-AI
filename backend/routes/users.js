import express from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to map DB record to Frontend object
const mapUser = (user) => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    domain: user.domain,
    bio: user.bio,
    linkedinUrl: user.linkedin_url,
    githubUrl: user.github_url,
    skills: user.skills || [],
    interviewHistory: user.interview_history || [],
    createdAt: user.created_at
});

// @route   GET /api/users/profile
// @access  Private
router.get('/profile', requireAuth, async (req, res) => {
    try {
        // req.user is already fetched in requireAuth
        res.json({ ok: true, profile: mapUser(req.user) });
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   PATCH /api/users/profile
// @access  Private
router.patch('/profile', requireAuth, async (req, res) => {
    try {
        const updates = req.body;
        
        // Map frontend camelCase to backend snake_case
        const dbUpdates = {};
        if (updates.firstName) dbUpdates.first_name = updates.firstName;
        if (updates.lastName)  dbUpdates.last_name  = updates.lastName;
        if (updates.domain)    dbUpdates.domain     = updates.domain;
        if (updates.bio)       dbUpdates.bio        = updates.bio;
        if (updates.linkedinUrl) dbUpdates.linkedin_url = updates.linkedinUrl;
        if (updates.githubUrl)   dbUpdates.github_url   = updates.githubUrl;
        if (updates.skills)      dbUpdates.skills       = updates.skills;

        const { data: user, error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ ok: true, profile: mapUser(user) });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   POST /api/users/sessions
// @access  Private
router.post('/sessions', requireAuth, async (req, res) => {
    try {
        const { role, overallScore, report } = req.body;

        if (!role || overallScore === undefined || !report) {
            return res.status(400).json({ error: 'Missing session data' });
        }

        const newSession = {
            role,
            overallScore,
            report,
            date: new Date().toISOString()
        };

        // Get current history
        const { data: user } = await supabase
            .from('users')
            .select('interview_history')
            .eq('id', req.user.id)
            .single();

        const updatedHistory = [...(user.interview_history || []), newSession];

        const { error: updateError } = await supabase
            .from('users')
            .update({ interview_history: updatedHistory })
            .eq('id', req.user.id);

        if (updateError) throw updateError;

        res.status(201).json({ ok: true, session: newSession });
    } catch (error) {
        console.error('Save session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
