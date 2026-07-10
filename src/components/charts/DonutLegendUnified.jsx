// labels: lista canônica de veículos (mesma ordem usada para construir o colorMap).
export default function DonutLegendUnified({ labels, colorMap }) {
  return (
    <ul className="donut-legend-unified">
      {labels.map((label) => (
        <li key={label}>
          <span className="channel-donut-dot" style={{ background: colorMap.get(label) }} />
          <span className="channel-donut-label">{label}</span>
        </li>
      ))}
    </ul>
  );
}
