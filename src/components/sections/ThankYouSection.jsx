import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';

export default function ThankYouSection() {
  const ref = useReveal();

  return (
    <section className="slide thanks-slide" id="slide-thanks">
      <div className="concept-bg" aria-hidden="true" />
      <div className="concept-orb" aria-hidden="true" />

      <div className="thanks-body reveal" ref={ref}>
        <span className="thanks-eyebrow">Fim de relatório</span>
        <h2 className="thanks-title">Muito obrigado.</h2>
        <Editable id="thanks-sub" as="p" className="thanks-text" />
        <div className="thanks-logos">
          <img className="thanks-logo" src="/filete_branco_horizontal_1.png" alt="Logo Senado Federal" />
          <span className="thanks-logos-sep" aria-hidden="true" />
          <img className="thanks-logo thanks-logo-calix" src="/CALIX_branco.png" alt="Logo Agência Cálix" />
        </div>
        <div className="concept-signature thanks-signature">
          <span>Uma campanha da Agência <strong>Cálix</strong>, para o Senado Federal</span>
        </div>
      </div>
    </section>
  );
}
