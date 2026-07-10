import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      <span className="chart-tooltip-value">{payload[0].value.toFixed(1)}M</span>
    </div>
  );
}

function ValueLabel(props) {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      className="chart-bar-label"
    >
      {value.toFixed(1)}M
    </text>
  );
}

// data: [{ label, value }] — value em milhões. Basta trocar por dados reais
// da planilha mantendo esse formato para o gráfico se atualizar sozinho.
export default function TrendChart({ data }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const peakLabel = data.find((d) => d.value === maxValue)?.label;

  return (
    <div className="rechart-wrap">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 26, right: 4, left: 4, bottom: 0 }} barCategoryGap="28%">
          <defs>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--blue-accent)" />
              <stop offset="100%" stopColor="var(--blue-700)" />
            </linearGradient>
            <linearGradient id="barFillPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--blue-light)" />
              <stop offset="100%" stopColor="var(--blue-accent)" />
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
          <YAxis hide domain={[0, maxValue * 1.28]} />
          <Tooltip cursor={{ fill: 'var(--paper-2)' }} content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[7, 7, 2, 2]} maxBarSize={38}>
            <LabelList dataKey="value" content={ValueLabel} />
            {data.map((d) => (
              <Cell key={d.label} fill={d.label === peakLabel ? 'url(#barFillPeak)' : 'url(#barFill)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
