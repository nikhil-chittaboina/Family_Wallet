import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/expenses';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: '', notes: '' });
  const [status, setStatus] = useState('Loading expenses...');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(API_URL);
      setExpenses(response.data);
      setStatus(response.data.length ? '' : 'No expenses recorded yet.');
    } catch (error) {
      setStatus('Unable to load expenses. Is the backend running?');
    }
  };

  const createExpense = async (event) => {
    event.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      setStatus('Title, amount, and category are required.');
      return;
    }

    try {
      await axios.post(API_URL, {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        notes: form.notes,
      });
      setForm({ title: '', amount: '', category: '', notes: '' });
      setStatus('Expense added successfully.');
      fetchExpenses();
    } catch (error) {
      setStatus('Failed to add expense.');
    }
  };

  const total = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }, [expenses]);

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Expense Tracker</h2>
      <form onSubmit={createExpense} style={{ display: 'grid', gap: '0.75rem', maxWidth: '480px' }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <textarea
          placeholder="Notes (optional)"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit" style={{ width: '160px' }}>Add Expense</button>
      </form>

      <div style={{ marginTop: '1.5rem' }}>
        <strong>{status}</strong>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3>Recent expenses</h3>
        {expenses.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Title</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Amount</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Category</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>{expense.title}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>${expense.amount.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>{expense.category}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>{new Date(expense.date).toLocaleDateString()}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Total</td>
                <td style={{ padding: '0.5rem', fontWeight: 'bold', textAlign: 'right' }}>${total.toFixed(2)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: '0.75rem' }}>No expenses found.</p>
        )}
      </div>
    </section>
  );
}

export default Expenses;
