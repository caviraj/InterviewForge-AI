import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true // allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Database connection (Supabase initialized in client files)
console.log('🚀 Backend initialized (using Supabase)');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'InterviewForge API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
