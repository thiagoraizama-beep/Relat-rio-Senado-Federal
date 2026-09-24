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
  'quartiles-title': 'Quartis de vídeo por plataforma e criativo',
  'quartiles-sub':
    'Percentual de visualizações que atingiram cada quartil (25%, 50%, 75% e 100%) em cada criativo, agrupados por rede social, só redes sociais (Meta, YouTube, TikTok e Kwai).',
  'quartiles-insight':
    'O YouTube apresenta a maior retenção entre as redes: o institucional de 30s mantém 63% das visualizações até a conclusão, reflexo do modelo CPV que remunera a rede pela visualização completa. O TikTok também sustenta boa retenção nos quartis iniciais, mas cai bastante depois dos 50%. Já Meta tem retenção baixa em quase todos os quartis, indicativo de visualizações no modelo CPM sem foco em conclusão do vídeo.',
  'kwai-quartile-note-title': 'Kwai não reporta quartis de retenção',
  'kwai-quartile-note-sub':
    'Os três criativos em vídeo veiculados no Kwai (Gás do Povo, Tornozeleira para Agressores e Renovação Automática da CNH) não têm dado de retenção por quartil (25%, 50%, 75%) disponível.',
  'kwai-quartile-note-body':
    'A exportação de dados do Kwai não disponibiliza os eventos intermediários de retenção de vídeo (25%, 50% e 75% assistidos): a plataforma só reporta "3-second video play" (início da visualização) e "vídeo completado" (conclusão total), sem os pontos intermediários que Meta, YouTube e TikTok fornecem. Por isso os criativos do Kwai não aparecem na grade de quartis: não é ausência de retenção, é uma métrica que a própria plataforma não disponibiliza para exportação.',
  'format-title': 'Performance por vídeo',
  'format-sub':
    'Desempenho individual de cada criativo em vídeo, comparando formatos e durações diferentes lado a lado.',
  'format-insight':
    'Os vídeos institucionais de 30s e 60s veiculados no Meta lideraram o ranking consolidado de vídeo, somando 10,6 milhões de views, com a versão de 30s alcançando taxa de visualização de 94% sobre as impressões entregues (5,98 milhões de views em 6,4 milhões de impressões). Os três criativos do Kwai (Gás do Povo, Tornozeleira para Agressores e Renovação Automática da CNH) apresentaram volumes de impressões próximos entre si, na faixa de 1,4 milhão cada, formato consistente com o modelo CPM da rede, priorizando cobertura ampla e uniforme entre os temas.',
  'static-title': 'Performance por imagem',
  'static-insight':
    'O criativo "Tornozeleira Eletrônica para Agressores" lidera o ranking de estáticos com 6,8 milhões de impressões, seguido por "Vicariocídio Vira Crime Hediondo" (6,4 milhões) e "Isenção de Imposto de Renda" (6,4 milhões). Em engajamento direto, o carrossel "5 Leis que já Fazem Parte da Sua Vida" se destaca com o maior CTR do grupo (0,11%), sugerindo que o formato carrossel favorece a interação mesmo operando com um volume de impressões inferior ao dos líderes de alcance.',
  'static-sub':
    'Desempenho individual de cada criativo estático, entre banners, carrosséis e peças por tema, comparados lado a lado.',
  'channel-title': 'Visão geral por veículo',
  'channel-sub':
    'Impressões, investimento, cliques e CTR comparados entre os portais e a mídia paga da campanha.',
  'channel-insight':
    'Entre portais e mídia programática, o Spotify concentrou o maior volume de impressões (11,2 milhões) e o maior investimento do grupo (R$ 285,5 mil), consistente com seu peso relativo na estratégia. Em cliques, R7 Portal (13,4 mil) e Hands (25,2 mil) se destacaram: o Hands operou sob modelo CPC, o que explica seu CTR proporcionalmente mais alto frente aos demais veículos, calibrados para impressão. A Netflix concentrou o maior investimento absoluto do grupo (R$ 436 mil) para um volume de impressões mais contido, padrão típico de inventário CTV/streaming premium, onde o custo por mil reflete a qualidade e exclusividade do ambiente de exibição.',
  'delivery-title': 'Entregas por veículo',
  'delivery-sub':
    'Contratado versus realizado por veículo da campanha, no modelo de compra específico de cada um.',
  'delivery-insight':
    'A maioria dos veículos com contratação (Spotify, R7 Portal, AdMax, Netflix, Diário dos Associados, Deezer e Hands) atingiu ou superou o volume acordado. Globo.com, UOL e NewCom seguem com parte do volume contratado ainda em veiculação, o que mantém espaço de entrega para os próximos ciclos junto a esses veículos.',
  'meta-sub':
    'Desempenho consolidado de Instagram e Facebook na campanha institucional, com foco em impressões e CPM.',
  'meta-insight':
    'O Meta (Instagram e Facebook consolidados) concentrou o maior volume entre as redes sociais da campanha, com 40,4 milhões de impressões e CPM de R$ 13,30, o mais eficiente do grupo em custo por mil. O investimento de R$ 536,9 mil, sob modelo CPM, posicionou a rede como o principal motor de alcance da campanha nas redes sociais, com 13,6 mil cliques adicionais capturados organicamente pelos criativos ao longo da veiculação.',
  'youtube-sub':
    'Desempenho do YouTube na campanha institucional, com foco em visualizações e taxa de conclusão.',
  'youtube-insight':
    'Sob modelo CPV, o YouTube entregou 483,2 mil views completas com taxa de conclusão de 63%, a mais alta entre as quatro redes sociais da campanha, sobre um total de 771,1 mil impressões. O CPV de R$ 1,26 e o investimento de R$ 608,9 mil confirmam a rede como o canal mais indicado da campanha para objetivos de retenção e consumo integral do conteúdo em vídeo, em contraste com redes otimizadas para alcance.',
  'tiktok-sub':
    'Desempenho do TikTok na campanha institucional, com foco em cliques e CTR.',
  'tiktok-insight':
    'Sob modelo CPC, o TikTok registrou CTR de 31,02%, o mais alto entre as quatro redes sociais da campanha, com 47,1 mil cliques capturados sobre 151,8 mil impressões. O CPC de R$ 10,50 e o investimento de R$ 494,5 mil evidenciam a rede como o canal mais eficiente da campanha para geração de interação direta e tráfego qualificado a partir do formato in-feed.',
  'kwai-sub':
    'Desempenho do Kwai na campanha institucional, com foco em impressões e alcance.',
  'kwai-insight':
    'Sob modelo CPM, o Kwai entregou 4,2 milhões de impressões com CPM de R$ 13,30, no mesmo patamar de eficiência do Meta, com o menor investimento absoluto entre as redes sociais da campanha (R$ 56,2 mil). Do volume originalmente contratado de 31,2 milhões de impressões, a rede entregou 14%, resultado da realocação de parte da verba planejada para o Kwai em favor de outros meios ao longo da campanha, mantendo ainda assim eficiência de custo por mil equivalente à do Meta no volume efetivamente veiculado.',
  'meta-creatives-title': 'Melhores criativos',
  'meta-creatives-sub':
    'Ranking dos criativos no Meta por impressões. O critério de compra é CPM.',
  'meta-creatives-insight':
    'O ranking de criativos no Meta, ordenado por impressões conforme o modelo CPM da rede, teve "Tornozeleira Eletrônica para Agressores" na liderança com 6,8 milhões, seguido por "Vicariocídio Vira Crime Hediondo" (6,4 milhões) e "Isenção de Imposto de Renda" (6,4 milhões). Os vídeos institucionais de 30s e 60s completaram o top 5, com destaque para o de 30s, que combinou 5,6 milhões de impressões a 127 mil engajamentos, o maior volume de interação orgânica entre os oito criativos veiculados na rede.',
  'youtube-creatives-title': 'Criativo em destaque',
  'youtube-creatives-sub':
    'Desempenho do criativo veiculado no YouTube. O critério de compra é CPV, avaliado pela taxa de conclusão.',
  'youtube-creatives-insight':
    'O vídeo institucional de 30 segundos, único criativo veiculado no YouTube, foi avaliado por taxa de conclusão conforme o modelo CPV da rede e alcançou 63%, com 483,2 mil views completas sobre 771,1 mil impressões totais. A distribuição diária mostra concentração de entrega nos dois primeiros dias de veiculação (18/06 e 19/06), com um segundo pico pontual registrado em 02/07, indicativo de reforço de investimento na reta final do período.',
  'tiktok-creatives-title': 'Criativo em destaque',
  'tiktok-creatives-sub':
    'Desempenho do criativo veiculado no TikTok. O critério de compra é CPC, avaliado pelo CTR.',
  'tiktok-creatives-insight':
    'O criativo "Tornozeleira Eletrônica para Agressores", único veiculado no TikTok, foi avaliado por CTR conforme o modelo CPC da rede e atingiu 31,02%, com 47,1 mil cliques sobre 151,8 mil impressões no formato in-feed. A entrega e a interação se concentraram fortemente em 21/06, primeiro dia de veiculação, responsável por 120,8 mil impressões e 37,3 mil cliques, com manutenção nos dias seguintes até o encerramento do flight.',
  'kwai-creatives-title': 'Melhores criativos',
  'kwai-creatives-sub':
    'Ranking dos criativos no Kwai por impressões. O critério de compra é CPM.',
  'kwai-creatives-insight':
    'Os três criativos em vídeo do Kwai apresentaram volumes de impressões próximos entre si, entre 1,39 e 1,43 milhão cada, resultado do modelo CPM da rede, que distribuiu a entrega de forma equilibrada entre os temas veiculados. "Gás do Povo" liderou com 1,43 milhão de impressões, seguido por "Tornozeleira para Agressores" (1,41 milhão) e "Renovação Automática da CNH" (1,39 milhão), todos concentrando a maior parte da veiculação na janela de 21/06 a 24/06.',
  'insights-title': 'Aprendizados e próximos passos',
  'insights-sub':
    'Principais leituras da campanha institucional e recomendações para os próximos ciclos.',
  'ga4-title': 'Tráfego no site institucional',
  'ga4-sub':
    'Usuários, sessões e engajamento no site do Senado por origem de tráfego, medidos via Google Analytics 4 no período da campanha.',
  'ga4-insight':
    'O site institucional recebeu 58,9 mil usuários ativos e 65,7 mil sessões no período, com taxa de engajamento geral de 28% e tempo médio de engajamento de 21 segundos por sessão. Hands foi a maior origem em volume, trazendo 16,8 mil usuários ao site. TikTok se destacou em engajamento entre as origens de maior volume, com 64% das sessões engajadas e 18s de tempo médio, mostrando grande interesse do público em interagir com o conteúdo. Origens como Senado (site oficial), NewCom e Facebook registraram os maiores tempos médios de engajamento (4min26s, 14min13s e 1min45s, respectivamente), reforçando o interesse do público que já conhece a instituição em se aprofundar no conteúdo.',
  'offline-intro-title-1': 'Além das telas,',
  'offline-intro-title-2': 'a campanha chega às ruas.',
  'offline-intro-body':
    'Para garantir ampla cobertura nacional, a estratégia também reúne peças em rádio, TV e mídia exterior, levando o mesmo conceito da campanha institucional a públicos que a internet sozinha não alcança em todo o país.',
  'offline-kpi-title': 'Resultados consolidados',
  'offline-kpi-sub':
    'Números agregados de rádio, TV e mídia exterior no período, somando investimento e inserções por categoria.',
  'offline-kpi-insight':
    'A mídia offline somou R$ 15,9 milhões em investimento e 8 milhões de inserções, distribuídos entre 724 veículos ativos em 27 praças e estados, capilaridade que amplia o alcance geográfico da campanha para além da cobertura digital. A composição de investimento é liderada por TV Aberta (54,5%), consistente com seu papel de qualificação de alcance em rede nacional, enquanto o volume de inserções é dominado pelo MUB (mobiliário urbano), responsável por 75% do total, reflexo da natureza de alta frequência e exposição contínua desse formato ao longo do dia.',
  'offline-channel-title': 'Visão geral por categoria',
  'offline-channel-sub':
    'Investimento e inserções comparados entre rádio, TV e mídia exterior da campanha.',
  'offline-channel-insight':
    'TV Aberta concentra o maior investimento entre as categorias offline (R$ 8,7 milhões, 54,5% do total), seguida por Rádio (R$ 2 milhões, 12,5%) e DOOH Painel Digital (R$ 1,8 milhão, 11,1%). Minidoor e MUB, agora reportados como categorias distintas, somam juntos R$ 1,9 milhão (11,8%), enquanto DOOH Metrô e DOOH Aeroporto, também separados nesta apuração, respondem por R$ 445 mil (2,8%) e R$ 719 mil (4,5%) respectivamente. Entre os veículos individuais, a GLOBO lidera o investimento em TV Aberta com R$ 3,8 milhões em apenas 9 inserções, refletindo o valor de espaços em rede nacional, enquanto a JCDecaux se destaca em MUB com mais de 1 milhão de inserções, evidenciando a escala de frequência característica desse formato.',
  'offline-complementar-title': 'Mídia complementar',
  'offline-complementar-sub':
    'Investimento, inserções e impacto das ações complementares em DOOH aeroporto e painel digital.',
  'offline-complementar-insight':
    'As ações complementares somaram R$ 590 mil (3,7% do investimento offline). A maior parte veio de DOOH Aeroporto Complementar com a JCDECAUX: R$ 572,8 mil, 495.660 inserções e 229,7 milhões de impactos. DOOH Painel Digital Complementar, com a WP MIDIA, respondeu por R$ 17,4 mil, 3.149 inserções e 1,8 milhão de impactos.',
  'offline-tv-title': 'Quem viu a campanha na TV',
  'offline-tv-sub':
    'Audiência da campanha (Ibope/Instar) nas 15 principais regiões metropolitanas do Brasil, comparando TV aberta e TV por assinatura no período de 14/06 a 30/06/2026.',
  'offline-tv-open-note':
    'De cada 100 pessoas que assistem TV aberta, cerca de 36 viram a campanha do Senado pelo menos uma vez, o equivalente a 25,1 milhões de pessoas, de um público de quase 70 milhões. Quem viu, viu em média 3 vezes ao longo do período.',
  'offline-tv-closed-note':
    'Na TV por assinatura, o público é bem menor e mais segmentado: de cada 100 adultos de classe A/B com TV por assinatura, cerca de 5 viram a campanha, cerca de 483 mil pessoas, de um público de aproximadamente 10 milhões, concentrados principalmente em canais de notícia.',
  'offline-tv-insight':
    'A TV aberta entregou alcance muito superior ao da TV fechada (25,1 milhões contra 483 mil pessoas), o que já era esperado dado o tamanho de audiência de cada meio: a Globo concentrou mais da metade do investimento e da cobertura em TV aberta, enquanto na TV por assinatura a GloboNews teve papel equivalente entre os canais de notícia.',
  'impact-intro-title-1': 'Duas frentes,',
  'impact-intro-title-2': 'um só resultado.',
  'impact-intro-body':
    'Depois de detalhar cada frente separadamente, o próximo passo é olhar para o todo. A seguir, um compilado geral reúne os números de mídia online e offline em uma única visão do impacto da campanha institucional em todo o país.',
  'impact-title': 'Impacto geral da campanha',
  'impact-sub':
    'Compilado de mídia online e offline: visão consolidada do alcance total da campanha institucional.',
  'impact-insight':
    'Consolidando online e offline, a campanha atingiu R$ 19,1 milhões em investimento total, com 91,9 milhões de impressões digitais, 8 milhões de inserções em rádio e TV e um impacto estimado de mais de 1 bilhão de exposições em mídia exterior (painéis digitais, MUB, minidoor e DOOH), métrica de escala e não de alcance único, já que a mesma pessoa pode ter sido impactada em mais de um canal ao longo do período. Esse volume de exposição se traduziu em engajamento direto com a plataforma institucional: 65,7 mil sessões registradas no site, com taxa de engajamento geral de 28%, indicador de leitura efetiva do conteúdo.',
  'impact-ga4-sessions': '65.673',
  'impact-ga4-time': '21s',
  'impact-ga4-cost': 'R$ 280,05',
  'thanks-sub':
    'Obrigado por acompanhar os resultados da campanha institucional do Senado Federal. Este relatório reúne o desempenho consolidado de todas as frentes de mídia, online e offline, no período analisado.',
};

export const defaultLists = {
  'insights-learnings': [
    'A combinação de diferentes modelos de compra em redes sociais (CPM, CPV e CPC) permitiu que a campanha trabalhasse simultaneamente os três objetivos centrais de um funil de mídia, alcance, atenção e ação, dentro do mesmo orçamento, em vez de concentrar tudo numa única lógica de veiculação.',
    'A combinação de mídia offline com categorias de propósitos diferentes mostrou-se eficiente: canais de alcance amplo em rede nacional convivem bem com mídia exterior de alta frequência em centros urbanos, ampliando a cobertura para públicos que a mídia digital não alcança isoladamente.',
    'O acompanhamento do contratado versus entregue ao longo da campanha, feito por meio de um dashboard com atualização diária dos dados, se mostrou uma ferramenta útil de gestão, permitindo identificar cedo os veículos com espaço de entrega ainda disponível e redistribuir atenção conforme o ritmo real de veiculação.',
    'A diversificação de formato dentro de uma mesma rede social (vídeo e estático) ampliou a superfície de contato com públicos de preferências de consumo diferentes, reforçando a mensagem por mais de um caminho dentro do mesmo canal.',
    'A soma de mídia online e offline resultou em um volume de impactos de escala nacional, consistente com o caráter institucional da campanha, e parte relevante do público impactado buscou aprofundar a informação no site institucional além do primeiro contato com a peça publicitária.',
  ],
  'insights-next-steps': [
    'Ampliar o orçamento do próximo ciclo para reforçar os canais e formatos que já demonstraram melhor equilíbrio entre custo e resultado neste período, escalando o investimento onde a campanha comprovou maior retorno e ampliando ainda mais o alcance e a frequência de exposição do público.',
    'Estruturar testes controlados entre modelos de compra (CPM, CPV, CPC) dentro de uma mesma rede, para mensurar de forma comparativa a eficiência de cada modelo antes de decidir a alocação de orçamento do próximo ciclo.',
    'Estender a leitura de audiência de mercado também para rádio e mídia exterior, complementando o volume bruto de inserções dessas categorias com uma estimativa de alcance qualificado, no mesmo padrão já aplicado a TV aberta e TV fechada neste relatório.',
    'Acompanhar de perto o ritmo de entrega do volume contratado ao longo de toda a campanha, para garantir o melhor aproveitamento do espaço de mídia já negociado em cada veículo.',
    'Documentar os elementos criativos (roteiro, duração, gancho inicial) que mais contribuíram para engajamento e retenção neste ciclo, como referência para o briefing de criativos da próxima campanha institucional.',
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
