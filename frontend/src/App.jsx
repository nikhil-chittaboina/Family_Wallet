import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Income from './components/Income';
import Expenses from './components/Expenses';
import Loans from './components/Loans';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import { userInitial } from './lib/format';

const pageTitles = {
  '/': 'Dashboard',
  '/income': 'Income',
  '/expenses': 'Expenses',
  '/loans': 'Loans',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

function App() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-[1440px] px-4 py-5 lg:px-8 lg:py-6">
        <div className="flex gap-6">
          <Sidebar />
          <main className="min-w-0 flex-1 space-y-5">
            <header className="top-bar flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-brand-950">{pageTitle}</h1>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <input
                    className="input-soft pr-10"
                    placeholder="Search transactions..."
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-400">🔍</span>
                </div>
                <button type="button" className="button-secondary relative !px-3">
                  🔔
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
                </button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-sm font-bold text-white shadow-soft">
                  {userInitial()}
                </div>
              </div>
            </header>

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
