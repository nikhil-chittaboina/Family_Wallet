import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const categoryColors = ['#a78bfa', '#f59e0b', '#34d399', '#38bdf8', '#f472b6'];
const categoryMap = ['Food', 'Home', 'Transport', 'Health', 'Others'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function Dashboard() {
  const [expenseData, setExpenseData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/expenses').then((res) => res.json()),
      fetch('http://localhost:5000/api/loans').then((res) => res.json()).catch(() => []),
      fetch('http://localhost:5000/api/incomes').then((res) => res.json()).catch(() => []),
    ])
      .then(([expenses, loans, incomes]) => {
        setExpenseData(expenses || []);
        setLoanData(loans || []);
        setIncomeData(incomes || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const currentMonthExpenses = useMemo(() => expenseData.filter((expense) => new Date(expense.date).getMonth() === new Date().getMonth()), [expenseData]);
  const currentMonthIncome = useMemo(() => incomeData.filter((income) => new Date(income.date).getMonth() === new Date().getMonth()), [incomeData]);
  const monthlyLoanObligations = useMemo(() => loanData.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0), [loanData]);

  const totalIncome = useMemo(() => currentMonthIncome.reduce((sum, item) => sum + (item.amount || 0), 0), [currentMonthIncome]);
  const totalExpenses = useMemo(() => currentMonthExpenses.reduce((sum, item) => sum + (item.amount || 0), 0), [currentMonthExpenses]);
  const balance = totalIncome - totalExpenses;
  const availableAfterLoans = balance - monthlyLoanObligations;
  const healthIndicator = useMemo(() => {
    if (availableAfterLoans >= 0) return 100;
    return Math.max(0, 100 + (availableAfterLoans / Math.max(totalIncome, 1)) * 100);
  }, [availableAfterLoans, totalIncome]);

  const recentTransactions = useMemo(() => {
    const expenses = currentMonthExpenses.map((item) => ({
      id: item._id,
      title: item.title,
      category: item.category,
      amount: -item.amount,
      date: item.date,
      type: 'expense',
    }));
    const incomes = currentMonthIncome.map((item) => ({
      id: item._id,
      title: item.source || 'Income',
      category: item.earner || 'Family',
      amount: item.amount,
      date: item.date,
      type: 'income',
    }));
    return [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [currentMonthExpenses, currentMonthIncome]);

  const expenseByCategory = useMemo(() => {
    const grouped = categoryMap.map((name) => ({ name, value: 0 }));
    currentMonthExpenses.forEach((item) => {
      const index = categoryMap.findIndex((category) => category.toLowerCase() === item.category?.toLowerCase());
      if (index >= 0) grouped[index].value += item.amount;
      else grouped[4].value += item.amount;
    });
    return grouped.filter((entry) => entry.value > 0);
  }, [currentMonthExpenses]);

  const upcomingLoans = useMemo(() => loanData
    .filter((loan) => new Date(loan.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3), [loanData]);

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/10 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300/80">Dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Good Morning, Mia! <span className="text-amber-300">🌞</span></h1>
            <p className="mt-3 max-w-2xl text-slate-300">Let’s manage your finances smartly today. Track income, expenses, loans, and savings from one beautiful place.</p>
          </div>
          <button className="button-primary">+ Add Transaction</button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        {[{
          label: 'Total Income', value: formatCurrency(totalIncome), delta: '+12.5% this month', accent: 'from-violet-500 to-indigo-500'
        }, {
          label: 'Total Expenses', value: formatCurrency(totalExpenses), delta: '-8.4% this month', accent: 'from-pink-500 to-red-500'
        }, {
          label: 'Balance', value: formatCurrency(balance), delta: '+18.2% this month', accent: 'from-emerald-500 to-teal-500'
        }, {
          label: 'Savings', value: formatCurrency(Math.max(0, availableAfterLoans)), delta: '+16.6% this month', accent: 'from-sky-500 to-cyan-500'
        }].map((card) => (
          <div key={card.label} className="glass-card rounded-[2rem] p-6">
            <div className={`mb-4 inline-flex rounded-3xl bg-gradient-to-r ${card.accent} bg-clip-text p-1 text-transparent text-sm font-semibold`}>{card.label}</div>
            <p className="text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-3 text-sm text-slate-400">{card.delta}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Income vs Expenses</h2>
              <p className="mt-2 text-sm text-slate-400">Monthly trend comparison provides a quick view of cash flow.</p>
            </div>
            <div className="status-pill">This Month</div>
          </div>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Week 1', Income: 12000, Expenses: 8900 },
                { name: 'Week 2', Income: 14500, Expenses: 10200 },
                { name: 'Week 3', Income: 13200, Expenses: 11200 },
                { name: 'Week 4', Income: 15800, Expenses: 11800 },
              ]}>
                <Bar dataKey="Income" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ec4899" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Expenses by Category</h2>
            <p className="mt-2 text-sm text-slate-400">See which categories are using the most budget.</p>
          </div>
          <div className="mt-8 flex h-[300px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={4}>
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {expenseByCategory.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="soft-card rounded-3xl p-4">
                <p className="text-sm text-slate-400">{entry.name}</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(entry.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
              <p className="mt-2 text-sm text-slate-400">A quick snapshot of the latest incomes and expenses.</p>
            </div>
            <div className="status-pill">{recentTransactions.length} items</div>
          </div>
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <p className="text-slate-400">Loading transactions…</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-slate-400">No recent transactions this month.</p>
            ) : (
              recentTransactions.map((item) => (
                <div key={item.id} className="soft-card flex items-center justify-between gap-4 rounded-3xl p-4">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.category} • {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`text-sm font-semibold ${item.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{item.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Upcoming Loan Payments</h2>
              <p className="mt-2 text-sm text-slate-400">Stay ahead of your EMI schedule.</p>
            </div>
            <div className="status-pill">{upcomingLoans.length} due</div>
          </div>
          <div className="space-y-3">
            {upcomingLoans.length ? upcomingLoans.map((loan) => (
              <div key={loan._id} className="soft-card rounded-3xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{loan.loanName}</p>
                    <p className="mt-1 text-sm text-slate-400">Due {new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-semibold text-emerald-300">{formatCurrency(loan.monthlyInstallment || 0)}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-400">No loan payments are scheduled for later this month.</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] p-8">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <h2 className="text-xl font-semibold text-white">Monthly Summary</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Income', value: formatCurrency(totalIncome), color: 'text-emerald-300' },
                { label: 'Expenses', value: formatCurrency(totalExpenses), color: 'text-rose-300' },
                { label: 'Loans', value: formatCurrency(monthlyLoanObligations), color: 'text-sky-300' },
                { label: 'Remaining', value: formatCurrency(availableAfterLoans), color: availableAfterLoans >= 0 ? 'text-emerald-300' : 'text-rose-300' },
              ].map((item) => (
                <div key={item.label} className="soft-card rounded-[1.75rem] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className={`mt-4 text-2xl font-semibold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="soft-card rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Financial Health</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{availableAfterLoans >= 0 ? 'Good job! You’re managing well.' : 'Watch your spending this month.'}</h3>
              </div>
              <div className="text-right text-sm text-slate-400">{Math.round(healthIndicator)}%</div>
            </div>
            <div className="mt-8 h-5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500" style={{ width: `${Math.min(100, Math.max(0, healthIndicator))}%` }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
