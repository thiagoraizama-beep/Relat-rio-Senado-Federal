import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';

export default function ImpactIntroSection() {
  const indexRef = useReveal();
  const bodyRef = useReveal();

  return (
    <section className="slide concept-slide" id="slide-impact-intro">
      <div className="concept-bg" aria-hidden="true" />
      <div className="concept-orb" aria-hidden="true" />
      <div className="concept-index reveal" ref={indexRef}>
        <span className="concept-index-num">07</span>
        <span className="concept-index-label">Fechamento</span>
      </div>

      <div className="concept-body reveal" data-delay="1" ref={bodyRef}>
        <h2 className="concept-title">
          <span className="concept-title-line"><Editable id="impact-intro-title-1" as="span" /></span>
          <span className="concept-title-line concept-title-accent"><Editable id="impact-intro-title-2" as="span" /></span>
        </h2>
        <span className="concept-rule" aria-hidden="true" />
        <Editable id="impact-intro-body" as="p" className="concept-text" />
        <div className="concept-signature">
          <span>Online</span>
          <span>·</span>
          <span>Offline</span>
          <span>·</span>
          <span>Compilado geral</span>
        </div>
      </div>
    </section>
  );
}
