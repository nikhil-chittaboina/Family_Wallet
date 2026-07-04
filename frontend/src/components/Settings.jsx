function Settings() {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="hero-banner p-6">
        <p className="section-label">Settings</p>
        <h2 className="page-title mt-1">Customize your experience</h2>
        <p className="page-subtitle mt-1">Currency, theme, categories and backups.</p>
      </section>

      <section className="glass-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label">Coming soon</p>
            <h3 className="section-title mt-1">Personalization is in progress</h3>
          </div>
          <button type="button" className="button-secondary shrink-0">Explore later</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { title: 'Currency & locale', description: 'Set the family currency and regional formatting.' },
            { title: 'Theme mode', description: 'Choose a light or soft theme for the dashboard.' },
          ].map((item) => (
            <div key={item.title} className="summary-mini">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">{item.title}</p>
              <p className="mt-2 text-sm text-brand-800">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Settings;
