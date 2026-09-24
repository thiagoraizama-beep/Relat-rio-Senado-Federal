import { useEffect, useState } from 'react';
import Editable from '../Editable.jsx';
import CategoryDropdown from '../CategoryDropdown.jsx';
import OfflineCategoryBarChart from '../charts/OfflineCategoryBarChart.jsx';
import { useDonutPalette, buildColorMap } from '../charts/donutPalette.js';
import OfflineCategoryIcon from '../icons/OfflineCategoryIcons.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { offlineChannelBreakdown, offlineTopVehicles, offlineVehiclesByCategory } from '../../data/campaignData.js';

const SHARE_KEY_BY_METRIC = {
  investment: 'investmentShare',
  insercoes: 'insercoesShare',
  impact: 'impactShare',
};

function withMetricShare(list, metricKey) {
  const shareKey = SHARE_KEY_BY_METRIC[metricKey];
  const max = Math.max(...list.map((v) => v[metricKey] ?? 0), 1);
  return list.map((v) => ({ ...v, [shareKey]: Math.round(((v[metricKey] ?? 0) / max) * 100) }));
}

const canonicalCategories = [...offlineChannelBreakdown].sort((a, b) => b.investment - a.investment).map((c) => c.categoria);

// Linhas "Complementar" têm slide próprio (OfflineComplementarSection),
// fora da visão geral por categoria.
const isComplementar = (row) => row.categoria.endsWith('Complementar');

function buildSlideData(complementar) {
  const keep = (row) => isComplementar(row) === complementar;
  const categoryTabs = offlineVehiclesByCategory.filter(keep);
  const allVehicles = complementar ? categoryTabs.flatMap((tab) => tab.vehicles) : offlineTopVehicles.filter(keep);
  return {
    breakdown: offlineChannelBreakdown.filter(keep),
    tabs: [{ categoria: 'Todos', vehicles: allVehicles }, ...categoryTabs],
  };
}

const SLIDE_DATA = { main: buildSlideData(false), complementar: buildSlideData(true) };

const SLIDE_CONFIG = {
  main: { id: 'slide-offline-channel', eyebrow: 'Mídia offline · Canais', editPrefix: 'offline-channel' },
  complementar: { id: 'slide-offline-complementar', eyebrow: 'Mídia offline · Complementar', editPrefix: 'offline-complementar' },
};

const VALUE_FIELD_BY_METRIC = {
  investment: 'investmentFmt',
  insercoes: 'insercoesFmt',
  impact: 'impactFmt',
};

const PCT_FIELD_BY_METRIC = {
  investment: 'investmentPct',
  insercoes: 'insercoesPct',
  impact: 'impactPct',
};

const fmtPct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function VehicleTableRow({ item, metricKey }) {
  const shareKey = SHARE_KEY_BY_METRIC[metricKey];
  const valueField = VALUE_FIELD_BY_METRIC[metricKey];
  const pctField = PCT_FIELD_BY_METRIC[metricKey];
  return (
    <tr className="offline-vehicle-table-row">
      <td className="offline-vehicle-table-name">
        <span className="offline-vehicle-icon"><OfflineCategoryIcon categoria={item.categoria} /></span>
        <span>{item.veiculo}</span>
      </td>
      <td className="offline-vehicle-table-category">
        <span className="video-rank-tag">{item.categoria}</span>
      </td>
      <td className="offline-vehicle-table-bar">
        <div className="delivery-track offline-vehicle-track">
          <div className="delivery-fill" style={{ '--w': `${item[shareKey] ?? 0}%` }} />
        </div>
      </td>
      <td className="offline-vehicle-table-value">{item[valueField]}</td>
      <td className="offline-vehicle-table-pct">{fmtPct.format(item[pctField] ?? 0)}%</td>
    </tr>
  );
}

const METRIC_LABEL = { investment: 'investimento', insercoes: 'inserções', impact: 'impacto' };

function OfflineCategorySlide({ variant }) {
  const { id, eyebrow, editPrefix } = SLIDE_CONFIG[variant];
  const { breakdown, tabs } = SLIDE_DATA[variant];
  const headRef = useReveal();
  const chartRef = useReveal();
  const vehiclesRef = useReveal();
  const palette = useDonutPalette();
  const colorMap = buildColorMap(canonicalCategories, palette);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [metricKey, setMetricKey] = useState('investment');

  // Só mostra no filtro categorias que têm ao menos um veículo com a métrica
  // ativa (ex: Rádio/TV Aberta/TV Fechada somem quando "Impacto" é escolhido,
  // já que ainda não temos essa métrica para elas).
  const visibleTabs = tabs.filter(
    (tab) => tab.categoria === 'Todos' || tab.vehicles.some((v) => v[metricKey] != null)
  );

  useEffect(() => {
    if (!visibleTabs.some((t) => t.categoria === activeCategory)) setActiveCategory('Todos');
  }, [metricKey]);

  const activeTab = visibleTabs.find((t) => t.categoria === activeCategory) || visibleTabs[0];
  const rankedVehicles = withMetricShare(
    activeTab.vehicles.filter((v) => v[metricKey] != null).sort((a, b) => (b[metricKey] ?? 0) - (a[metricKey] ?? 0)),
    metricKey
  );

  return (
    <section className="slide channel-slide" id={id}>
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">{eyebrow}</div>
        <h2><Editable id={`${editPrefix}-title`} as="span" /></h2>
        <Editable id={`${editPrefix}-sub`} as="p" />
      </div>

      <div className="panel reveal" data-delay="1" ref={chartRef}>
        <h3>Visão por categoria</h3>
        <OfflineCategoryBarChart
          breakdown={breakdown}
          colorMap={colorMap}
          metricKey={metricKey}
          onMetricChange={setMetricKey}
          minHeight={variant === 'complementar' ? 0 : 190}
        />
      </div>

      {/* Complementar tem poucos veículos: a análise vai abaixo da tabela, não ao lado. */}
      <div
        className={`offline-vehicles-split reveal${variant === 'complementar' ? ' offline-vehicles-split--stacked' : ''}`}
        data-delay="2"
        ref={vehiclesRef}
      >
        <div className="offline-vehicles">
          <div className="offline-vehicles-head">
            <h3 className="panel-title-sm">Top veículos por {METRIC_LABEL[metricKey]}</h3>
            <CategoryDropdown
              options={visibleTabs.map((tab) => ({ value: tab.categoria, label: tab.categoria }))}
              value={activeCategory}
              onChange={setActiveCategory}
              ariaLabel="Filtrar veículos por categoria"
              renderIcon={(categoria) => (categoria !== 'Todos' ? <OfflineCategoryIcon categoria={categoria} /> : null)}
            />
          </div>
          <div className="offline-vehicles-table-wrap" data-scroll-guard>
            <table className="offline-vehicles-table">
              <tbody>
                {rankedVehicles.map((item) => (
                  <VehicleTableRow item={item} metricKey={metricKey} key={item.veiculo} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="insight-card offline-vehicles-insight" data-scroll-guard>
          <span className="insight-icon">💡</span>
          <div className="insight-editable">
            <span className="insight-editable-label">Análise</span>
            <Editable id={`${editPrefix}-insight`} as="p" className="insight-body" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OfflineChannelSection() {
  return <OfflineCategorySlide variant="main" />;
}

export function OfflineComplementarSection() {
  return <OfflineCategorySlide variant="complementar" />;
}

