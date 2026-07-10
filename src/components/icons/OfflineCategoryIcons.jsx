const common = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function RadioIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="14.5" r="1" />
      <path d="M16.5 8a5 5 0 0 0-9 0" />
      <path d="M19.1 5.5a9 9 0 0 0-14.2 0" />
      <rect x="3" y="8" width="18" height="13" rx="2" />
    </svg>
  );
}

function TvIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M8 2 12 6 16 2" />
    </svg>
  );
}

function SatelliteIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M13 7 9 3 5 7l4 4" />
      <path d="m17 11 4 4-4 4-4-4" />
      <path d="m8 12 4 4 6-6" />
      <path d="M16 16 21 21" />
    </svg>
  );
}

function ScreenIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

function DoorIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="1" />
      <path d="M14 12h.01" />
    </svg>
  );
}

function SubwayIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="4" y="3" width="16" height="14" rx="4" />
      <path d="M4 11h16" />
      <circle cx="8.5" cy="14.5" r="0.6" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="0.6" fill="currentColor" />
      <path d="m8 21 2-4" />
      <path d="m16 21-2-4" />
    </svg>
  );
}

function PinIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  );
}

const ICON_MAP = {
  'Rádio': RadioIcon,
  'TV Aberta': TvIcon,
  'TV Fechada': SatelliteIcon,
  'DOOH Painel Digital': ScreenIcon,
  'Minidoor + MUB': DoorIcon,
  'DOOH Metrô + Aeroporto': SubwayIcon,
};

export default function OfflineCategoryIcon({ categoria, ...props }) {
  const Icon = ICON_MAP[categoria] || PinIcon;
  return <Icon {...props} />;
}
