import { useEditable } from '../hooks/useEditableContent.jsx';

export default function Editable({ id, as: Tag = 'span', className = '', style }) {
  const { editMode, getText, setText } = useEditable();

  const handleBlur = (e) => {
    setText(id, e.currentTarget.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') e.currentTarget.blur();
  };

  return (
    <Tag
      data-edit={id}
      className={className}
      style={style}
      contentEditable={editMode}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: getText(id) }}
    />
  );
}
