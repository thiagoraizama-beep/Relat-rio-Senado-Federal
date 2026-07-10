import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import CreativeMedia from './CreativeMedia.jsx';

const ALL_METRICS = [
  { key: 'impressions', label: 'Impressões' },
  { key: 'clicks', label: 'Cliques' },
  { key: 'views', label: 'Visualizações' },
];

function metricsForModel(isVideo) {
  return isVideo ? ALL_METRICS : ALL_METRICS.filter((m) => m.key !== 'views');
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const fmt = new Intl.NumberFormat('pt-BR');
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      <span className="chart-tooltip-value">{fmt.format(payload[0].value)}</span>
    </div>
  );
}

function DetailChart({ series, metricKey }) {
  const fmt = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={series} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="modalAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue-accent)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--blue-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-body)' }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmt.format(v)}
          tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--font-body)' }}
          width={44}
        />
        <Tooltip cursor={{ stroke: 'var(--blue-accent)', strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey={metricKey}
          stroke="var(--blue-700)"
          strokeWidth={2.5}
          fill="url(#modalAreaFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// item: entrada de topCreativesByNetwork (com dailySeries, buyModel, format, etc).
export default function CreativeDetailModal({ item, onClose }) {
  const metrics = item ? metricsForModel(item.isVideo) : ALL_METRICS;
  const [metricKey, setMetricKey] = useState('impressions');

  useEffect(() => {
    if (!item) return;
    setMetricKey(metricsForModel(item.isVideo)[0].key);
  }, [item]);

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  return createPortal(
    <div className="creative-modal-overlay" onClick={onClose}>
      <div className="creative-modal" onClick={(e) => e.stopPropagation()}>
        <button className="creative-modal-close" onClick={onClose} aria-label="Fechar">✕</button>

        <div className="creative-modal-media">
          <CreativeMedia
            item={item}
            className={`creative-modal-media-el ${item.network === 'YouTube' ? 'creative-modal-media-el-contain' : ''}`}
            showMuteToggle
          />
        </div>

        <div className="creative-modal-body">
          <div className="creative-modal-head">
            <h3>{item.name}</h3>
            <span className="video-rank-tag">{item.format}</span>
          </div>

          <div className="creative-modal-bignums">
            <div className="creative-modal-bignum bignum-blue">
              <span className="v">{item.investment}</span>
              <span className="k">Investimento</span>
            </div>
            <div className="creative-modal-bignum bignum-orange">
              <span className="v">{item.impressionsFmt}</span>
              <span className="k">Impressões</span>
            </div>
            <div className="creative-modal-bignum bignum-lightblue">
              <span className="v">{item.clicksFmt}</span>
              <span className="k">Cliques</span>
            </div>
            <div className="creative-modal-bignum bignum-green">
              <span className="v">{item.ctr}</span>
              <span className="k">CTR</span>
            </div>
          </div>

          {item.dailySeries?.length > 0 && (
            <div className="creative-modal-chart">
              <div className="creative-modal-chart-head">
                <span className="panel-title-sm">Desempenho diário</span>
                <div className="metric-switch metric-switch-sm">
                  {metrics.map((m) => (
                    <button
                      key={m.key}
                      className={`metric-switch-btn ${m.key === metricKey ? 'active' : ''}`}
                      onClick={() => setMetricKey(m.key)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <DetailChart series={item.dailySeries} metricKey={metricKey} />
            </div>
          )}

          <div className="creative-modal-detail">
            <span className="panel-title-sm">Métricas detalhadas</span>
            <dl className="creative-modal-detail-list">
              <div><dt>Tipo de compra</dt><dd>{item.buyModel}</dd></div>
              <div><dt>Formato</dt><dd>{item.orientation} · {item.placement}</dd></div>
              {item.isVideo && <div><dt>Taxa de conclusão</dt><dd>{item.completionRate}</dd></div>}
              {item.isVideo && <div><dt>Visualizações</dt><dd>{item.viewsFmt}</dd></div>}
            </dl>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
