import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Income from './components/Income';
import Expenses from './components/Expenses';
import Loans from './components/Loans';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';

function App() {
  const [health, setHealth] = useState('Loading...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then((res) => setHealth(res.data.message))
      .catch(() => setHealth('Backend not reachable'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Sidebar />
          <main className="space-y-6">
            <div className="soft-card rounded-[2rem] border border-white/10 p-5 text-slate-300 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Backend status</p>
              <p className="mt-2 text-lg font-medium text-white">{health}</p>
            </div>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
