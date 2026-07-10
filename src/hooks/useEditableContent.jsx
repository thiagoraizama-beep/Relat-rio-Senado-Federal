import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'senado-campanha-edits-v1';

export const defaultTexts = {
  'portals-intro-title-1': 'Onde a notícia acontece,',
  'portals-intro-title-2': 'a campanha também está.',
  'portals-intro-body':
    'A seguir, o desempenho da campanha em portais de notícia e mídia programática: o alcance direto em veículos de grande audiência e a compra automatizada de espaço publicitário em rede, que ampliam a presença da campanha por todo o país.',
  'social-intro-title-1': 'E nas redes sociais,',
  'social-intro-title-2': 'a conversa continua.',
  'social-intro-body':
    'Depois dos portais e da mídia programática, a campanha também chega onde o público passa o dia: Meta, YouTube, TikTok e Kwai. A seguir, o desempenho detalhado de cada rede social e seus criativos.',
  'kpi-title': 'Resultados consolidados',
  'kpi-sub':
    'Números agregados de todas as peças da campanha institucional no período, somando redes sociais, portais e mídia programática.',
  'kpi-insight':
    'No período consolidado, a campanha atingiu 91,9 milhões de impressões e 129,5 mil cliques (CTR médio de 0,14%), com 11,1 milhões de video views e 3,5 milhões de completions. O CPM médio de R$ 34,86 reflete a combinação de canais com propósitos distintos, alcance em redes sociais, autoridade editorial em portais e programática qualificada. A curva diária de investimento mostra concentração de veiculação entre 22/06 e 30/06, coincidindo com os maiores volumes de impressões do período, o que indica uma estratégia de flighting concentrado em vez de distribuição linear.',
  'format-title': 'Performance por vídeo',
  'format-sub':
    'Desempenho individual de cada criativo em vídeo, comparando formatos e durações diferentes lado a lado.',
  'format-insight':
    'Os vídeos institucionais de 30s e 60s veiculados no Meta lideram o ranking consolidado de vídeo, somando 10,6 milhões de views, com a versão de 30s alcançando taxa de visualização de 89% sobre as impressões entregues (5,98 milhões de views em 6,4 milhões de impressões). Os três criativos do Kwai (Gás do Povo, Tornozeleira para Agressores e Renovação Automática da CNH) apresentam volumes de impressões próximos entre si, na faixa de 1,4 milhão cada, formato consistente com o modelo CPM da rede, priorizando cobertura ampla e uniforme entre os temas.',
  'static-title': 'Performance por imagem',
  'static-insight':
    'O criativo "Tornozeleira Eletrônica para Agressores" lidera o ranking de estáticos com 6,8 milhões de impressões, seguido por "Vicariocídio Vira Crime Hediondo" (6,4 milhões) e "Isenção de Imposto de Renda" (6,4 milhões). Em engajamento direto, o carrossel "5 Leis que já Fazem Parte da Sua Vida" se destaca com o maior CTR do grupo (0,11%), sugerindo que o formato carrossel favorece a interação mesmo operando com um volume de impressões inferior ao dos líderes de alcance.',
  'static-sub':
    'Desempenho individual de cada criativo estático, entre banners, carrosséis e peças por tema, comparados lado a lado.',
  'channel-title': 'Visão geral por veículo',
  'channel-sub':
    'Impressões, investimento, cliques e CTR comparados entre os portais e a mídia paga da campanha.',
  'channel-insight':
    'Entre portais e mídia programática, o Spotify concentra o maior volume de impressões (11,2 milhões) e o maior investimento do grupo (R$ 285,5 mil), consistente com seu peso relativo na estratégia. Em cliques, R7 Portal (13,4 mil) e Hands (25,2 mil) se destacam: o Hands opera sob modelo CPC, o que explica seu CTR proporcionalmente mais alto frente aos demais veículos, calibrados para impressão. A Netflix concentra o maior investimento absoluto do grupo (R$ 436 mil) para um volume de impressões mais contido, padrão típico de inventário CTV/streaming premium, onde o custo por mil reflete a qualidade e exclusividade do ambiente de exibição.',
  'delivery-title': 'Entregas por veículo',
  'delivery-sub':
    'Contratado versus realizado por veículo da campanha, no modelo de compra específico de cada um.',
  'delivery-insight':
    'O pacing consolidado mostra entrega dentro ou acima do contratado na maior parte dos veículos: Spotify (104%), R7 Portal (101%), AdMax (104%), Netflix (101%), Diário dos Associados (101%), Deezer (100%) e Hands (101%) atingem ou superam o volume acordado. Globo.com (69%) e UOL (90%) apresentam entrega parcial no corte do período analisado, e NewCom fecha em 81% do contratado, pontos que seguem em acompanhamento junto aos veículos para o fechamento total do volume negociado.',
  'meta-sub':
    'Desempenho consolidado de Instagram e Facebook na campanha institucional, com foco em impressões e CPM.',
  'meta-insight':
    'O Meta (Instagram e Facebook consolidados) concentra o maior volume entre as redes sociais da campanha, com 40,4 milhões de impressões e CPM de R$ 13,30, o mais eficiente do grupo em custo por mil. O investimento de R$ 536,9 mil, sob modelo CPM, posiciona a rede como o principal motor de alcance da campanha nas redes sociais, com 13,6 mil cliques adicionais capturados organicamente pelos criativos ao longo da veiculação.',
  'youtube-sub':
    'Desempenho do YouTube na campanha institucional, com foco em visualizações e taxa de conclusão.',
  'youtube-insight':
    'Sob modelo CPV, o YouTube entrega 483,2 mil views completas com taxa de conclusão de 63%, a mais alta entre as quatro redes sociais da campanha, sobre um total de 771,1 mil impressões. O CPV de R$ 1,26 e o investimento de R$ 608,9 mil confirmam a rede como o canal mais indicado da campanha para objetivos de retenção e consumo integral do conteúdo em vídeo, em contraste com redes otimizadas para alcance.',
  'tiktok-sub':
    'Desempenho do TikTok na campanha institucional, com foco em cliques e CTR.',
  'tiktok-insight':
    'Sob modelo CPC, o TikTok registra CTR de 31,02%, o mais alto entre as quatro redes sociais da campanha, com 47,1 mil cliques capturados sobre 151,8 mil impressões. O CPC de R$ 10,50 e o investimento de R$ 494,5 mil evidenciam a rede como o canal mais eficiente da campanha para geração de interação direta e tráfego qualificado a partir do formato in-feed.',
  'kwai-sub':
    'Desempenho do Kwai na campanha institucional, com foco em impressões e alcance.',
  'kwai-insight':
    'Sob modelo CPM, o Kwai entrega 4,2 milhões de impressões com CPM de R$ 13,30, no mesmo patamar de eficiência do Meta, com o menor investimento absoluto entre as redes sociais da campanha (R$ 56,2 mil). A entrega bate exatamente 100% do volume contratado, resultado que evidencia precisão no planejamento de pacing e controle rigoroso de orçamento ao longo de todo o período de veiculação.',
  'meta-creatives-title': 'Melhores criativos',
  'meta-creatives-sub':
    'Ranking dos criativos no Meta por impressões. O critério de compra é CPM.',
  'meta-creatives-insight':
    'O ranking de criativos no Meta, ordenado por impressões conforme o modelo CPM da rede, tem "Tornozeleira Eletrônica para Agressores" na liderança com 6,8 milhões, seguido por "Vicariocídio Vira Crime Hediondo" (6,4 milhões) e "Isenção de Imposto de Renda" (6,4 milhões). Os vídeos institucionais de 30s e 60s completam o top 5, com destaque para o de 30s, que combina 5,6 milhões de impressões a 127 mil engajamentos, o maior volume de interação orgânica entre os oito criativos ativos na rede.',
  'youtube-creatives-title': 'Criativo em destaque',
  'youtube-creatives-sub':
    'Desempenho do criativo veiculado no YouTube. O critério de compra é CPV, avaliado pela taxa de conclusão.',
  'youtube-creatives-insight':
    'O vídeo institucional de 30 segundos, único criativo ativo no YouTube, é avaliado por taxa de conclusão conforme o modelo CPV da rede e alcança 63%, com 483,2 mil views completas sobre 771,1 mil impressões totais. A distribuição diária mostra concentração de entrega nos dois primeiros dias de veiculação (18/06 e 19/06), com um segundo pico pontual registrado em 02/07, indicativo de reforço de investimento próximo ao fechamento do período.',
  'tiktok-creatives-title': 'Criativo em destaque',
  'tiktok-creatives-sub':
    'Desempenho do criativo veiculado no TikTok. O critério de compra é CPC, avaliado pelo CTR.',
  'tiktok-creatives-insight':
    'O criativo "Tornozeleira Eletrônica para Agressores", único ativo no TikTok, é avaliado por CTR conforme o modelo CPC da rede e atinge 31,02%, com 47,1 mil cliques sobre 151,8 mil impressões no formato in-feed. A entrega e a interação se concentram fortemente em 21/06, primeiro dia de veiculação, responsável por 120,8 mil impressões e 37,3 mil cliques, com cauda de manutenção nos dias seguintes até a finalização do flight.',
  'kwai-creatives-title': 'Melhores criativos',
  'kwai-creatives-sub':
    'Ranking dos criativos no Kwai por impressões. O critério de compra é CPM.',
  'kwai-creatives-insight':
    'Os três criativos em vídeo do Kwai apresentam volumes de impressões próximos entre si, entre 1,39 e 1,43 milhão cada, resultado do modelo CPM da rede, que distribui a entrega de forma equilibrada entre os temas ativos. "Gás do Povo" lidera com 1,43 milhão de impressões, seguido por "Tornozeleira para Agressores" (1,41 milhão) e "Renovação Automática da CNH" (1,39 milhão), todos concentrando a maior parte da veiculação na janela de 21/06 a 24/06.',
  'insights-title': 'Aprendizados e próximos passos',
  'insights-sub':
    'Principais leituras da campanha institucional e recomendações para os próximos ciclos.',
  'offline-intro-title-1': 'Além das telas,',
  'offline-intro-title-2': 'a campanha chega às ruas.',
  'offline-intro-body':
    'Para garantir ampla cobertura nacional, a estratégia também reúne peças em rádio, TV e mídia exterior, levando o mesmo conceito da campanha institucional a públicos que a internet sozinha não alcança em todo o país.',
  'offline-kpi-title': 'Resultados consolidados',
  'offline-kpi-sub':
    'Números agregados de rádio, TV e mídia exterior no período, somando investimento e inserções por categoria.',
  'offline-kpi-insight':
    'A mídia offline somou R$ 15,1 milhões em investimento e 126,4 milhões de inserções, distribuídos entre 723 veículos ativos em 28 praças e estados, capilaridade que amplia o alcance geográfico da campanha para além da cobertura digital. A composição de investimento é liderada por TV Aberta (56,8%), consistente com seu papel de qualificação de alcance em rede nacional, enquanto o volume de inserções é dominado pela mídia exterior, reflexo da natureza de alta frequência e exposição contínua desse formato ao longo do dia.',
  'offline-channel-title': 'Visão geral por categoria',
  'offline-channel-sub':
    'Investimento e inserções comparados entre rádio, TV e mídia exterior da campanha.',
  'offline-channel-insight':
    'TV Aberta concentra o maior investimento entre as categorias offline (R$ 8,6 milhões, 56,8% do total), seguida por Rádio (R$ 2 milhões, 13,2%) e Minidoor + MUB (R$ 1,8 milhão, 12,1%). Entre os veículos individuais, a GLOBO lidera o investimento em TV Aberta com R$ 3,8 milhões em apenas 9 inserções, refletindo o valor de espaços em rede nacional, enquanto a JCDecaux se destaca em mídia exterior com mais de 1 milhão de inserções, evidenciando a escala de frequência característica desse formato.',
  'impact-intro-title-1': 'Duas frentes,',
  'impact-intro-title-2': 'um só resultado.',
  'impact-intro-body':
    'Depois de detalhar cada frente separadamente, o próximo passo é olhar para o todo. A seguir, um compilado geral reúne os números de mídia online e offline em uma única visão do impacto da campanha institucional em todo o país.',
  'impact-title': 'Impacto geral da campanha',
  'impact-sub':
    'Compilado de mídia online e offline: visão consolidada do alcance total da campanha institucional.',
  'impact-insight':
    'Consolidando online e offline, a campanha atingiu R$ 18,3 milhões em investimento total e 218,4 milhões de impactos (impressões digitais somadas a inserções de mídia tradicional), equivalente a 102,5% da população brasileira em volume de exposições brutas, métrica de escala e não de alcance único, já que a mesma pessoa pode ter sido impactada em mais de um canal ao longo do período. Esse volume de exposição se traduziu em engajamento direto com a plataforma institucional: 63.927 sessões registradas no site, com tempo médio de navegação de 1min32s, indicador de leitura efetiva do conteúdo, e custo por sessão de R$ 50,15.',
  'impact-ga4-sessions': '63.927',
  'impact-ga4-time': '1m 32s',
  'impact-ga4-cost': 'R$ 50,15',
  'thanks-sub':
    'Obrigado por acompanhar os resultados da campanha institucional do Senado Federal. Este relatório reúne o desempenho consolidado de todas as frentes de mídia, online e offline, no período analisado.',
};

export const defaultLists = {
  'insights-learnings': [
    'Cada rede social operou com um propósito de mídia claramente diferenciado, refletido no seu modelo de compra: Meta (CPM, 40,4 milhões de impressões) e Kwai (CPM, 4,2 milhões) priorizaram cobertura, YouTube (CPV, taxa de conclusão de 63%) priorizou retenção de atenção, e TikTok (CPC, CTR de 31,02%) priorizou interação direta. A combinação dos quatro modelos permitiu que a campanha cobrisse simultaneamente os três objetivos centrais de um funil de mídia, alcance, atenção e ação, dentro do mesmo orçamento de redes sociais.',
    'A mídia offline demonstrou papel complementar claro entre categorias: TV Aberta concentrou 56,8% do investimento com apenas 75 inserções no total, entregando alcance qualificado em rede nacional, enquanto mídia exterior (Minidoor, MUB e DOOH) respondeu por praticamente a totalidade das 126,4 milhões de inserções do período, sustentando frequência de exposição urbana contínua. As duas frentes juntas ampliam a cobertura da campanha para públicos que a mídia digital não alcança isoladamente.',
    'O pacing de entrega em portais e mídia programática mostrou alta previsibilidade: 7 dos 12 veículos com contratação (Meta, Spotify, R7 Portal, AdMax, Netflix, Diário dos Associados, Deezer e Hands) atingiram ou superaram 100% do volume acordado dentro do período analisado, indicando planejamento de mídia bem calibrado entre contratação e capacidade de entrega dos veículos.',
    'Dentro do Meta, vídeo e estático cumpriram funções distintas e complementares no mesmo canal: o vídeo institucional de 30s combinou alto volume (5,6 milhões de impressões) com forte retenção (89% de taxa de visualização), enquanto estáticos como "Vicariocídio Vira Crime Hediondo" sustentaram cobertura ampla com CTR consistente. Isso confirma que a diversificação de formato dentro de uma mesma rede amplia a superfície de contato com públicos com preferências de consumo diferentes.',
    'A soma de mídia online e offline resultou em 218,4 milhões de impactos brutos, equivalente a 102,5% da população brasileira em volume de exposição, uma métrica de escala nacional consistente com o caráter institucional da campanha. Esse volume converteu-se em 63.927 sessões no site institucional, com tempo médio de navegação de 1min32s, sinal de que parte relevante do público impactado buscou aprofundar a informação além do primeiro contato com a peça publicitária.',
  ],
  'insights-next-steps': [
    'Estruturar testes controlados de modelo de compra dentro das redes que hoje operam majoritariamente sob CPM (Meta e Kwai), aplicando parcialmente a lógica de CPC observada no TikTok, para mensurar comparativamente a eficiência de custo por clique entre modelos dentro do mesmo canal.',
    'Incorporar dados de audiência de mercado (IBOPE, Kantar ou equivalente) à leitura de mídia offline, especialmente em rádio e mídia exterior, para complementar o volume bruto de inserções com uma estimativa de alcance qualificado por categoria.',
    'Acompanhar o fechamento de pacing de Globo.com, UOL e NewCom nos próximos cortes de dados, garantindo visibilidade completa da entrega desses veículos até o encerramento total do período contratado.',
    'Documentar e replicar os elementos criativos que mais contribuíram para CTR no TikTok e taxa de conclusão no YouTube (roteiro, duração, gancho inicial) como referência para o briefing de criativos da próxima campanha institucional.',
    'Cruzar os dados de sessão e tempo médio do site institucional com os períodos de maior investimento por canal, aprofundando a leitura de jornada entre exposição à mídia paga e busca ativa por informação no site.',
    'Manter a atualização periódica da base de dados consolidada (pipeline já implementado neste relatório) ao longo do próximo ciclo de campanha, viabilizando leituras de performance parcial e ajustes de alocação de verba antes do fechamento final.',
  ],
};

const LISTS_STORAGE_KEY = 'senado-campanha-edits-lists-v1';

const EditableContext = createContext(null);

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function loadSavedLists() {
  try {
    return JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function EditableProvider({ children }) {
  const [edits, setEdits] = useState(loadSaved);
  const [listEdits, setListEdits] = useState(loadSavedLists);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  }, [edits]);

  useEffect(() => {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(listEdits));
  }, [listEdits]);

  const setText = useCallback((key, value) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getText = useCallback(
    (key) => (edits[key] !== undefined ? edits[key] : defaultTexts[key] ?? ''),
    [edits]
  );

  const getList = useCallback(
    (key) => (listEdits[key] !== undefined ? listEdits[key] : defaultLists[key] ?? []),
    [listEdits]
  );

  const setList = useCallback((key, items) => {
    setListEdits((prev) => ({ ...prev, [key]: items }));
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LISTS_STORAGE_KEY);
    setEdits({});
    setListEdits({});
  }, []);

  const value = useMemo(
    () => ({ editMode, setEditMode, getText, setText, getList, setList, resetAll }),
    [editMode, getText, setText, getList, setList, resetAll]
  );

  return <EditableContext.Provider value={value}>{children}</EditableContext.Provider>;
}

export function useEditable() {
  const ctx = useContext(EditableContext);
  if (!ctx) throw new Error('useEditable must be used within EditableProvider');
  return ctx;
}
