import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';

const categories = ['Food', 'Groceries', 'Utilities', 'Education', 'Travel', 'Shopping', 'Household', 'EMI', 'Loan', 'Investment', 'Emergency', 'Other'];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [status, setStatus] = useState('Loading expenses...');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
      setStatus(response.data.length ? '' : 'No expenses recorded yet.');
    } catch (error) {
      setStatus('Unable to load expenses. Is the backend running?');
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/expenses', {
        ...data,
        amount: Number(data.amount),
      });
      reset({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' });
      setStatus('Expense added successfully.');
      fetchExpenses();
    } catch (error) {
      setStatus('Failed to add expense.');
    }
  };

  const total = useMemo(() => expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0), [expenses]);

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="hero-banner p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label">Expenses</p>
            <h2 className="page-title mt-1">Household spending</h2>
            <p className="page-subtitle mt-1">Track every payment by category and date.</p>
          </div>
          <div className="stat-card stat-card-expense shrink-0 !p-4">
            <p className="text-xs font-semibold text-pink-600">Total spent</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-950">{formatCurrency(total)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-5">
          <p className="section-label">New expense</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Title
                <input type="text" {...register('title', { required: true })} className="input-soft" placeholder="Groceries, Electricity" />
                {errors.title && <span className="text-rose-600 text-xs">Title is required</span>}
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Amount
                <input type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} className="input-soft" placeholder="0.00" />
                {errors.amount && <span className="text-rose-600 text-xs">Amount is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Category
                <select {...register('category', { required: true })} className="input-soft">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Date
                <input type="date" {...register('date', { required: true })} className="input-soft" />
                {errors.date && <span className="text-rose-600 text-xs">Date is required</span>}
              </label>
            </div>

            <label className="space-y-1.5 text-sm font-medium text-brand-800">
              Notes
              <textarea rows={4} {...register('notes')} className="input-soft resize-none" placeholder="Optional receipt notes" />
            </label>

            <button type="submit" disabled={isSubmitting} className="button-primary w-full">Add Expense</button>
          </form>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Latest payments</h3>
            <span className="status-pill">{expenses.length} items</span>
          </div>
          <div className="mt-4 space-y-2">
            {status && <p className="text-sm text-brand-600/60">{status}</p>}
            {expenses.slice(0, 6).map((expense) => (
              <div key={expense._id} className="list-row p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-950">{expense.title}</p>
                    <p className="text-xs text-brand-600/60">{expense.category} · {new Date(expense.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <p className="amount-expense text-sm">−{formatCurrency(expense.amount)}</p>
                </div>
                {expense.notes && <p className="mt-2 text-xs text-brand-600/60">{expense.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Expenses;
