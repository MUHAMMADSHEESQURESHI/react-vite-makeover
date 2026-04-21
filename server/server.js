import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import helpRequestRoutes from './routes/helpRequestRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============== CORS MIDDLEWARE (MUST BE FIRST) ==============
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://react-vite-makeover-2rsh.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS - return immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// ============== REQUEST LOGGING ==============
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ============== JSON PARSING ==============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============== CONNECT TO MONGODB ==============
console.log('=== SERVER STARTUP ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('MONGO_URI:', process.env.MONGO_URI ? '***' + process.env.MONGO_URI.slice(-20) : 'NOT SET');
connectDB();

// ============== HEALTH CHECK ==============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Helplytics AI API is running',
    version: '1.0.0',
  });
});

// ============== API ROUTES ==============
app.use('/api/users', userRoutes);
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/messages', messageRoutes);

// ============== 404 HANDLER ==============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============== GLOBAL ERROR HANDLER ==============
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.keys(err.errors).map(key => err.errors[key].message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Export for Vercel serverless
export default app;
