import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';

const incomeSources = ['Salary', 'Farming', 'Business', 'Pension', 'Rent', 'Freelancing', 'Gift', 'Other'];
const earners = ['Father', 'Mother', 'Brother', 'Sister', 'Other'];
const paymentModes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];

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
      const response = await api.get('/incomes');
      setIncomes(response.data);
      setStatus(response.data.length ? '' : 'No income entries yet.');
    } catch (error) {
      setStatus('Unable to load incomes. Is the backend running?');
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/incomes', {
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
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="hero-banner p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label">Income</p>
            <h2 className="page-title mt-1">Track every family income</h2>
            <p className="page-subtitle mt-1">Salary, business, rent, gifts and more.</p>
          </div>
          <div className="stat-card stat-card-income shrink-0 !p-4">
            <p className="text-xs font-semibold text-brand-600">Total income</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-950">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-5">
          <p className="section-label">Add new income</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Amount
                <input type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} className="input-soft" />
                {errors.amount && <span className="text-rose-600 text-xs">Amount is required</span>}
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Date
                <input type="date" {...register('date', { required: true })} className="input-soft" />
                {errors.date && <span className="text-rose-600 text-xs">Date is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Income source
                <select {...register('source', { required: true })} className="input-soft">
                  {incomeSources.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Earned by
                <select {...register('earner', { required: true })} className="input-soft">
                  {earners.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Category
                <input type="text" {...register('category')} className="input-soft" placeholder="Salary, Business, Gift" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Payment mode
                <select {...register('paymentMode')} className="input-soft">
                  {paymentModes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-1.5 text-sm font-medium text-brand-800">
              Notes
              <textarea rows={4} {...register('notes')} className="input-soft resize-none" placeholder="Optional note about this income" />
            </label>

            <button type="submit" disabled={isSubmitting} className="button-primary w-full">Add Income</button>
          </form>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-title">Recent entries</h3>
            <span className="status-pill">{incomes.length} entries</span>
          </div>
          <div className="mt-4 space-y-2">
            {status && <p className="text-sm text-brand-600/60">{status}</p>}
            {incomes.slice(0, 6).map((entry) => (
              <div key={entry._id} className="list-row p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-950">{entry.source}</p>
                    <p className="text-xs text-brand-600/60">{entry.earner} · {new Date(entry.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <p className="amount-income text-sm">{formatCurrency(entry.amount)}</p>
                </div>
                {entry.notes && <p className="mt-2 text-xs text-brand-600/60">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Income;
