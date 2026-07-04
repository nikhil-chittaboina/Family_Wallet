import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';
import { config } from '../config/env';

const categoryColors = ['#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#10b981'];
const categoryMap = ['Food', 'Home', 'Transport', 'Health', 'Others'];

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #ddd6fe',
  borderRadius: '12px',
  fontSize: '13px',
  boxShadow: '0 4px 16px rgba(91,33,182,0.1)',
};

function Dashboard() {
  const [expenseData, setExpenseData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/expenses').then((res) => res.data),
      api.get('/loans').then((res) => res.data).catch(() => []),
      api.get('/incomes').then((res) => res.data).catch(() => []),
    ])
      .then(([expenses, loans, incomes]) => {
        setExpenseData(expenses || []);
        setLoanData(loans || []);
        setIncomeData(incomes || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const periodOptions = useMemo(() => {
    const now = new Date();
    const options = [{ label: 'All Time', value: 'all' }];
    for (let offset = 0; offset < 12; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      options.push({
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        value: `${date.getFullYear()}-${date.getMonth()}`,
      });
    }
    return options;
  }, []);

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriod === 'all') return 'All Time';
    const [year, month] = selectedPeriod.split('-').map(Number);
    return `${monthNames[month]} ${year}`;
  }, [selectedPeriod]);

  const selectedMonth = useMemo(() => {
    if (selectedPeriod === 'all') return null;
    const [year, month] = selectedPeriod.split('-').map(Number);
    return { year, month };
  }, [selectedPeriod]);

  const filteredExpenses = useMemo(
    () => expenseData.filter((expense) => {
      if (!selectedMonth) return true;
      const date = new Date(expense.date);
      return date.getFullYear() === selectedMonth.year && date.getMonth() === selectedMonth.month;
    }),
    [expenseData, selectedMonth]
  );

  const filteredIncome = useMemo(
    () => incomeData.filter((income) => {
      if (!selectedMonth) return true;
      const date = new Date(income.date);
      return date.getFullYear() === selectedMonth.year && date.getMonth() === selectedMonth.month;
    }),
    [incomeData, selectedMonth]
  );

  const monthlyLoanObligations = useMemo(
    () => loanData.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0),
    [loanData]
  );

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + (item.amount || 0), 0),
    [filteredIncome]
  );
  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0),
    [filteredExpenses]
  );
  const balance = totalIncome - totalExpenses;
  const availableAfterLoans = balance - monthlyLoanObligations;
  const healthIndicator = useMemo(() => {
    if (availableAfterLoans >= 0) return 100;
    return Math.max(0, 100 + (availableAfterLoans / Math.max(totalIncome, 1)) * 100);
  }, [availableAfterLoans, totalIncome]);

  const recentTransactions = useMemo(() => {
    const expenses = filteredExpenses.map((item) => ({
      id: item._id,
      title: item.title,
      category: item.category,
      amount: -item.amount,
      date: item.date,
      type: 'expense',
    }));
    const incomes = filteredIncome.map((item) => ({
      id: item._id,
      title: item.source || 'Income',
      category: item.earner || 'Income',
      amount: item.amount,
      date: item.date,
      type: 'income',
    }));
    return [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [filteredExpenses, filteredIncome]);

  const expenseByCategory = useMemo(() => {
    const grouped = categoryMap.map((name) => ({ name, value: 0 }));
    filteredExpenses.forEach((item) => {
      const index = categoryMap.findIndex((category) => category.toLowerCase() === item.category?.toLowerCase());
      if (index >= 0) grouped[index].value += item.amount;
      else grouped[4].value += item.amount;
    });
    return grouped.filter((entry) => entry.value > 0);
  }, [filteredExpenses]);

  const chartData = useMemo(() => {
    if (selectedMonth) {
      const weeks = Array.from({ length: 5 }, (_, index) => ({ name: `W${index + 1}`, Income: 0, Expenses: 0 }));
      const addWeeklyValues = (item, type) => {
        const date = new Date(item.date);
        if (date.getFullYear() !== selectedMonth.year || date.getMonth() !== selectedMonth.month) return;
        const weekIndex = Math.min(4, Math.floor((date.getDate() - 1) / 7));
        weeks[weekIndex][type] += item.amount || 0;
      };
      filteredIncome.forEach((item) => addWeeklyValues(item, 'Income'));
      filteredExpenses.forEach((item) => addWeeklyValues(item, 'Expenses'));
      return weeks;
    }

    const monthly = {};
    const addMonthlyValues = (item, type) => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthly[key]) {
        monthly[key] = {
          name: monthNames[date.getMonth()],
          year: date.getFullYear(),
          month: date.getMonth(),
          Income: 0,
          Expenses: 0,
        };
      }
      monthly[key][type] += item.amount || 0;
    };
    filteredIncome.forEach((item) => addMonthlyValues(item, 'Income'));
    filteredExpenses.forEach((item) => addMonthlyValues(item, 'Expenses'));

    return Object.values(monthly)
      .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
      .slice(-12);
  }, [selectedMonth, filteredIncome, filteredExpenses, monthNames]);

  const upcomingLoans = useMemo(
    () => loanData
      .filter((loan) => new Date(loan.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3),
    [loanData]
  );

  const summaryCards = [
    { label: 'Income', value: formatCurrency(totalIncome), icon: '💸', cls: 'stat-card-income', badgeBg: 'bg-brand-600' },
    { label: 'Expenses', value: formatCurrency(totalExpenses), icon: '🛒', cls: 'stat-card-expense', badgeBg: 'bg-pink-500' },
    { label: 'Balance', value: formatCurrency(balance), icon: '💎', cls: 'stat-card-balance', badgeBg: 'bg-orange-500' },
    { label: 'Savings', value: formatCurrency(Math.max(0, availableAfterLoans)), icon: '💰', cls: 'stat-card-savings', badgeBg: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Hero */}
      <section className="hero-banner p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="page-title">
              Good Morning, {config.userName}! <span aria-hidden="true">☀️</span>
            </h2>
            <p className="page-subtitle mt-1">Let&apos;s manage your finances smartly today.</p>
            <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">Period</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-soft !w-auto !border-0 !bg-transparent !p-0 !shadow-none !ring-0 text-sm font-semibold text-brand-800"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="button-primary shrink-0">+ Add Transaction</button>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.cls}`}>
            <div className="flex items-center justify-between">
              <span className="stat-icon">{card.icon}</span>
              <span className={`stat-label ${card.badgeBg}`}>{card.label}</span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-brand-950">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-brand-600/70">{selectedPeriodLabel}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="floating-panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title">Income vs Expenses</h3>
              <p className="mt-0.5 text-xs text-brand-600/60">{selectedPeriodLabel}</p>
            </div>
            <span className="status-pill">{selectedPeriodLabel}</span>
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Income" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Expenses" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="floating-panel p-5">
          <h3 className="section-title">Expenses by Category</h3>
          <p className="mt-0.5 text-xs text-brand-600/60">{selectedPeriodLabel}</p>
          <div className="mt-2 h-[200px]">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state h-full">No expense data yet</div>
            )}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {expenseByCategory.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: categoryColors[index % categoryColors.length] }} />
                <span className="flex-1 text-xs font-medium text-brand-800">{entry.name}</span>
                <span className="text-xs font-bold text-brand-950">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transactions & Loans */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="floating-panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Recent Transactions</h3>
            <span className="status-pill">{recentTransactions.length} items</span>
          </div>
          <div className="mt-4 space-y-2">
            {isLoading ? (
              <p className="text-sm text-brand-600/60">Loading…</p>
            ) : recentTransactions.length === 0 ? (
              <div className="empty-state">No transactions for {selectedPeriodLabel}</div>
            ) : (
              recentTransactions.map((item) => (
                <div key={item.id} className="list-row flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${item.type === 'income' ? 'bg-green-100' : 'bg-pink-100'}`}>
                      {item.type === 'income' ? '↑' : '↓'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-950">{item.title}</p>
                      <p className="text-xs text-brand-600/60">{item.category} · {new Date(item.date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${item.amount < 0 ? 'amount-expense' : 'amount-income'}`}>
                    {item.amount < 0 ? '−' : '+'}{formatCurrency(Math.abs(item.amount))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="floating-panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Upcoming Loan Payments</h3>
            <span className="status-pill">{upcomingLoans.length} due</span>
          </div>
          <div className="mt-4 space-y-2">
            {upcomingLoans.length ? upcomingLoans.map((loan) => (
              <div key={loan._id} className="list-row flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-semibold text-brand-950">{loan.loanName}</p>
                  <p className="text-xs text-brand-600/60">Due {new Date(loan.dueDate).toLocaleDateString('en-IN')}</p>
                </div>
                <p className="amount-loan text-sm">{formatCurrency(loan.monthlyInstallment || 0)}</p>
              </div>
            )) : (
              <div className="empty-state">
                <span className="text-2xl">🏦</span>
                <p className="mt-2">No upcoming loan payments</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Monthly summary */}
      <section className="floating-panel p-5">
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h3 className="section-title">Monthly Summary</h3>
            <p className="mt-0.5 text-xs text-brand-600/60">{selectedPeriodLabel}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Income', value: formatCurrency(totalIncome), cls: 'amount-income' },
                { label: 'Expenses', value: formatCurrency(totalExpenses), cls: 'amount-expense' },
                { label: 'Loans', value: formatCurrency(monthlyLoanObligations), cls: 'amount-loan' },
                { label: 'Remaining', value: formatCurrency(availableAfterLoans), cls: availableAfterLoans >= 0 ? 'amount-income' : 'amount-expense' },
              ].map((item) => (
                <div key={item.label} className="summary-mini">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">{item.label}</p>
                  <p className={`mt-2 text-xl font-extrabold ${item.cls}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-mini flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-600">Financial Health</p>
              <p className="mt-2 text-sm font-bold leading-snug text-brand-950">
                {availableAfterLoans >= 0
                  ? `You're ahead for ${selectedPeriodLabel}!`
                  : `Watch spending for ${selectedPeriodLabel}.`}
              </p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-600/60">Score</span>
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">{Math.round(healthIndicator)}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, healthIndicator))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
