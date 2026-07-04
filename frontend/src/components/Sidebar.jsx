import { NavLink } from 'react-router-dom';
import { config } from '../config/env';
import { userInitial } from '../lib/format';

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
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar-panel sticky top-6 hidden h-[calc(100vh-3rem)] w-[260px] shrink-0 flex-col rounded-3xl p-5 lg:flex">
        <div className="rounded-2xl bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-lg font-bold text-white shadow-soft">
              {userInitial()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Hi, {config.userName}!</p>
              <p className="text-base font-bold text-brand-950">Welcome back</p>
            </div>
          </div>
        </div>

        <nav className="mt-5 flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'sidebar-nav-active text-brand-900'
                    : 'text-brand-800/80 hover:bg-white/60 hover:text-brand-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`sidebar-nav-icon ${isActive ? 'sidebar-nav-icon-active' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Go Premium</p>
              <p className="mt-1 text-sm font-bold text-brand-950">Unlock exclusive features</p>
            </div>
            <span className="text-xl">👑</span>
          </div>
          <button type="button" className="button-primary mt-3 w-full text-sm">Upgrade</button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-brand-200 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-semibold ${
                isActive ? 'text-brand-600' : 'text-brand-400'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;
