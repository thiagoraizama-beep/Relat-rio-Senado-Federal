import { useEffect, useState } from 'react';

// Barra flutuante de formatação (negrito/itálico) que aparece ao selecionar
// texto dentro de qualquer elemento contentEditable, em modo edição.
export default function SelectionToolbar({ editMode }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!editMode) {
      setPos(null);
      return;
    }

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPos(null);
        return;
      }
      const anchor = sel.anchorNode;
      const el = anchor?.nodeType === 3 ? anchor.parentElement : anchor;
      if (!el || !el.closest('[contenteditable="true"]')) {
        setPos(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        setPos(null);
        return;
      }
      setPos({ top: rect.top + window.scrollY - 46, left: rect.left + window.scrollX + rect.width / 2 });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editMode]);

  if (!editMode || !pos) return null;

  const applyFormat = (command) => (e) => {
    e.preventDefault();
    document.execCommand(command);
  };

  return (
    <div className="selection-toolbar" style={{ top: pos.top, left: pos.left }}>
      <button type="button" onMouseDown={applyFormat('bold')} aria-label="Negrito">
        <strong>B</strong>
      </button>
      <button type="button" onMouseDown={applyFormat('italic')} aria-label="Itálico">
        <em>I</em>
      </button>
    </div>
  );
}
