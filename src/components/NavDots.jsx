import { useState } from 'react';

export default function NavDots({ sections, active }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const activeSection = sections.find((s) => s.id === active);
  const tone = activeSection?.tone ?? 'dark';

  return (
    <>
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

      <button
        type="button"
        className={`navmenu-toggle navmenu-toggle-${tone} ${menuOpen ? 'open' : ''}`}
        aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="navmenu-overlay" onClick={() => setMenuOpen(false)}>
          <nav
            className="navmenu-panel"
            aria-label="Navegação entre seções"
            onClick={(e) => e.stopPropagation()}
          >
            {sections.map((s) => (
              <button
                key={s.id}
                className={`navmenu-item ${active === s.id ? 'active' : ''}`}
                aria-current={active === s.id ? 'true' : undefined}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
