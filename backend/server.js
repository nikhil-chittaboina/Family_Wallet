import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import expenseRoutes from './src/routes/expenses.js';
import incomeRoutes from './src/routes/incomes.js';
import loanRoutes from './src/routes/loans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/family-expense-tracker';

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://family-wallet.netlify.app',
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server tools and same-origin requests with no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    console.warn(`CORS blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Family expense tracker API is running' });
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/loans', loanRoutes);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    if (err.message?.includes('querySrv')) {
      console.error('Tip: If using mongodb+srv locally, switch to the standard connection string from Atlas (see backend/.env.example).');
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS allowed origins:', allowedOrigins.join(', '));
});
