import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/', icon: '🏠' },
  { label: 'Income', path: '/income', icon: '💰' },
  { label: 'Expenses', path: '/expenses', icon: '🧾' },
  { label: 'Loans', path: '/loans', icon: '🏦' },
  { label: 'Reports', path: '/reports', icon: '📊' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

function Sidebar() {
  return (
    <aside className="glass-card hidden h-full min-h-screen w-full max-w-[280px] flex-col gap-8 rounded-[2rem] border border-white/10 p-6 lg:flex">
      <div className="space-y-3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/15 text-2xl shadow-lg shadow-violet-500/10">M</div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Hi, Mia! 👋</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Welcome back</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-violet-500/15 text-white shadow-[0_20px_60px_-30px_rgba(139,92,246,0.7)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-[2rem] bg-gradient-to-br from-violet-500/15 to-sky-500/10 p-5 text-slate-200 shadow-xl shadow-violet-500/10">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Go Premium</p>
        <h3 className="mt-4 text-xl font-semibold text-white">Unlock exclusive features.</h3>
        <button className="button-primary mt-5 w-full">Upgrade</button>
      </div>
    </aside>
  );
}

export default Sidebar;
