import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Toggle tipo "segmented control" com um fundo (pill) que desliza
// suavemente até o botão ativo em vez de trocar de cor instantaneamente
// em cada botão. options: [{ key, label }].
export default function MetricSwitch({ options, activeKey, onChange, className = '', ariaLabel }) {
  const containerRef = useRef(null);
  const btnRefs = useRef(new Map());
  const [pillStyle, setPillStyle] = useState({ opacity: 0 });

  useLayoutEffect(() => {
    const btn = btnRefs.current.get(activeKey);
    const container = containerRef.current;
    if (!btn || !container) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPillStyle({
      opacity: 1,
      width: btnRect.width,
      transform: `translateX(${btnRect.left - containerRect.left}px)`,
    });
  }, [activeKey, options]);

  useEffect(() => {
    const onResize = () => {
      const btn = btnRefs.current.get(activeKey);
      const container = containerRef.current;
      if (!btn || !container) return;
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle((prev) => ({
        ...prev,
        width: btnRect.width,
        transform: `translateX(${btnRect.left - containerRect.left}px)`,
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeKey]);

  return (
    <div className={`metric-switch ${className}`} role="tablist" aria-label={ariaLabel} ref={containerRef}>
      <span className="metric-switch-pill" style={pillStyle} aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={o.key === activeKey}
          className={`metric-switch-btn ${o.key === activeKey ? 'active' : ''}`}
          ref={(el) => {
            if (el) btnRefs.current.set(o.key, el);
            else btnRefs.current.delete(o.key);
          }}
          onClick={() => onChange(o.key)}
        >
          {o.render ? o.render(o) : o.label}
        </button>
      ))}
    </div>
  );
}
