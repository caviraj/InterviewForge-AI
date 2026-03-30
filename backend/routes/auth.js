import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        generateTokenAndSetCookie(res, newUser._id);

        res.status(201).json({
            ok: true,
            user: {
                id: newUser._id,
                name: `${newUser.firstName} ${newUser.lastName}`,
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
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        generateTokenAndSetCookie(res, user._id);

        res.json({
            ok: true,
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
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
            id: req.user._id,
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email
        }
    });
});

export default router;
