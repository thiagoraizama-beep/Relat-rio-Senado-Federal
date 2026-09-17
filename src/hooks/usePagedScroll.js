import { useEffect, useRef } from 'react';

// Mouse wheel/touch scroll fica nativo (livre, sem paginar). Só as setas
// ↑/↓ e PageUp/PageDown pulam direto para a seção anterior/seguinte.
export function usePagedScroll(sectionIds) {
  const busyRef = useRef(false);

  useEffect(() => {
    const getSections = () => sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const currentIndex = () => {
      const sections = getSections();
      const mid = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      sections.forEach((el, i) => {
        if (el.offsetTop <= mid) idx = i;
      });
      return idx;
    };

    const jumpTo = (index) => {
      const sections = getSections();
      const target = sections[Math.max(0, Math.min(sections.length - 1, index))];
      if (!target) return;
      busyRef.current = true;
      target.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        busyRef.current = false;
      }, 500);
    };

    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (e.key === 'PageDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!busyRef.current) jumpTo(currentIndex() + 1);
      } else if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!busyRef.current) jumpTo(currentIndex() - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sectionIds]);
}
