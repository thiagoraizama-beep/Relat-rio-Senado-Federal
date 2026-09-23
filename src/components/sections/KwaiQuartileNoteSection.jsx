import Editable from '../Editable.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { topCreativesByNetwork } from '../../data/campaignData.js';

const kwaiGroup = topCreativesByNetwork.find((g) => g.network === 'Kwai');
const kwaiVideos = kwaiGroup?.items.filter((item) => item.isVideo) ?? [];

function KwaiVideoCard({ video, delay }) {
  const ref = useReveal();
  return (
    <div className="quartile-creative-card reveal" data-delay={delay} ref={ref}>
      <h4>{video.name}</h4>
      <div className="kwai-video-stats">
        <div className="kwai-video-stat">
          <span className="kwai-video-stat-value">{video.viewsFmt}</span>
          <span className="kwai-video-stat-label">Visualizações</span>
        </div>
        <div className="kwai-video-stat">
          <span className="kwai-video-stat-value">{video.completionsFmt}</span>
          <span className="kwai-video-stat-label">Completions</span>
        </div>
        <div className="kwai-video-stat">
          <span className="kwai-video-stat-value">{video.completionRateDetailed}</span>
          <span className="kwai-video-stat-label">Taxa de conclusão</span>
        </div>
      </div>
    </div>
  );
}

export default function KwaiQuartileNoteSection() {
  const headRef = useReveal();
  const noteRef = useReveal();

  return (
    <section className="slide quartiles-slide" id="slide-kwai-quartile-note">
      <div className="section-head reveal" ref={headRef}>
        <div className="eyebrow">Retenção por criativo · Kwai</div>
        <h2><Editable id="kwai-quartile-note-title" as="span" /></h2>
        <Editable id="kwai-quartile-note-sub" as="p" />
      </div>

      <div className="quartile-creative-grid">
        {kwaiVideos.map((video, i) => (
          <KwaiVideoCard video={video} delay={Math.min(i + 1, 5)} key={video.mediaSlug} />
        ))}
      </div>

      <div className="insight-card reveal" data-delay="2" ref={noteRef}>
        <span className="insight-icon">⚠️</span>
        <div className="insight-editable">
          <span className="insight-editable-label">Limitação da plataforma</span>
          <Editable id="kwai-quartile-note-body" as="p" className="insight-body" />
        </div>
      </div>
    </section>
  );
}
