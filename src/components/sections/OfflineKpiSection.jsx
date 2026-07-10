import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { offlineBigNumbers } from '../../data/campaignData.js';

function BigNumberCard({ item, delay }) {
  const ref = useReveal();
  return (
    <div className={`bignum-card bignum-${item.accent} reveal`} data-delay={delay} ref={ref}>
      <span className="bignum-value">{item.value}</span>
      <span className="bignum-label">{item.label}</span>
    </div>
  );
}

export default function OfflineKpiSection() {
  const headRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide kpi-slide" id="slide-offline-kpi">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Mídia offline · Visão geral</div>
        <h2><Editable id="offline-kpi-title" as="span" /></h2>
        <Editable id="offline-kpi-sub" as="p" />
      </div>

      <div className="bignum-grid">
        {offlineBigNumbers.map((item, i) => (
          <BigNumberCard item={item} delay={(i % 4) + 1} key={item.label} />
        ))}
      </div>

      <div className="insight-card reveal" data-delay="2" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="offline-kpi-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
