import { useReveal } from '../../hooks/useReveal.js';

const SECTIONS_INDEX = [
  'Resultados consolidados',
  'Portais e mídia programática',
  'Redes sociais e criativos',
  'Vídeos e imagens em destaque',
  'Mídia offline (rádio, TV e mídia exterior)',
  'Compilado geral do impacto',
  'Aprendizados e próximos passos',
];

export default function SummarySection() {
  const headRef = useReveal();
  const bottomRef = useReveal();

  return (
    <section className="slide summary-slide" id="slide-summary">
      <div className="concept-index reveal" ref={headRef}>
        <span className="concept-index-num">02</span>
        <span className="concept-index-label">Sumário</span>
      </div>

      <div className="summary-top">
        <div className="summary-col">
          <span className="summary-col-label">O que você vai ver</span>
          <ol className="summary-index-list">
            {SECTIONS_INDEX.map((item, i) => (
              <li key={item}>
                <span className="summary-index-num">{String(i + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="summary-col">
          <span className="summary-col-label">Prévia geral</span>
          <p className="summary-preview-text">
            O relatório abre com os resultados consolidados de toda a campanha, para dar uma visão rápida do
            todo antes de entrar nos detalhes. Em seguida, mostra o desempenho em portais de notícia e mídia
            programática, seguido de cada rede social separadamente, com seus criativos em destaque e um
            ranking geral dos vídeos e imagens que melhor performaram. Depois, o relatório muda de frente e
            apresenta a mídia offline (rádio, TV e mídia exterior), fechando com um compilado geral que une
            online e offline em uma única leitura de impacto, e uma página final de aprendizados e
            recomendações para os próximos ciclos.
          </p>
        </div>
      </div>

      <div className="summary-bottom reveal" data-delay="1" ref={bottomRef}>
        <div className="summary-how-to-read">
          <h2 className="summary-title">Manual do relatório</h2>
          <p className="summary-text">
            Use os pontinhos à direita da tela para navegar direto entre as seções, passe o mouse sobre eles
            para ver o nome de cada página. As caixas de análise (com o ícone de lâmpada) trazem a leitura dos
            principais números de cada página.
          </p>
        </div>
      </div>
    </section>
  );
}
