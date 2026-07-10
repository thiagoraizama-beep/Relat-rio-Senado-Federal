import { useEffect, useRef } from 'react';

// Turns wheel/touch/key scrolling into a hard jump between full-screen
// sections instead of the native "drag until nearest snap point" feel.
// Scrollable inner content (e.g. the creatives grid) is respected: if it
// still has room to scroll in the gesture's direction, the gesture scrolls
// that element instead of paging the whole report.
export function usePagedScroll(sectionIds) {
  const busyRef = useRef(false);
  const touchYRef = useRef(null);

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
      target.scrollIntoView({ behavior: 'auto' });
      window.setTimeout(() => {
        busyRef.current = false;
      }, 500);
    };

    const scrollableAncestor = (node, dir) => {
      let el = node;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight;
        if (canScroll) {
          const atTop = el.scrollTop <= 0;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if ((dir < 0 && !atTop) || (dir > 0 && !atBottom)) return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const onWheel = (e) => {
      const dir = e.deltaY > 0 ? 1 : -1;
      if (scrollableAncestor(e.target, dir)) return; // let inner content scroll natively
      e.preventDefault();
      if (busyRef.current) return;
      jumpTo(currentIndex() + dir);
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

    const onTouchStart = (e) => {
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (touchYRef.current === null) return;
      const deltaY = touchYRef.current - e.touches[0].clientY;
      const dir = deltaY > 0 ? 1 : -1;
      if (scrollableAncestor(e.target, dir)) return;
      if (Math.abs(deltaY) < 40) return;
      e.preventDefault();
      if (busyRef.current) return;
      touchYRef.current = null;
      jumpTo(currentIndex() + dir);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [sectionIds]);
}
