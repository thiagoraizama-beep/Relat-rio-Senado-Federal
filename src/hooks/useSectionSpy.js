import { useEffect, useState } from 'react';

// Usa a posição de scroll (mesma lógica de usePagedScroll) em vez de
// IntersectionObserver puro — com scroll-snap + jump instantâneo, o
// observer podia nunca disparar isIntersecting>0.5 pra uma seção "no meio
// do caminho", deixando o dot ativo preso na seção anterior.
export function useSectionSpy(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const getSections = () => sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const updateActive = () => {
      const sections = getSections();
      if (!sections.length) return;
      const mid = window.scrollY + window.innerHeight / 2;
      let current = sections[0];
      sections.forEach((el) => {
        if (el.offsetTop <= mid) current = el;
      });
      setActive(current.id);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [sectionIds]);

  return active;
}
