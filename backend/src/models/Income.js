import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  source: { type: String, required: true, trim: true },
  earner: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  notes: { type: String, trim: true },
  paymentMode: { type: String, trim: true },
  receiptUrl: { type: String, trim: true },
}, { timestamps: true });

const Income = mongoose.model('Income', incomeSchema);
export default Income;
