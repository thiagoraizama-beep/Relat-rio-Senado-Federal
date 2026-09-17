import { useState } from 'react';
import { useFullscreen } from '../hooks/useFullscreen.js';

export default function NavDots({ sections, active }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

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

      <button
        type="button"
        className={`fullscreen-toggle fullscreen-toggle-${tone}`}
        aria-label={isFullscreen ? 'Sair da tela cheia' : 'Modo apresentação (tela cheia)'}
        aria-pressed={isFullscreen}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 4v3a2 2 0 0 1-2 2H4M20 9h-3a2 2 0 0 1-2-2V4M15 20v-3a2 2 0 0 1 2-2h3M4 15h3a2 2 0 0 1 2 2v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9V6a2 2 0 0 1 2-2h3M20 9V6a2 2 0 0 1-2-2h-3M4 15v3a2 2 0 0 0 2 2h3M20 15v3a2 2 0 0 1-2 2h-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
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
