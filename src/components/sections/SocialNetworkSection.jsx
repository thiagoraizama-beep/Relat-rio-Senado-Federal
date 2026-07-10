import Editable from '../Editable.jsx';

// data: { network, investment, impressions, clicks, views, completions, cpm, cpc, cpv, ctr, completionRate }
// delivery: item de vehicleDelivery { contractedFmt, deliveredFmt, pct, pctDisplay, metricLabel } — opcional.
// logoSrc: caminho da imagem do logo (ex: "/meta.png"), em public/.
// Seção full-bleed dividida em duas colunas de azul (identidade Senado),
// ocupando 100% da tela — mesma lógica de composição do Hero.
export default function SocialNetworkSection({ id, eyebrow, editPrefix, networkName, logoSrc, logoClassName = '', data, primaryMetric, delivery, flip }) {
  const hasViews = Number((data.views || '0').replace(/\./g, '')) > 0;

  return (
    <section className={`slide social-slide ${flip ? 'social-slide-flip' : ''}`} id={id}>
      <div className="social-col social-col-brand">
        <div className="social-eyebrow">{eyebrow}</div>
        <div className="social-brand-center">
          <div className="social-brand-row">
            <img className={`social-logo ${logoClassName}`} src={logoSrc} alt={`Logo ${networkName}`} />
            <h2 className="social-network-name">{networkName}</h2>
          </div>
          <Editable id={`${editPrefix}-sub`} as="p" className="social-sub" />
          <div className="social-invest-block">
            <span className="social-invest-label">Investimento total</span>
            <span className="social-invest-value">{data.investment}</span>
          </div>

          {delivery && (
            <div className="social-delivery-block">
              <div className="social-delivery-head">
                <span className="social-delivery-label">Contratado vs. realizado</span>
                <span className="social-delivery-pct">{delivery.pct}%</span>
              </div>
              <div className="social-delivery-track">
                <div className="social-delivery-fill" style={{ '--w': `${delivery.pctDisplay}%` }} />
              </div>
              <span className="social-delivery-caption">
                {delivery.deliveredFmt} entregue de {delivery.contractedFmt} contratado · {delivery.metricLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="social-col social-col-metrics">
        <div className="social-primary-block">
          <span className="social-primary-label">{primaryMetric.label}</span>
          <span className="social-primary-value">{primaryMetric.value}</span>
        </div>

        <div className="social-metrics-grid">
          <div className="social-metric">
            <span className="k">Impressões</span>
            <span className="v">{data.impressions}</span>
          </div>
          <div className="social-metric">
            <span className="k">Cliques</span>
            <span className="v">{data.clicks}</span>
          </div>
          <div className="social-metric">
            <span className="k">CTR</span>
            <span className="v">{data.ctr}</span>
          </div>
          <div className="social-metric">
            <span className="k">CPM</span>
            <span className="v">{data.cpm}</span>
          </div>
          <div className="social-metric">
            <span className="k">CPC</span>
            <span className="v">{data.cpc}</span>
          </div>
          {hasViews && (
            <div className="social-metric">
              <span className="k">Views</span>
              <span className="v">{data.views}</span>
            </div>
          )}
          {hasViews && (
            <div className="social-metric">
              <span className="k">VTR</span>
              <span className="v">{data.completionRate}</span>
            </div>
          )}
        </div>

        <div className="social-insight">
          <span className="social-insight-icon">💡</span>
          <div className="insight-editable">
            <span className="social-insight-label">Análise</span>
            <Editable id={`${editPrefix}-insight`} as="p" className="social-insight-body" />
          </div>
        </div>
      </div>
    </section>
  );
}
