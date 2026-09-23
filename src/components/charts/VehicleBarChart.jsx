import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import MetricSwitch from '../MetricSwitch.jsx';

const fmt = new Intl.NumberFormat('pt-BR');

function formatValue(raw, metric) {
  if (metric.key === 'ctr') return `${fmt.format(Number(raw.toFixed(2)))}%`;
  if (metric.key === 'cost') return `R$ ${fmt.format(Math.round(raw))}`;
  return fmt.format(Math.round(raw));
}

// rows: [{ veiculo, impressions, cost, clicks, ctr }] — uma barra por veículo,
// para uma única métrica (sem toggle). Usado quando várias métricas são
// mostradas lado a lado, cada uma com sua própria escala.
export function VehicleMetricChart({ rows, metric, colorMap, height = 190 }) {
  const data = rows
    .filter((row) => row[metric.key] > 0)
    .map((row) => ({ veiculo: row.veiculo, value: row[metric.key] }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="vehicle-metric-chart">
      <span className="vehicle-metric-chart-title">{metric.label}</span>
      <div className="rechart-wrap">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <YAxis type="number" hide domain={[0, (max) => max * 1.2]} />
            <XAxis
              type="category"
              dataKey="veiculo"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: 'var(--text-2)', fontSize: 9.5, fontFamily: 'var(--font-body)' }}
            />
            <Bar dataKey="value" radius={[5, 5, 0, 0]} isAnimationActive={false} barSize={44}>
              {data.map((row) => (
                <Cell key={row.veiculo} fill={colorMap?.get(row.veiculo) || 'var(--blue-700)'} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value) => formatValue(value, metric)}
                style={{ fill: 'var(--text-1)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// rows: [{ veiculo, impressions, cost, clicks, ctr }] — uma barra por veículo,
// com toggle de métrica (mantido para reuso em outras páginas).
export default function VehicleBarChart({ rows, metrics, colorMap, metricKey, onMetricChange }) {
  const metric = metrics.find((m) => m.key === metricKey);

  return (
    <div>
      <MetricSwitch
        options={metrics.map((m) => ({ key: m.key, label: m.label }))}
        activeKey={metricKey}
        onChange={onMetricChange}
        ariaLabel="Selecionar métrica"
      />
      <VehicleMetricChart rows={rows} metric={metric} colorMap={colorMap} height={320} />
    </div>
  );
}
