import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';

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
      const response = await api.get('/loans');
      setLoans(response.data);
      setStatus(response.data.length ? '' : 'No loans configured yet.');
    } catch (error) {
      setStatus('Unable to load loans. Is the backend running?');
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/loans', {
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
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="hero-banner p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label">Loans</p>
            <h2 className="page-title mt-1">Recurring payments</h2>
            <p className="page-subtitle mt-1">Track EMI, due dates and loan status.</p>
          </div>
          <div className="stat-card stat-card-savings shrink-0 !p-4">
            <p className="text-xs font-semibold text-blue-600">Total EMI</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-950">{formatCurrency(monthlyEmi)}</p>
            {overdueLoans > 0 && <p className="mt-1 text-xs font-semibold text-rose-600">{overdueLoans} overdue</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-5">
          <p className="section-label">Add a loan</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Loan name
                <input {...register('loanName', { required: true })} className="input-soft" placeholder="Home loan, Personal loan" />
                {errors.loanName && <span className="text-rose-600 text-xs">Loan name is required</span>}
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Lender
                <input {...register('lenderName')} className="input-soft" placeholder="Bank or lender name" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Principal amount
                <input type="number" step="0.01" {...register('principalAmount', { required: true, min: 0 })} className="input-soft" />
                {errors.principalAmount && <span className="text-rose-600 text-xs">Amount is required</span>}
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Monthly installment
                <input type="number" step="0.01" {...register('monthlyInstallment', { required: true, min: 0 })} className="input-soft" />
                {errors.monthlyInstallment && <span className="text-rose-600 text-xs">Installment is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Interest rate
                <input type="number" step="0.01" {...register('interestRate')} className="input-soft" placeholder="Optional" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Due date
                <input type="date" {...register('dueDate', { required: true })} className="input-soft" />
                {errors.dueDate && <span className="text-rose-600 text-xs">Due date is required</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Start date
                <input type="date" {...register('startDate', { required: true })} className="input-soft" />
                {errors.startDate && <span className="text-rose-600 text-xs">Start date is required</span>}
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                End date
                <input type="date" {...register('endDate')} className="input-soft" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Remaining installments
                <input type="number" {...register('remainingInstallments')} className="input-soft" placeholder="Optional" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-brand-800">
                Total paid
                <input type="number" step="0.01" {...register('totalPaid')} className="input-soft" placeholder="Optional" />
              </label>
            </div>

            <label className="space-y-1.5 text-sm font-medium text-brand-800">
              Notes
              <textarea rows={4} {...register('notes')} className="input-soft resize-none" placeholder="Optional loan remarks" />
            </label>

            <button type="submit" disabled={isSubmitting} className="button-primary w-full">Create Loan</button>
          </form>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Active loans</h3>
            <span className="status-pill">{loans.length} loans</span>
          </div>
          <div className="mt-4 space-y-2">
            {status && <p className="text-sm text-brand-600/60">{status}</p>}
            {loans.map((loan) => (
              <div key={loan._id} className="list-row p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-950">{loan.loanName}</p>
                    <p className="text-xs text-brand-600/60">{loan.lenderName || 'Unknown lender'} · Due {new Date(loan.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="amount-loan text-sm">{formatCurrency(loan.monthlyInstallment || 0)}</p>
                    <p className="text-xs text-brand-500">{loan.status}</p>
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
