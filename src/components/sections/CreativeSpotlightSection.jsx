import { useState } from 'react';
import Editable from '../Editable.jsx';
import CreativeMedia from '../CreativeMedia.jsx';
import CreativeDetailModal from '../CreativeDetailModal.jsx';
import { useReveal } from '../../hooks/useReveal.js';

function buildSupportMetrics(item) {
  // Métricas de apoio — nunca repete a métrica já destacada em cima
  // (scoreLabel), que varia conforme o modelo de compra (CPM/CPC/CPV).
  return [
    { key: 'Investimento', v: item.cost },
    item.scoreLabel !== 'Impressões' && { key: 'Impressões', v: item.impressionsFmt },
    item.scoreLabel !== 'CTR' && { key: 'Cliques / CTR', v: `${item.clicksFmt} · ${item.ctr}` },
    item.isVideo && item.scoreLabel !== 'Taxa de conclusão' && { key: 'Views', v: item.viewsFmt },
    item.hasEngagements && { key: 'Engajamentos', v: item.engagementsFmt },
  ].filter(Boolean);
}

function SpotlightCard({ item, rank, delay, onOpen }) {
  const ref = useReveal();
  const badge = rank === 'best' ? '🥇 Melhor' : rank === 'second' ? '🥈 2º lugar' : 'Menor desempenho';
  const cardClass = rank === 'best' ? 'spotlight-card-best' : rank === 'worst' ? 'spotlight-card-worst' : '';
  const supportMetrics = buildSupportMetrics(item);

  return (
    <div className={`spotlight-card ${cardClass} reveal`} data-delay={delay} ref={ref}>
      <div className="spotlight-media-wrap">
        <CreativeMedia item={item} className="spotlight-media" />
        <span className={`spotlight-badge ${rank === 'worst' ? 'is-worst' : ''}`}>{badge}</span>
      </div>
      <div className="spotlight-info">
        <h3 className="spotlight-name">{item.name}</h3>
        <span className="video-rank-tag spotlight-format">{item.format}</span>
        <div className="spotlight-score">
          <span className="spotlight-score-value">{item.scoreDisplay}</span>
          <span className="spotlight-score-label">{item.scoreLabel}</span>
        </div>
        <div className="spotlight-metrics">
          {supportMetrics.map((m) => (
            <div className="spotlight-metric" key={m.key}>
              <span className="k">{m.key}</span>
              <span className="v">{m.v}</span>
            </div>
          ))}
        </div>
        <button className="spotlight-more" onClick={() => onOpen(item)}>
          Ver mais <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

// Layout dedicado quando a rede só tem 1 criativo: card do criativo à
// esquerda (mesmo tamanho/proporção do card padrão dos grids de 3), análise
// à direita.
function SingleCreativeLayout({ item, editPrefix, insightRef, onOpen }) {
  const mediaRef = useReveal();
  const supportMetrics = buildSupportMetrics(item);

  return (
    <div className="spotlight-solo">
      <div className="spotlight-solo-media reveal" data-delay="1" ref={mediaRef}>
        <div className="spotlight-card spotlight-card-best">
          <div className="spotlight-media-wrap">
            <CreativeMedia item={item} className="spotlight-media" />
            <span className="spotlight-badge">🥇 Melhor</span>
          </div>
          <div className="spotlight-info">
            <h3 className="spotlight-name">{item.name}</h3>
            <span className="video-rank-tag spotlight-format">{item.format}</span>
            <div className="spotlight-score">
              <span className="spotlight-score-value">{item.scoreDisplay}</span>
              <span className="spotlight-score-label">{item.scoreLabel}</span>
            </div>
            <div className="spotlight-metrics">
              {supportMetrics.map((m) => (
                <div className="spotlight-metric" key={m.key}>
                  <span className="k">{m.key}</span>
                  <span className="v">{m.v}</span>
                </div>
              ))}
            </div>
            <button className="spotlight-more" onClick={() => onOpen(item)}>
              Ver mais <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="spotlight-solo-side">
        <div className="insight-card spotlight-solo-insight reveal" data-delay="2" ref={insightRef}>
          <span className="insight-icon">💡</span>
          <div className="insight-editable">
            <span className="insight-editable-label">Análise</span>
            <Editable id={`${editPrefix}-insight`} as="p" className="insight-body" />
          </div>
        </div>
      </div>
    </div>
  );
}

// items já vem ordenado do melhor pro pior (score desc) pelo script de sync.
export default function CreativeSpotlightSection({ id, editPrefix, networkName, items }) {
  const headRef = useReveal();
  const insightRef = useReveal();
  const [selected, setSelected] = useState(null);

  if (!items || items.length === 0) return null;

  const single = items.length === 1;
  const best = items[0];
  const second = items[1];
  const worst = items.length > 1 ? items[items.length - 1] : null;
  const showWorst = items.length > 2 && worst !== second;

  return (
    <section className="slide spotlight-slide" id={id}>
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Criativos · {networkName}</div>
        <h2><Editable id={`${editPrefix}-title`} as="span" /></h2>
        <Editable id={`${editPrefix}-sub`} as="p" />
      </div>

      {single ? (
        <SingleCreativeLayout item={best} editPrefix={editPrefix} insightRef={insightRef} onOpen={setSelected} />
      ) : (
        <>
          <div className="spotlight-row">
            <SpotlightCard item={best} rank="best" delay="1" onOpen={setSelected} />
            {second && <SpotlightCard item={second} rank="second" delay="2" onOpen={setSelected} />}
            {showWorst && <SpotlightCard item={worst} rank="worst" delay="3" onOpen={setSelected} />}
          </div>

          <div className="insight-card reveal" data-delay="4" style={{ marginTop: 14 }} ref={insightRef}>
            <span className="insight-icon">💡</span>
            <div className="insight-editable">
              <span className="insight-editable-label">Análise</span>
              <Editable id={`${editPrefix}-insight`} as="p" className="insight-body" />
            </div>
          </div>
        </>
      )}

      <CreativeDetailModal item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
