import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { ga4Report } from '../../data/campaignData.js';

function BigNumberCard({ item, delay }) {
  const ref = useReveal();
  return (
    <div className={`bignum-card bignum-${item.accent} reveal`} data-delay={delay} ref={ref}>
      <span className="bignum-value">{item.value}</span>
      <span className="bignum-label">{item.label}</span>
    </div>
  );
}

function VehicleRow({ item, delay }) {
  const ref = useReveal();
  return (
    <div className="offline-vehicle-row reveal" data-delay={delay} ref={ref}>
      <div className="offline-vehicle-row-head">
        <h3>{item.veiculo}</h3>
        <span className="video-rank-tag">{item.engagementRate} engajamento</span>
        <span className="offline-vehicle-value">{item.activeUsersFmt}</span>
      </div>
      <div className="delivery-track offline-vehicle-track">
        <div className="delivery-fill" style={{ '--w': `${item.activeUsersShare}%` }} />
      </div>
      <div className="delivery-numbers">
        <span>{item.sessionsFmt} sessões</span>
        <span>{item.avgEngagementTimeFmt} tempo médio</span>
      </div>
    </div>
  );
}

export default function GA4Section() {
  const headRef = useReveal();
  const vehiclesRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide kpi-slide" id="slide-ga4">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Google Analytics 4 · Site institucional</div>
        <h2><Editable id="ga4-title" as="span" /></h2>
        <Editable id="ga4-sub" as="p" />
      </div>

      <div className="bignum-grid">
        {ga4Report.bigNumbers.map((item, i) => (
          <BigNumberCard item={item} delay={(i % 4) + 1} key={item.label} />
        ))}
      </div>

      <div className="offline-vehicles-split reveal" data-delay="2" ref={vehiclesRef}>
        <div className="offline-vehicles">
          <div className="offline-vehicles-head">
            <h3 className="panel-title-sm">Usuários ativos por origem</h3>
          </div>
          <div className="offline-vehicles-list" data-scroll-guard>
            {ga4Report.vehicles.map((item, i) => (
              <VehicleRow item={item} delay={Math.min(i + 1, 5)} key={item.veiculo} />
            ))}
          </div>
        </div>

        <div className="insight-card offline-vehicles-insight" data-scroll-guard ref={insightRef}>
          <span className="insight-icon">💡</span>
          <div className="insight-editable">
            <span className="insight-editable-label">Análise</span>
            <Editable id="ga4-insight" as="p" className="insight-body" />
          </div>
        </div>
      </div>
    </section>
  );
}
