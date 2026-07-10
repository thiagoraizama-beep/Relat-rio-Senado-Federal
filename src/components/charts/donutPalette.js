// All-blue categorical palette (Senado brand identity) — 16 tones spanning
// navy to sky-blue. A single-hue palette this size can't fully clear the
// dataviz skill's CVD-separation floor (that requires spreading hue), so we
// accept a deliberate trade-off: legend labels always carry the number
// directly, so identity never depends on color alone even when two
// neighboring tones read close.
const SLOT_COLORS_LIGHT = [
  '#0b3480', '#0e3f96', '#1565c2', '#2f8fe8', '#4a9de8',
  '#0d5c8f', '#1878b0', '#2b95c9', '#48add9',
  '#1a3d8f', '#2f5aae', '#4778c4', '#6396d6',
  '#0f2f6b', '#3d6ba8', '#6f9dcf',
];
const SLOT_COLORS_DARK = [
  '#4a8ce0', '#5a9ee5', '#6cb0ea', '#7ec2ef', '#3aa0d0',
  '#4ab2d8', '#5cc4e0', '#3a70d8', '#4a82de',
  '#5c94e4', '#6ca6ea', '#2c5cc0', '#4478d0',
  '#5490dc', '#6ca8e6', '#3888c8',
];

export function useDonutPalette() {
  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches));
  return isDark ? SLOT_COLORS_DARK : SLOT_COLORS_LIGHT;
}

// Um mapa fixo label -> cor, construído a partir da ordem canônica de labels
// (ex: veículos ordenados por investimento total). Cada categoria mantém a
// MESMA cor em todos os gráficos da página, mesmo que a ordem/ranking mude
// de uma métrica para outra.
export function buildColorMap(canonicalLabels, palette) {
  const map = new Map();
  canonicalLabels.forEach((label, i) => {
    map.set(label, palette[i % palette.length]);
  });
  return map;
}
