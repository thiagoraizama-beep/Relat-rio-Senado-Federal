import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { overallImpact } from '../../data/campaignData.js';

function BigNumberCard({ item, delay }) {
  const ref = useReveal();
  return (
    <div className={`bignum-card bignum-${item.accent} reveal`} data-delay={delay} ref={ref}>
      <span className="bignum-value">{item.value}</span>
      <span className="bignum-label">{item.label}</span>
    </div>
  );
}

export default function ImpactSection() {
  const headRef = useReveal();
  const bignumRef = useReveal();
  const populationRef = useReveal();
  const ga4Ref = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide kpi-slide" id="slide-impact">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Fechamento · Online + Offline</div>
        <h2><Editable id="impact-title" as="span" /></h2>
        <Editable id="impact-sub" as="p" />
      </div>

      <div className="bignum-grid" ref={bignumRef}>
        {overallImpact.bigNumbers.map((item, i) => (
          <BigNumberCard item={item} delay={(i % 4) + 1} key={item.label} />
        ))}
      </div>
      <span className="impact-frequency-note">{overallImpact.frequencyNote}</span>

      <div className="impact-population reveal" data-delay="2" ref={populationRef}>
        <span className="impact-population-value">{overallImpact.populationPct}</span>
        <div className="impact-population-text">
          <span className="impact-population-label">da população brasileira impactada</span>
          <span className="impact-population-note">{overallImpact.populationNote}</span>
        </div>
      </div>

      <div className="impact-ga4-grid reveal" data-delay="3" ref={ga4Ref}>
        <div className="impact-ga4-card">
          <Editable id="impact-ga4-sessions" as="span" className="impact-ga4-value" />
          <span className="impact-ga4-label">Sessões</span>
        </div>
        <div className="impact-ga4-card">
          <Editable id="impact-ga4-time" as="span" className="impact-ga4-value" />
          <span className="impact-ga4-label">Tempo médio</span>
        </div>
        <div className="impact-ga4-card">
          <Editable id="impact-ga4-cost" as="span" className="impact-ga4-value" />
          <span className="impact-ga4-label">Custo/sessão</span>
        </div>
      </div>

      <div className="insight-card reveal" data-delay="4" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="impact-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
