import Editable from '../Editable.jsx';
import { VehicleMetricChart } from '../charts/VehicleBarChart.jsx';
import { useDonutPalette, buildColorMap } from '../charts/donutPalette.js';
import { useReveal } from '../../hooks/useReveal.js';
import { vehicleOverview } from '../../data/campaignData.js';

// Ordem canônica dos veículos (por investimento total) — define a cor fixa
// de cada um no gráfico.
const canonicalVehicles = [...vehicleOverview].sort((a, b) => b.cost - a.cost).map((v) => v.veiculo);

const rows = vehicleOverview.map((v) => ({
  veiculo: v.veiculo,
  impressions: v.impressions,
  cost: v.cost,
  clicks: v.clicks,
  ctr: v.impressions ? (v.clicks / v.impressions) * 100 : 0,
}));

const METRICS = [
  { key: 'impressions', label: 'Impressões' },
  { key: 'cost', label: 'Investimento' },
  { key: 'clicks', label: 'Cliques' },
  { key: 'ctr', label: 'CTR' },
];

export default function ChannelSection() {
  const headRef = useReveal();
  const chartRef = useReveal();
  const insightRef = useReveal();
  const palette = useDonutPalette();
  const colorMap = buildColorMap(canonicalVehicles, palette);

  return (
    <section className="slide channel-slide" id="slide-channel">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Portais e mídia paga</div>
        <h2><Editable id="channel-title" as="span" /></h2>
        <Editable id="channel-sub" as="p" />
      </div>

      <div className="vehicle-metric-grid reveal" data-delay="1" ref={chartRef}>
        {METRICS.map((metric) => (
          <div className="panel vehicle-metric-panel" key={metric.key}>
            <VehicleMetricChart rows={rows} metric={metric} colorMap={colorMap} />
          </div>
        ))}
      </div>

      <div className="insight-card reveal" data-delay="3" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="channel-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
