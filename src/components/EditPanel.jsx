import { useEditable } from '../hooks/useEditableContent.jsx';

export default function EditPanel() {
  const { editMode, setEditMode, resetAll } = useEditable();

  return (
    <div className={`edit-panel ${editMode ? 'open' : ''}`}>
      <header>
        <h4>Modo edição</h4>
        <button aria-label="Fechar" onClick={() => setEditMode(false)}>✕</button>
      </header>
      <div className="body">
        <p>
          Os textos com contorno tracejado são editáveis. Clique em qualquer um deles e digite —
          as alterações salvam automaticamente neste navegador.
        </p>
        <p>
          Para entrar em modo edição, use <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + clique sobre um
          texto editável. O mesmo atalho fora de um campo editável sai do modo edição.
        </p>
        <p>
          Use <kbd>Tab</kbd> para pular entre campos e <kbd>Esc</kbd> para sair de um campo.
        </p>
        <button className="reset" onClick={resetAll}>
          Restaurar textos originais
        </button>
      </div>
    </div>
  );
}
