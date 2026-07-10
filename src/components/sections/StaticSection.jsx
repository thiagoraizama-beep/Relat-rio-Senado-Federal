import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { staticCreatives } from '../../data/campaignData.js';

const RANK_LABEL = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'];

function StaticRankRow({ item, rank, delay }) {
  const ref = useReveal();
  const isLeader = rank === 0;

  return (
    <div className={`video-rank-row reveal ${isLeader ? 'is-leader' : ''}`} data-delay={delay} ref={ref}>
      <span className="video-rank-badge">{RANK_LABEL[rank] ?? rank + 1}</span>

      <div className="video-rank-main">
        <div className="video-rank-head">
          <h3>{item.name}</h3>
          {item.format !== '—' && <span className="video-rank-tag">{item.format}</span>}
          <span className="video-rank-tag video-rank-tag-veiculo">{item.veiculo}</span>
          {isLeader && <span className="video-rank-crown">Mais visto</span>}
        </div>
        <div className="video-rank-track">
          <div className="video-rank-fill" style={{ '--w': `${item.impressionsShare}%` }} />
        </div>
      </div>

      <div className="video-rank-metrics">
        <div className="m"><span className="v">{item.impressionsFmt}</span><span className="k">Impressões</span></div>
        <div className="m"><span className="v">{item.clicksFmt}</span><span className="k">Cliques</span></div>
        <div className="m"><span className="v">{item.ctr}</span><span className="k">CTR</span></div>
      </div>
    </div>
  );
}

export default function StaticSection() {
  const headRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide format-slide" id="slide-static">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Ranking por criativo</div>
        <h2><Editable id="static-title" as="span" /></h2>
        <Editable id="static-sub" as="p" />
      </div>

      <div className="video-rank-list">
        {staticCreatives.map((item, i) => (
          <StaticRankRow item={item} rank={i} delay={Math.min(i + 1, 5)} key={item.name} />
        ))}
      </div>

      <div className="insight-card reveal" data-delay="2" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="static-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
