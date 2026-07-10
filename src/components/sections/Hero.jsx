import { campaignMeta } from '../../data/campaignData.js';

export default function Hero() {
  return (
    <section className="slide hero" id="slide-hero">
      <div className="hero-col hero-col-text">
        <div className="hero-brands-row">
          <img className="hero-brand-logo" src="/CALIX_branco.png" alt="Logo Agência Cálix" />
          <span className="hero-brands-sep" aria-hidden="true" />
          <img className="hero-brand-logo hero-brand-logo-senate" src="/filete_branco_horizontal_1.png" alt="Logo Senado Federal" />
        </div>
        <div className="hero-text-block">
          <span className="hero-kicker">Campanha institucional</span>
          <h1 className="hero-title">
            <span className="hero-title-line">Balanço</span>
            <span className="hero-title-line hero-title-year">1º Semestre</span>
          </h1>
          <p className="hero-subtitle">
            Uma campanha de alcance nacional que levou o trabalho do Senado Federal a milhões de brasileiros,
            reforçando a conexão entre a atividade legislativa e a vida de quem a lei transforma.
          </p>
          <div className="hero-meta">{campaignMeta.period}</div>
        </div>
        <div className="hero-foot">
          <span>Senado Federal</span>
          <span className="hero-foot-sep">·</span>
          <span>Relatório interno</span>
        </div>
      </div>
      <div className="hero-col hero-col-media">
        <div className="hero-photo" />
      </div>
    </section>
  );
}
