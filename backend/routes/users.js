import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @access  Private
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ok: true, profile: user });
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
        
        // Prevent password from being updated here
        if (updates.password) {
            delete updates.password;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ ok: true, profile: user });
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
            date: new Date()
        };

        const user = await User.findById(req.user._id);
        user.interviewHistory.push(newSession);
        await user.save();

        res.status(201).json({ ok: true, session: newSession });
    } catch (error) {
        console.error('Save session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
