import { useReveal } from '../../hooks/useReveal.js';
import { campaignConcept } from '../../data/campaignData.js';

export default function ConceptSection() {
  const indexRef = useReveal();
  const bodyRef = useReveal();

  return (
    <section className="slide concept-slide" id="slide-concept">
      <div className="concept-bg" aria-hidden="true" />
      <div className="concept-orb" aria-hidden="true" />
      <div className="concept-index reveal" ref={indexRef}>
        <span className="concept-index-num">{campaignConcept.index}</span>
        <span className="concept-index-label">{campaignConcept.kicker}</span>
      </div>

      <div className="concept-body reveal" data-delay="1" ref={bodyRef}>
        <h2 className="concept-title">
          {campaignConcept.titleLines.map((line, i) => (
            <span
              className={`concept-title-line ${i === campaignConcept.titleLines.length - 1 ? 'concept-title-accent' : ''}`}
              key={line}
            >
              {line}
            </span>
          ))}
        </h2>
        <span className="concept-rule" aria-hidden="true" />
        <p className="concept-text">{campaignConcept.body}</p>
        <div className="concept-signature">
          <span>Uma campanha da Agência <strong>Cálix</strong>, para o Senado Federal</span>
        </div>
      </div>
    </section>
  );
}
