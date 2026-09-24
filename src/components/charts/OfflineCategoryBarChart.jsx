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

// Tick em linha única: o tick padrão do Recharts quebra nomes longos em até
// 3 linhas, que vazam da faixa da barra e são cortadas no fim do SVG.
function CategoryTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy="0.35em" textAnchor="end" fill="var(--text-2)" fontSize={11} fontFamily="var(--font-body)">
      {payload.value}
    </text>
  );
}

const ROW_HEIGHT = 28;

// breakdown: [{ categoria, investment, insercoes, impact }] — uma barra por categoria.
export default function OfflineCategoryBarChart({ breakdown, colorMap, metricKey, onMetricChange, showMetricSwitch = true, minHeight = 190 }) {
  const metric = OFFLINE_METRICS.find((m) => m.key === metricKey);
  const data = breakdown
    .filter((row) => row[metricKey] != null)
    .sort((a, b) => b[metricKey] - a[metricKey]);
  // Largura do eixo proporcional ao maior nome (~6px por caractere a 11px).
  const axisWidth = Math.max(90, ...data.map((row) => row.categoria.length * 6 + 12));

  return (
    <div>
      {showMetricSwitch && (
        <MetricSwitch
          options={OFFLINE_METRICS.map((m) => ({ key: m.key, label: m.label }))}
          activeKey={metricKey}
          onChange={onMetricChange}
          ariaLabel="Selecionar métrica"
        />
      )}
      <div className="rechart-wrap">
        <ResponsiveContainer width="100%" height={Math.max(minHeight, data.length * ROW_HEIGHT + 16)}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="var(--line)" />
            <XAxis type="number" hide domain={[0, (max) => max * 1.18]} />
            <YAxis
              type="category"
              dataKey="categoria"
              axisLine={false}
              tickLine={false}
              width={axisWidth}
              interval={0}
              tick={<CategoryTick />}
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
