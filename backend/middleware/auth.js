import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

export const requireAuth = async (req, res, next) => {
    // Check if token exists in cookies
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_dev_key_123!');
        
        // Find user by id in Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();
        
        if (error || !user) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }
        
        // Remove password from user object
        delete user.password;
        
        // Attach user object to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
