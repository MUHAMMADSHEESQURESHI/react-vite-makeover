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

console.log('=== SERVER STARTUP ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('MONGO_URI:', process.env.MONGO_URI ? '***' + process.env.MONGO_URI.slice(-20) : 'NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5173 (default)');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
console.log('--- INITIATING DB CONNECTION ---');
connectDB();

// Middleware - CORS (must be before routes)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost with any port in development
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors());

// JSON parsing (must be before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (always on for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Helplytics AI API is running',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler with detailed logging
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error type:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request:', req.method, req.path);
  console.error('Request body:', req.body);

  // Mongoose specific errors
  if (err.name === 'ValidationError') {
    console.error('Mongoose Validation Error:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.keys(err.errors).map(key => err.errors[key].message),
    });
  }

  if (err.name === 'CastError') {
    console.error('Mongoose CastError (invalid ID):', err.message);
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

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Helplytics AI Server                                 ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║   Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}                    ║
║                                                           ║
║   API Endpoints:                                          ║
║   - GET    /                                              ║
║   - POST   /api/users/onboard                             ║
║   - GET    /api/users/:id                                 ║
║   - GET    /api/help-requests                             ║
║   - POST   /api/help-requests                             ║
║   - GET    /api/leaderboard                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
