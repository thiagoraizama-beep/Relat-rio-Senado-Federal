import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { useEditable } from '../../hooks/useEditableContent.jsx';

function EditableList({ listKey, title }) {
  const { editMode, getList, setList } = useEditable();
  const items = getList(listKey);

  const updateItem = (index, value) => {
    const next = [...items];
    next[index] = value;
    setList(listKey, next);
  };

  const addItem = () => {
    setList(listKey, [...items, '']);
  };

  const removeItem = (index) => {
    setList(listKey, items.filter((_, i) => i !== index));
  };

  return (
    <div className="insights-col">
      <h3 className="insights-col-title">{title}</h3>
      <ul className="insights-list">
        {items.map((text, i) => (
          <li key={i} className="insights-item">
            <span className="insights-item-num">{String(i + 1).padStart(2, '0')}</span>
            <p
              data-edit={`${listKey}-${i}`}
              contentEditable={editMode}
              suppressContentEditableWarning
              onBlur={(e) => updateItem(i, e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: text }}
            />
            {editMode && (
              <button
                type="button"
                className="insights-item-remove"
                onClick={() => removeItem(i)}
                aria-label="Remover item"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {editMode && (
        <button type="button" className="insights-add-btn" onClick={addItem}>
          + Adicionar item
        </button>
      )}
    </div>
  );
}

export default function InsightsSection() {
  const headRef = useReveal();
  const colsRef = useReveal();

  return (
    <section className="slide insights-slide" id="slide-insights">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow" style={{ color: 'var(--blue-light)' }}>Encerramento</div>
        <h2><Editable id="insights-title" as="span" /></h2>
        <Editable id="insights-sub" as="p" />
      </div>

      <div className="insights-cols reveal" data-delay="1" ref={colsRef}>
        <EditableList listKey="insights-learnings" title="Aprendizados" />
        <EditableList listKey="insights-next-steps" title="Próximos passos" />
      </div>
    </section>
  );
}
