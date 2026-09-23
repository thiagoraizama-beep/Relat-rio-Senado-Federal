import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { topCreativesByNetwork } from '../../data/campaignData.js';

const QUARTILE_STEPS = [
  { key: 'q25', label: '25%' },
  { key: 'q50', label: '50%' },
  { key: 'q75', label: '75%' },
  { key: 'q100', label: '100%' },
];

const NETWORK_LOGOS = {
  Meta: '/meta.png',
  YouTube: '/youtube.png',
  'Tik Tok': '/tik-tok.png',
  Kwai: '/kwai.png',
};

// "Tik Tok" é a chave interna usada para agrupar dados (bate com o veículo
// bruto da planilha); na exibição o nome correto é junto, "TikTok".
const NETWORK_DISPLAY_NAMES = {
  'Tik Tok': 'TikTok',
};

const fmtQuartile = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function QuartileFunnel({ quartiles }) {
  return (
    <div className="quartile-funnel">
      {QUARTILE_STEPS.map((step) => {
        const value = quartiles[step.key];
        return (
          <div className="quartile-funnel-row" key={step.key}>
            <span className="quartile-funnel-label">{step.label}</span>
            <div className="quartile-funnel-track">
              <div className="quartile-funnel-fill" style={{ '--w': `${value}%` }} />
            </div>
            <span className="quartile-funnel-value">{fmtQuartile.format(value)}%</span>
          </div>
        );
      })}
    </div>
  );
}

function CreativeQuartileCard({ video }) {
  return (
    <div className="quartile-creative-card">
      <h4>{video.name}</h4>
      <QuartileFunnel quartiles={video.quartiles} />
    </div>
  );
}

function PlatformQuartileGroup({ group, delay }) {
  const ref = useReveal();
  // Kwai não disponibiliza os quartis intermediários (25/50/75%) na
  // exportação da plataforma — só "3s video play" e conclusão. Fica de fora
  // desta grade e ganha uma lâmina própria explicando a limitação.
  if (group.network === 'Kwai') return null;
  const videos = group.items.filter((item) => item.isVideo);
  if (videos.length === 0) return null;

  return (
    <div className="quartile-platform-group reveal" data-delay={delay} ref={ref}>
      <div className="quartile-platform-head">
        {NETWORK_LOGOS[group.network] && (
          <img
            className={`quartile-logo quartile-logo-badge quartile-logo-${group.network.toLowerCase().replace(/\s+/g, '-')}`}
            src={NETWORK_LOGOS[group.network]}
            alt=""
          />
        )}
        <h3>{NETWORK_DISPLAY_NAMES[group.network] || group.network}</h3>
      </div>
      <div className="quartile-creative-grid">
        {videos.map((video) => (
          <CreativeQuartileCard video={video} key={video.mediaSlug} />
        ))}
      </div>
    </div>
  );
}

export default function VideoQuartilesSection() {
  const headRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide quartiles-slide" id="slide-quartiles">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Retenção por criativo · Redes sociais</div>
        <h2><Editable id="quartiles-title" as="span" /></h2>
        <Editable id="quartiles-sub" as="p" />
      </div>

      <div className="quartile-platform-list">
        {topCreativesByNetwork.map((group, i) => (
          <PlatformQuartileGroup group={group} delay={Math.min(i + 1, 5)} key={group.network} />
        ))}
      </div>

      <div className="insight-card reveal" data-delay="2" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="quartiles-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
