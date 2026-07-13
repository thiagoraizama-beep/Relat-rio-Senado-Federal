export default function NavDots({ sections, active }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSection = sections.find((s) => s.id === active);
  const tone = activeSection?.tone ?? 'dark';

  return (
    <nav className={`navdots navdots-${tone}`} aria-label="Navegação entre seções">
      {sections.map((s) => (
        <button
          key={s.id}
          className={`navdot ${active === s.id ? 'active' : ''}`}
          aria-current={active === s.id ? 'true' : undefined}
          onClick={() => scrollTo(s.id)}
        >
          <span className="navdot-tooltip">{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
