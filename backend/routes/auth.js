import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'supersecret_dev_key_123!',
        { expiresIn: '7d' }
    );

    res.cookie('jwt', token, {
        httpOnly: true, // prevents client side JS from accessing it
        secure: process.env.NODE_ENV === 'production', // true only in prod
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};

// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Please provide all fields' });
        }

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                first_name: firstName,
                last_name: lastName,
                email: email.toLowerCase(),
                password: hashedPassword
            }])
            .select()
            .single();

        if (error) throw error;

        generateTokenAndSetCookie(res, newUser.id);

        res.status(201).json({
            ok: true,
            user: {
                id: newUser.id,
                name: `${newUser.first_name} ${newUser.last_name}`,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        generateTokenAndSetCookie(res, user.id);

        res.json({
            ok: true,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.json({ ok: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   GET /api/auth/me
// @access  Private
router.get('/me', requireAuth, (req, res) => {
    res.json({
        ok: true,
        user: {
            id: req.user.id,
            name: `${req.user.first_name} ${req.user.last_name}`,
            email: req.user.email
        }
    });
});

// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (!user) {
            return res.json({ ok: true, message: 'If an account exists, a reset link will be sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        await supabase
            .from('users')
            .update({ 
                reset_password_token: resetToken, 
                reset_password_expires: expires 
            })
            .eq('id', user.id);

        console.log(`\n📧 [RESET PASSWORD] For: ${email}\n🔗 Token: ${resetToken}\n`);
        res.json({ ok: true, message: 'Password reset instructions sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { data: user, error } = await supabase
            .from('users')
            .select('id')
            .eq('reset_password_token', req.params.token)
            .gt('reset_password_expires', new Date().toISOString())
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await supabase
            .from('users')
            .update({
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            })
            .eq('id', user.id);

        res.json({ ok: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});

// @route   POST /api/auth/google-sync
// @access  Public
router.post('/google-sync', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        let { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is not found
            throw fetchError;
        }

        if (!user) {
            // Create user if they don't exist
            // Social users don't have a password initially, but we'll set a random one
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    first_name: firstName || 'User',
                    last_name: lastName || 'Google',
                    email: email.toLowerCase(),
                    password: hashedPassword
                }])
                .select()
                .single();

            if (insertError) throw insertError;
            user = newUser;
        }

        generateTokenAndSetCookie(res, user.id);

        res.json({
            ok: true,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Google sync error:', error);
        res.status(500).json({ error: 'Internal server error during Google sync' });
    }
});

export default router;
