import { useEffect, useRef, useState } from 'react';

// Dropdown customizado (não usa <select> nativo) para ter controle total do
// visual da lista aberta, que no <select> do navegador é renderizada pelo
// SO e não aceita estilização (fica com cara de sistema operacional).
export default function CategoryDropdown({ options, value, onChange, renderIcon, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const active = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="category-dropdown" ref={rootRef}>
      <button
        type="button"
        className="category-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {renderIcon?.(active.value) && <span className="category-dropdown-icon">{renderIcon(active.value)}</span>}
        <span className="category-dropdown-label">{active.label}</span>
        <span className={`category-dropdown-caret ${open ? 'open' : ''}`} aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="category-dropdown-list" role="listbox">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={`category-dropdown-option ${opt.value === value ? 'active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {renderIcon?.(opt.value) && <span className="category-dropdown-icon">{renderIcon(opt.value)}</span>}
                <span>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
