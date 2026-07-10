import { useEffect } from 'react';

// Ctrl+Shift+clique-esquerdo sobre um bloco editável entra em modo edição
// (o próprio clique já foca o campo). O mesmo atalho fora de qualquer campo
// editável sai do modo edição — sem precisar de um botão fixo na tela.
export function useEditShortcut(editMode, setEditMode) {
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!(e.ctrlKey && e.shiftKey && e.button === 0)) return;
      const target = e.target.closest('[data-edit], [contenteditable]');
      if (target) {
        e.preventDefault();
        setEditMode(true);
        requestAnimationFrame(() => {
          target.focus();
          const range = document.createRange();
          range.selectNodeContents(target);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
      } else if (editMode) {
        setEditMode(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [editMode, setEditMode]);
}
