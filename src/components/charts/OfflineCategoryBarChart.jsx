import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import MetricSwitch from '../MetricSwitch.jsx';

export const OFFLINE_METRICS = [
  { key: 'investment', label: 'Investimento', prefix: 'R$ ' },
  { key: 'insercoes', label: 'Inserções', prefix: '' },
  { key: 'impact', label: 'Impacto', prefix: '' },
];

const fmt = new Intl.NumberFormat('pt-BR');

function formatValue(raw, metric) {
  return `${metric.prefix}${fmt.format(Math.round(raw))}`;
}

function ChartTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{row.categoria}</span>
      <span className="chart-tooltip-value">{formatValue(row[metric.key], metric)}</span>
    </div>
  );
}

// breakdown: [{ categoria, investment, insercoes, impact }] — uma barra por categoria.
export default function OfflineCategoryBarChart({ breakdown, colorMap, metricKey, onMetricChange }) {
  const metric = OFFLINE_METRICS.find((m) => m.key === metricKey);
  const data = breakdown
    .filter((row) => row[metricKey] != null)
    .sort((a, b) => b[metricKey] - a[metricKey]);

  return (
    <div>
      <MetricSwitch
        options={OFFLINE_METRICS.map((m) => ({ key: m.key, label: m.label }))}
        activeKey={metricKey}
        onChange={onMetricChange}
        ariaLabel="Selecionar métrica"
      />
      <div className="rechart-wrap">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--line)" />
            <XAxis type="number" hide domain={[0, (max) => max * 1.18]} />
            <YAxis
              type="category"
              dataKey="categoria"
              axisLine={false}
              tickLine={false}
              width={150}
              tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--font-body)' }}
            />
            <Tooltip cursor={{ fill: 'var(--paper-2)' }} content={<ChartTooltip metric={metric} />} />
            <Bar dataKey={metricKey} radius={[0, 5, 5, 0]} isAnimationActive={false} barSize={14}>
              {data.map((row) => (
                <Cell key={row.categoria} fill={colorMap?.get(row.categoria) || 'var(--blue-700)'} />
              ))}
              <LabelList
                dataKey={metricKey}
                position="right"
                formatter={(value) => formatValue(value, metric)}
                style={{ fill: 'var(--text-1)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
