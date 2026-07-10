import Editable from '../Editable.jsx';
import DonutChart from '../charts/DonutChart.jsx';
import DonutLegendUnified from '../charts/DonutLegendUnified.jsx';
import { useDonutPalette, buildColorMap } from '../charts/donutPalette.js';
import { useReveal } from '../../hooks/useReveal.js';
import { vehicleOverview } from '../../data/campaignData.js';

const fmt = new Intl.NumberFormat('pt-BR');
const fmtCompact = (n) => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtMoney = (n) => `R$ ${fmt.format(Math.round(n))}`;
const fmtPctValue = (n) => `${fmt.format(Number(n.toFixed(2)))}%`;

// Ordem canônica dos veículos (por investimento total) — define tanto a cor
// fixa de cada um quanto a ordem da legenda única.
const canonicalVehicles = [...vehicleOverview].sort((a, b) => b.cost - a.cost).map((v) => v.veiculo);

function segmentsFor(metricKey) {
  const rows = vehicleOverview.filter((v) => v[metricKey] > 0);
  const total = rows.reduce((acc, v) => acc + v[metricKey], 0) || 1;
  return rows
    .map((v) => ({ label: v.veiculo, pct: Math.round((v[metricKey] / total) * 100 * 10) / 10 }))
    .sort((a, b) => b.pct - a.pct);
}

function ctrSegments() {
  const rows = vehicleOverview.filter((v) => v.impressions > 0);
  return rows
    .map((v) => ({ label: v.veiculo, pct: Math.round(((v.clicks / v.impressions) * 100) * 10) / 10 }))
    .sort((a, b) => b.pct - a.pct);
}

const totalImpressions = vehicleOverview.reduce((acc, v) => acc + v.impressions, 0);
const totalClicks = vehicleOverview.reduce((acc, v) => acc + v.clicks, 0);
const totalCost = vehicleOverview.reduce((acc, v) => acc + v.cost, 0);
const overallCtr = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;

const METRICS = [
  { key: 'impressions', title: 'Impressões', centerLabel: 'Impressões', centerValue: fmtCompact(totalImpressions), segments: segmentsFor('impressions') },
  { key: 'cost', title: 'Investimento', centerLabel: 'Investimento', centerValue: fmtMoney(totalCost), segments: segmentsFor('cost') },
  { key: 'clicks', title: 'Cliques', centerLabel: 'Cliques', centerValue: fmtCompact(totalClicks), segments: segmentsFor('clicks') },
  { key: 'ctr', title: 'CTR', centerLabel: 'CTR médio', centerValue: fmtPctValue(overallCtr), segments: ctrSegments() },
];

export default function ChannelSection() {
  const headRef = useReveal();
  const chartsRef = useReveal();
  const legendRef = useReveal();
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

      <div className="donut-row reveal" data-delay="1" ref={chartsRef}>
        {METRICS.map((metric) => (
          <div className="donut-row-item" key={metric.key}>
            <DonutChart
              segments={metric.segments}
              colorMap={colorMap}
              centerValue={metric.centerValue}
              centerLabel={metric.centerLabel}
              height={220}
            />
          </div>
        ))}
      </div>

      <div className="donut-legend-unified-wrap panel reveal" data-delay="2" ref={legendRef}>
        <DonutLegendUnified labels={canonicalVehicles} colorMap={colorMap} />
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
