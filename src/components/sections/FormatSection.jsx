import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { videoCreatives } from '../../data/campaignData.js';

const RANK_LABEL = ['1º', '2º', '3º', '4º', '5º', '6º'];

function VideoRankRow({ video, rank, delay }) {
  const ref = useReveal();
  const isLeader = rank === 0;

  return (
    <div className={`video-rank-row reveal ${isLeader ? 'is-leader' : ''}`} data-delay={delay} ref={ref}>
      <span className="video-rank-badge">{RANK_LABEL[rank] ?? rank + 1}</span>

      <div className="video-rank-main">
        <div className="video-rank-head">
          <h3>{video.name}</h3>
          <span className="video-rank-tag">{video.format}</span>
          <span className="video-rank-tag video-rank-tag-veiculo">{video.veiculo}</span>
          {isLeader && <span className="video-rank-crown">Mais assistido</span>}
        </div>
        <div className="video-rank-track">
          <div className="video-rank-fill" style={{ '--w': `${video.viewsShare}%` }} />
        </div>
      </div>

      <div className="video-rank-metrics">
        <div className="m"><span className="v">{video.viewsFmt}</span><span className="k">Views</span></div>
        <div className="m"><span className="v">{video.completionRate}</span><span className="k">Conclusão</span></div>
        <div className="m"><span className="v">{video.ctr}</span><span className="k">CTR</span></div>
      </div>
    </div>
  );
}

export default function FormatSection() {
  const headRef = useReveal();
  const insightRef = useReveal();

  return (
    <section className="slide format-slide" id="slide-format">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Ranking por criativo</div>
        <h2><Editable id="format-title" as="span" /></h2>
        <Editable id="format-sub" as="p" />
      </div>

      <div className="video-rank-list">
        {videoCreatives.map((video, i) => (
          <VideoRankRow video={video} rank={i} delay={Math.min(i + 1, 5)} key={video.name} />
        ))}
      </div>

      <div className="insight-card reveal" data-delay="2" ref={insightRef}>
        <span className="insight-icon">💡</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Análise</span>
          <Editable id="format-insight" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
