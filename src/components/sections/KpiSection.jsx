import Editable from '../Editable.jsx';
import DailyMetricsChart from '../charts/DailyMetricsChart.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { bigNumbers, dailySeries } from '../../data/campaignData.js';

function BigNumberCard({ item, delay }) {
  const ref = useReveal();
  return (
    <div className={`bignum-card bignum-${item.accent} reveal`} data-delay={delay} ref={ref}>
      <span className="bignum-value">{item.value}</span>
      <span className="bignum-label">{item.label}</span>
    </div>
  );
}

export default function KpiSection() {
  const headRef = useReveal();
  const chartRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide kpi-slide" id="slide-kpi">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Visão geral · Mídia online</div>
        <h2><Editable id="kpi-title" as="span" /></h2>
        <Editable id="kpi-sub" as="p" />
      </div>

      <div className="bignum-grid">
        {bigNumbers.map((item, i) => (
          <BigNumberCard item={item} delay={(i % 4) + 1} key={item.label} />
        ))}
      </div>

      <div className="panel reveal" data-delay="2" style={{ marginTop: 14 }} ref={chartRef}>
        <h3>Métricas por dia</h3>
        <DailyMetricsChart series={dailySeries} />
      </div>

      <div className="insight-card reveal" data-delay="3" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="kpi-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
