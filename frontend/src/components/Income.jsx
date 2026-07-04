import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const incomeSources = ['Salary', 'Farming', 'Business', 'Pension', 'Rent', 'Freelancing', 'Gift', 'Other'];
const earners = ['Father', 'Mother', 'Brother', 'Sister', 'Other'];
const paymentModes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function Income() {
  const [incomes, setIncomes] = useState([]);
  const [status, setStatus] = useState('Loading incomes...');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      source: 'Salary',
      earner: 'Father',
      category: 'Salary',
      paymentMode: 'Cash',
      notes: '',
    },
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/incomes');
      setIncomes(response.data);
      setStatus(response.data.length ? '' : 'No income entries yet.');
    } catch (error) {
      setStatus('Unable to load incomes. Is the backend running?');
    }
  };

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/incomes', {
        ...data,
        amount: Number(data.amount),
      });
      reset({
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        source: 'Salary',
        earner: 'Father',
        category: 'Salary',
        paymentMode: 'Cash',
        notes: '',
      });
      setStatus('Income added successfully.');
      fetchIncomes();
    } catch (error) {
      setStatus('Failed to add income.');
    }
  };

  const totalIncome = useMemo(() => incomes.reduce((sum, entry) => sum + (entry.amount || 0), 0), [incomes]);

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300/80">Income Management</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Track every family income</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Add earnings from salary, business, freelancing, rent, gifts, and more. Income entries are searchable and ready for analytics.</p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-violet-500/15 to-sky-500/10 p-6 text-white shadow-soft">
            <p className="text-sm text-slate-300">Monthly income</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Add new income</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Amount
                <input type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} className="input-style" />
                {errors.amount && <span className="text-rose-300">Amount is required</span>}
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Date
                <input type="date" {...register('date', { required: true })} className="input-style" />
                {errors.date && <span className="text-rose-300">Date is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Income source
                <select {...register('source', { required: true })} className="input-style">
                  {incomeSources.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Earned by
                <select {...register('earner', { required: true })} className="input-style">
                  {earners.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Category
                <input type="text" {...register('category')} className="input-style" placeholder="Salary, Business, Gift" />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Payment mode
                <select {...register('paymentMode')} className="input-style">
                  {paymentModes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Notes
              <textarea rows={4} {...register('notes')} className="input-style resize-none" placeholder="Optional note about this income" />
            </label>

            <button type="submit" disabled={isSubmitting} className="button-primary w-full text-center">Add Income</button>
          </form>
        </div>

        <div className="glass-card rounded-[2rem] p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Latest income</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Recent entries</h2>
            </div>
            <div className="status-pill">{incomes.length} entries</div>
          </div>
          <div className="mt-6 space-y-3">
            {status && <p className="text-slate-400">{status}</p>}
            {incomes.slice(0, 6).map((entry) => (
              <div key={entry._id} className="soft-card rounded-3xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{entry.source}</p>
                    <p className="mt-1 text-sm text-slate-400">{entry.earner} • {new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-semibold text-emerald-300">{formatCurrency(entry.amount)}</p>
                </div>
                {entry.notes && <p className="mt-3 text-sm text-slate-400">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Income;
