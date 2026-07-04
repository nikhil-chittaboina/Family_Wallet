import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  loanName: { type: String, required: true, trim: true },
  lenderName: { type: String, trim: true },
  principalAmount: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, min: 0 },
  monthlyInstallment: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  remainingInstallments: { type: Number, min: 0 },
  totalPaid: { type: Number, default: 0, min: 0 },
  status: { type: String, trim: true, default: 'Active' },
  notes: { type: String, trim: true },
}, { timestamps: true });

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;
