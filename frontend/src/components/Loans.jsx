import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function Loans() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState('Loading loans...');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      loanName: '',
      lenderName: '',
      principalAmount: '',
      interestRate: '',
      monthlyInstallment: '',
      dueDate: new Date().toISOString().slice(0, 10),
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      remainingInstallments: '',
      totalPaid: '',
      status: 'Active',
      notes: '',
    },
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/loans');
      setLoans(response.data);
      setStatus(response.data.length ? '' : 'No loans configured yet.');
    } catch (error) {
      setStatus('Unable to load loans. Is the backend running?');
    }
  };

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/loans', {
        ...data,
        principalAmount: Number(data.principalAmount),
        interestRate: Number(data.interestRate || 0),
        monthlyInstallment: Number(data.monthlyInstallment),
        remainingInstallments: data.remainingInstallments ? Number(data.remainingInstallments) : undefined,
        totalPaid: data.totalPaid ? Number(data.totalPaid) : 0,
      });
      reset({
        loanName: '',
        lenderName: '',
        principalAmount: '',
        interestRate: '',
        monthlyInstallment: '',
        dueDate: new Date().toISOString().slice(0, 10),
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        remainingInstallments: '',
        totalPaid: '',
        status: 'Active',
        notes: '',
      });
      setStatus('Loan added successfully.');
      fetchLoans();
    } catch (error) {
      setStatus('Failed to add loan.');
    }
  };

  const monthlyEmi = useMemo(() => loans.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0), [loans]);
  const overdueLoans = useMemo(() => loans.filter((loan) => new Date(loan.dueDate) < new Date()).length, [loans]);

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Loan Management</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Configure recurring payments</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Track EMI, due dates, remaining installments, and payment status across all family loans.</p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-sky-500/15 to-cyan-500/10 p-6 text-white shadow-soft">
            <p className="text-sm text-slate-300">Total EMI</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(monthlyEmi)}</p>
            <p className="mt-2 text-sm text-slate-400">{overdueLoans} overdue</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Add a loan</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Loan name
                <input {...register('loanName', { required: true })} className="input-style" placeholder="Home loan, Personal loan" />
                {errors.loanName && <span className="text-rose-300">Loan name is required</span>}
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Lender
                <input {...register('lenderName')} className="input-style" placeholder="Bank or lender name" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Principal amount
                <input type="number" step="0.01" {...register('principalAmount', { required: true, min: 0 })} className="input-style" />
                {errors.principalAmount && <span className="text-rose-300">Amount is required</span>}
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Monthly installment
                <input type="number" step="0.01" {...register('monthlyInstallment', { required: true, min: 0 })} className="input-style" />
                {errors.monthlyInstallment && <span className="text-rose-300">Installment is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Interest rate
                <input type="number" step="0.01" {...register('interestRate')} className="input-style" placeholder="Optional" />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Due date
                <input type="date" {...register('dueDate', { required: true })} className="input-style" />
                {errors.dueDate && <span className="text-rose-300">Due date is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Start date
                <input type="date" {...register('startDate', { required: true })} className="input-style" />
                {errors.startDate && <span className="text-rose-300">Start date is required</span>}
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                End date
                <input type="date" {...register('endDate')} className="input-style" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Remaining installments
                <input type="number" {...register('remainingInstallments')} className="input-style" placeholder="Optional" />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Total paid
                <input type="number" step="0.01" {...register('totalPaid')} className="input-style" placeholder="Optional" />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Notes
              <textarea rows={4} {...register('notes')} className="input-style resize-none" placeholder="Optional loan remarks" />
            </label>

            <button type="submit" disabled={isSubmitting} className="button-primary w-full">Create Loan</button>
          </form>
        </div>

        <div className="glass-card rounded-[2rem] p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active loans</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Loan overview</h2>
            </div>
            <div className="status-pill">{loans.length} loans</div>
          </div>
          <div className="mt-6 space-y-3">
            {status && <p className="text-slate-400">{status}</p>}
            {loans.map((loan) => (
              <div key={loan._id} className="soft-card rounded-3xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{loan.loanName}</p>
                    <p className="mt-1 text-sm text-slate-400">{loan.lenderName || 'Unknown lender'} • Due {new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-emerald-300">{formatCurrency(loan.monthlyInstallment || 0)}</p>
                    <p className="text-sm text-slate-400">{loan.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Loans;
