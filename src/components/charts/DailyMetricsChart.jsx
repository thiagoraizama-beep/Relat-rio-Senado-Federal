import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Dot } from 'recharts';
import MetricSwitch from '../MetricSwitch.jsx';

const METRICS = [
  { key: 'impressions', label: 'Impressões', suffix: 'M', divisor: 1_000_000 },
  { key: 'clicks', label: 'Cliques', suffix: 'K', divisor: 1_000 },
  { key: 'views', label: 'Views', suffix: 'M', divisor: 1_000_000 },
  { key: 'cost', label: 'Investimento', suffix: '', divisor: 1, prefix: 'R$ ' },
];

function formatValue(raw, metric) {
  const scaled = raw / metric.divisor;
  const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: metric.divisor === 1 ? 0 : 1 });
  return `${metric.prefix || ''}${fmt.format(scaled)}${metric.suffix}`;
}

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      <span className="chart-tooltip-value">{formatValue(payload[0].value, metric)}</span>
    </div>
  );
}

function EndDot(props) {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill="var(--blue-accent)" opacity={0.16} />
      <circle cx={cx} cy={cy} r={4} fill="var(--blue-700)" stroke="var(--card-bg)" strokeWidth={2} />
    </g>
  );
}

// series: [{ label, impressions, clicks, views, cost }] — uma linha por dia.
export default function DailyMetricsChart({ series }) {
  const [metricKey, setMetricKey] = useState('impressions');
  const metric = METRICS.find((m) => m.key === metricKey);

  return (
    <div>
      <MetricSwitch
        options={METRICS.map((m) => ({ key: m.key, label: m.label }))}
        activeKey={metricKey}
        onChange={setMetricKey}
        ariaLabel="Selecionar métrica"
      />
      <div className="rechart-wrap">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={series} margin={{ top: 20, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-body)' }}
              dy={8}
            />
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip
              cursor={{ stroke: 'var(--blue-accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={<ChartTooltip metric={metric} />}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke="var(--blue-700)"
              strokeWidth={2.5}
              dot={(props) => <EndDot key={props.index} {...props} dataLength={series.length} />}
              activeDot={{ r: 5, fill: 'var(--blue-700)', stroke: 'var(--card-bg)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
