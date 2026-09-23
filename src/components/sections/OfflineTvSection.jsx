import Editable from '../Editable.jsx';
import OfflineCategoryIcon from '../icons/OfflineCategoryIcons.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { tvAudienceSimulation } from '../../data/campaignData.js';

const fmt1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtInt = new Intl.NumberFormat('pt-BR');

function formatPeople(n) {
  if (n >= 1_000_000) return `${fmt1.format(n / 1_000_000)} milhões`;
  if (n >= 1_000) return `${fmt1.format(n / 1_000)} mil`;
  return fmtInt.format(n);
}

function ChannelBar({ channel, universe, delay }) {
  const ref = useReveal();
  const reached = universe ? Math.round((universe * channel.reach1plus) / 100) : null;
  return (
    <div className="offline-tv-channel-row reveal" data-delay={delay} ref={ref}>
      <span className="offline-tv-channel-name">{channel.name}</span>
      <div className="delivery-track offline-tv-channel-track">
        <div className="delivery-fill" style={{ '--w': `${channel.share}%` }} />
      </div>
      <span className="offline-tv-channel-value">
        {fmt1.format(channel.share)}% do investimento
        {reached != null && <> · {formatPeople(reached)} pessoas alcançadas</>}
      </span>
    </div>
  );
}

function TvBlock({ data, categoria, noteId, delay }) {
  const headRef = useReveal();
  const popRef = useReveal();
  const statsRef = useReveal();
  const channelsRef = useReveal();

  const outOf100 = Math.round(data.reach1plus);
  const reachedPeople = Math.round((data.universe * data.reach1plus) / 100);

  return (
    <div className="panel offline-tv-block reveal" data-delay={delay} ref={headRef}>
      <div className="offline-tv-block-head">
        <span className="offline-tv-block-icon"><OfflineCategoryIcon categoria={categoria} /></span>
        <div>
          <h3>{data.label}</h3>
          <span className="offline-tv-block-target">{data.target}</span>
        </div>
      </div>

      <div className="impact-population offline-tv-population reveal" data-delay={delay} ref={popRef}>
        <span className="impact-population-value">{outOf100}/100</span>
        <div className="impact-population-text">
          <span className="impact-population-label">
            pessoas viram a campanha pelo menos 1 vez, {formatPeople(reachedPeople)} de pessoas
          </span>
          <span className="impact-population-note">
            de um público de {formatPeople(data.universe)} pessoas · viu em média {fmt1.format(data.avgViews)}x cada uma
          </span>
        </div>
      </div>

      <div className="offline-tv-stats reveal" data-delay={delay} ref={statsRef}>
        <div className="offline-tv-stat">
          <span className="offline-tv-stat-value">{data.insertions}</span>
          <span className="offline-tv-stat-label">inserções veiculadas</span>
        </div>
        <div className="offline-tv-stat">
          <span className="offline-tv-stat-value">{fmt1.format(data.grp)}</span>
          <span className="offline-tv-stat-label">GRPs (pontos de audiência)</span>
        </div>
        <div className="offline-tv-stat">
          <span className="offline-tv-stat-value">{fmt1.format(data.avgViews)}x</span>
          <span className="offline-tv-stat-label">média de exposições por pessoa</span>
        </div>
      </div>

      <Editable id={noteId} as="p" className="offline-tv-note" />

      <div className="offline-tv-channels reveal" data-delay={delay} ref={channelsRef}>
        <span className="panel-title-sm">Participação por emissora</span>
        {data.channels.map((c, i) => (
          <ChannelBar channel={c} universe={data.universe} delay={Math.min(i + 1, 5)} key={c.name} />
        ))}
      </div>
    </div>
  );
}

export default function OfflineTvSection() {
  const headRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide channel-slide" id="slide-offline-tv">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Mídia offline · TV</div>
        <h2><Editable id="offline-tv-title" as="span" /></h2>
        <Editable id="offline-tv-sub" as="p" />
      </div>

      <div className="offline-tv-grid">
        <TvBlock data={tvAudienceSimulation.open} categoria="TV Aberta" noteId="offline-tv-open-note" delay="1" />
        <TvBlock data={tvAudienceSimulation.closed} categoria="TV Fechada" noteId="offline-tv-closed-note" delay="2" />
      </div>

      <div className="insight-card reveal" data-delay="3" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="offline-tv-insight" as="p" className="insight-body" />
        </div>
      </div>

      <p className="offline-tv-source">
        {tvAudienceSimulation.source} Base: {tvAudienceSimulation.universeLabel}. Período: {tvAudienceSimulation.period}.
      </p>
    </section>
  );
}
