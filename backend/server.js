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

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Family expense tracker API is running' });
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/loans', loanRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/family-expense-tracker')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
