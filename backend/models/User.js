import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    role: { type: String, required: true },
    date: { type: Date, default: Date.now },
    overallScore: { type: Number, required: true },
    report: { type: Object, required: true }
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    
    // Profile features
    domain: { type: String, default: 'Software Engineer' },
    bio: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    skills: { type: [String], default: [] },
    
    // Interview tracking
    interviewHistory: [sessionSchema],
    
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
