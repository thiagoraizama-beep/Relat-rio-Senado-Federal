import { useReveal } from '../../hooks/useReveal.js';

const DATA_SOURCES = [
  { channel: 'Portais e mídia programática', source: 'Adserver' },
  { channel: 'Redes sociais', source: 'Adveronix' },
  { channel: 'Dados do site institucional', source: 'Google Analytics 4' },
];

const GLOSSARY = [
  { term: 'Impressões', def: 'Quantidade de vezes que um anúncio foi exibido, podendo ser vista mais de uma vez pela mesma pessoa.' },
  { term: 'Cliques', def: 'Número de vezes que alguém clicou no anúncio para saber mais ou acessar o link.' },
  { term: 'CTR', def: 'Taxa de cliques: percentual de impressões que resultaram em clique. Mede o quanto o anúncio desperta interesse direto.' },
  { term: 'VTR / Taxa de conclusão', def: 'Percentual de pessoas que assistiram o vídeo até o fim, entre as que começaram a assistir.' },
  { term: 'CPM', def: 'Custo por mil impressões. Modelo de compra usado quando o objetivo é alcance.' },
  { term: 'CPC', def: 'Custo por clique. Modelo de compra usado quando o objetivo é gerar interação direta com o anúncio.' },
  { term: 'CPV', def: 'Custo por visualização completa de vídeo. Modelo de compra usado quando o objetivo é retenção de atenção.' },
  { term: 'Inserções', def: 'Número de vezes que uma peça (rádio, TV ou mídia exterior) foi veiculada ou exibida ao público.' },
  { term: 'Sessões', def: 'Quantidade de visitas ao site institucional. A mesma pessoa pode gerar mais de uma sessão em dias diferentes.' },
  { term: 'Tempo médio', def: 'Duração média de cada visita ao site, um indicador de quanto tempo o público dedicou ao conteúdo.' },
  { term: 'Investimento', def: 'Valor total aplicado na compra de mídia em cada veículo ou rede.' },
  { term: 'Contratado vs. realizado', def: 'Comparação entre o volume combinado no início da campanha e o que foi de fato entregue pelo veículo.' },
];

export default function GlossarySection() {
  const headRef = useReveal();
  const sourcesRef = useReveal();
  const glossaryRef = useReveal();

  return (
    <section className="slide summary-slide" id="slide-glossary">
      <div className="concept-index reveal" ref={headRef}>
        <span className="concept-index-num">03</span>
        <span className="concept-index-label">Guia de métricas</span>
      </div>

      <div className="summary-sources reveal" data-delay="1" ref={sourcesRef}>
        <span className="summary-glossary-label">Fonte dos dados</span>
        <div className="summary-sources-row">
          {DATA_SOURCES.map((item) => (
            <div className="summary-source-item" key={item.channel}>
              <span className="summary-source-channel">{item.channel}</span>
              <span className="summary-source-name">{item.source}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-glossary reveal" data-delay="2" ref={glossaryRef}>
        <span className="summary-glossary-label">Guia de métricas</span>
        <div className="summary-glossary-grid">
          {GLOSSARY.map((item) => (
            <div className="summary-glossary-item" key={item.term}>
              <span className="summary-glossary-term">{item.term}</span>
              <span className="summary-glossary-def">{item.def}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
