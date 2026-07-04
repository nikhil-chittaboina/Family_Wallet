import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const categories = ['Food', 'Groceries', 'Utilities', 'Education', 'Travel', 'Shopping', 'Household', 'EMI', 'Loan', 'Investment', 'Emergency', 'Other'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

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
      const response = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(response.data);
      setStatus(response.data.length ? '' : 'No expenses recorded yet.');
    } catch (error) {
      setStatus('Unable to load expenses. Is the backend running?');
    }
  };

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/expenses', {
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
    <div className="space-y-8">
      <section className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-300/80">Expenses</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Add and review household expenses</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Use categories, dates and notes to keep every payment organized. This page scales to full expense analytics next.</p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-pink-500/15 to-rose-500/10 p-6 text-white shadow-soft">
            <p className="text-sm text-slate-300">Total spent</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(total)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">New expense</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Title
                <input type="text" {...register('title', { required: true })} className="input-style" placeholder="Groceries, Electricity" />
                {errors.title && <span className="text-rose-300">Title is required</span>}
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Amount
                <input type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} className="input-style" placeholder="0.00" />
                {errors.amount && <span className="text-rose-300">Amount is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Category
                <select {...register('category', { required: true })} className="input-style">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Date
                <input type="date" {...register('date', { required: true })} className="input-style" />
                {errors.date && <span className="text-rose-300">Date is required</span>}
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Notes
              <textarea rows={4} {...register('notes')} className="input-style resize-none" placeholder="Optional receipt notes" />
            </label>

            <button type="submit" disabled={isSubmitting} className="button-primary w-full">Add Expense</button>
          </form>
        </div>

        <div className="glass-card rounded-[2rem] p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recent expenses</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Latest payments</h2>
            </div>
            <div className="status-pill">{expenses.length} items</div>
          </div>
          <div className="mt-6 space-y-3">
            {status && <p className="text-slate-400">{status}</p>}
            {expenses.slice(0, 6).map((expense) => (
              <div key={expense._id} className="soft-card rounded-3xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{expense.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-semibold text-rose-300">-{formatCurrency(expense.amount)}</p>
                </div>
                {expense.notes && <p className="mt-3 text-sm text-slate-400">{expense.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Expenses;
