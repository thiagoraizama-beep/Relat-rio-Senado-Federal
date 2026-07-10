export default function IconBar({ sections, active }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'auto' });
  };

  return (
    <nav className="iconbar" aria-label="Navegação entre seções">
      {sections.map((s) => (
        <button
          key={s.id}
          className={`iconbar-item ${active === s.id ? 'active' : ''}`}
          style={{ '--iconbar-color': s.color }}
          aria-label={s.label}
          aria-current={active === s.id ? 'true' : undefined}
          onClick={() => scrollTo(s.id)}
        >
          <span className="iconbar-icon">{s.icon}</span>
          <span className="iconbar-label">{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
