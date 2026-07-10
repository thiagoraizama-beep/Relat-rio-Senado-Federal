import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { vehicleDeliveryPortals } from '../../data/campaignData.js';

function DeliveryRow({ item, delay }) {
  const ref = useReveal();
  const isFullDelivery = item.pct >= 100;

  return (
    <div className="delivery-row reveal" data-delay={delay} ref={ref}>
      <div className="delivery-row-head">
        <h3>{item.veiculo}</h3>
        <span className="video-rank-tag">{item.modelo}</span>
        <span className={`delivery-pct ${isFullDelivery ? 'is-full' : ''}`}>{item.pct}%</span>
      </div>
      <div className="delivery-track">
        <div className="delivery-fill" style={{ '--w': `${item.pctDisplay}%` }} />
      </div>
      <div className="delivery-numbers">
        <span><strong>{item.deliveredFmt}</strong> entregue</span>
        <span className="delivery-numbers-sep">/</span>
        <span>{item.contractedFmt} contratado</span>
        <span className="delivery-metric-label">{item.metricLabel}</span>
      </div>
    </div>
  );
}

export default function DeliverySection() {
  const headRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide delivery-slide" id="slide-delivery">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Contratado vs. realizado</div>
        <h2><Editable id="delivery-title" as="span" /></h2>
        <Editable id="delivery-sub" as="p" />
      </div>

      <div className="delivery-list">
        {vehicleDeliveryPortals.map((item, i) => (
          <DeliveryRow item={item} delay={Math.min(i + 1, 5)} key={item.veiculo} />
        ))}
      </div>

      <div className="insight-card reveal" data-delay="2" style={{ marginTop: 16 }} ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="delivery-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
