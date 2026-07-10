import { useState } from 'react';
import Editable from '../Editable.jsx';
import OfflineCategoryBarChart from '../charts/OfflineCategoryBarChart.jsx';
import { useDonutPalette, buildColorMap } from '../charts/donutPalette.js';
import OfflineCategoryIcon from '../icons/OfflineCategoryIcons.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { offlineChannelBreakdown, offlineTopVehicles, offlineVehiclesByCategory } from '../../data/campaignData.js';

const canonicalCategories = [...offlineChannelBreakdown].sort((a, b) => b.investment - a.investment).map((c) => c.categoria);

const CATEGORY_TABS = [{ categoria: 'Todos', vehicles: offlineTopVehicles }, ...offlineVehiclesByCategory];

function VehicleRow({ item, delay }) {
  const ref = useReveal();
  return (
    <div className="offline-vehicle-row reveal" data-delay={delay} ref={ref}>
      <div className="offline-vehicle-row-head">
        <span className="offline-vehicle-icon"><OfflineCategoryIcon categoria={item.categoria} /></span>
        <h3>{item.veiculo}</h3>
        <span className="video-rank-tag">{item.categoria}</span>
        <span className="offline-vehicle-value">{item.investmentFmt}</span>
      </div>
      <div className="delivery-track offline-vehicle-track">
        <div className="delivery-fill" style={{ '--w': `${item.investmentShare}%` }} />
      </div>
      <div className="delivery-numbers">
        <span>{item.insercoesFmt} inserções</span>
      </div>
    </div>
  );
}

export default function OfflineChannelSection() {
  const headRef = useReveal();
  const chartRef = useReveal();
  const vehiclesRef = useReveal();
  const palette = useDonutPalette();
  const colorMap = buildColorMap(canonicalCategories, palette);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const activeTab = CATEGORY_TABS.find((t) => t.categoria === activeCategory) || CATEGORY_TABS[0];

  return (
    <section className="slide channel-slide" id="slide-offline-channel">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Mídia offline · Canais</div>
        <h2><Editable id="offline-channel-title" as="span" /></h2>
        <Editable id="offline-channel-sub" as="p" />
      </div>

      <div className="panel reveal" data-delay="1" ref={chartRef}>
        <h3>Visão por categoria</h3>
        <OfflineCategoryBarChart breakdown={offlineChannelBreakdown} colorMap={colorMap} />
      </div>

      <div className="offline-vehicles-split reveal" data-delay="2" ref={vehiclesRef}>
        <div className="offline-vehicles">
          <div className="offline-vehicles-head">
            <h3 className="panel-title-sm">Top veículos por investimento</h3>
            <div className="metric-switch offline-category-tabs">
              {CATEGORY_TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.categoria}
                  role="tab"
                  aria-selected={activeCategory === tab.categoria}
                  className={`metric-switch-btn offline-category-tab ${activeCategory === tab.categoria ? 'active' : ''}`}
                  onClick={() => setActiveCategory(tab.categoria)}
                >
                  {tab.categoria !== 'Todos' && (
                    <span className="offline-category-tab-icon">
                      <OfflineCategoryIcon categoria={tab.categoria} />
                    </span>
                  )}
                  {tab.categoria}
                </button>
              ))}
            </div>
          </div>
          <div className="offline-vehicles-list">
            {activeTab.vehicles.map((item, i) => (
              <VehicleRow item={item} delay={Math.min(i + 1, 5)} key={item.veiculo} />
            ))}
          </div>
        </div>

        <div className="insight-card offline-vehicles-insight">
          <span className="insight-icon">💡</span>
          <div className="insight-editable">
            <span className="insight-editable-label">Análise</span>
            <Editable id="offline-channel-insight" as="p" className="insight-body" />
          </div>
        </div>
      </div>
    </section>
  );
}
