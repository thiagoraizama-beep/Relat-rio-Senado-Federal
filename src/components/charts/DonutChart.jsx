import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useDonutPalette } from './donutPalette.js';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, pct } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      <span className="chart-tooltip-value">{pct}%</span>
    </div>
  );
}

// segments: [{ label, pct }] — a cor de cada fatia vem de colorMap (label ->
// cor), garantindo que cada veículo tenha sempre a mesma cor em qualquer
// gráfico da página, independente da ordem/ranking daquela métrica.
// Renderiza só o círculo (sem legenda) — use junto com <DonutLegend> para o
// layout "gráficos grandes em cima, legenda única embaixo".
export default function DonutChart({ segments, colorMap, centerValue, centerLabel = 'Total', height = 220 }) {
  const palette = useDonutPalette();

  return (
    <div className="donut-chart-only">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="pct"
            nameKey="label"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={1.5}
            stroke="var(--card-bg)"
            strokeWidth={2}
          >
            {segments.map((s, i) => (
              <Cell key={s.label} fill={colorMap?.get(s.label) || palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="channel-donut-center">
          <span className="channel-donut-center-label">{centerLabel}</span>
          <span className="channel-donut-center-value">{centerValue}</span>
        </div>
      )}
    </div>
  );
}
