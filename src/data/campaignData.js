// Dados reais vêm de src/data/sheetData.json, gerado por `npm run sync-data`
// a partir da aba "BASE CONSOLIDADA - MÍDIA ON" da planilha do Sheets.
// Rode o comando de novo sempre que quiser atualizar os números.
import sheetData from './sheetData.json';

export const campaignMeta = {
  period: 'Período 15/06 a 03/07/2026',
  formatsCount: 22,
  channels: 'Meta, YouTube, Programática',
};

// Conceito criativo da campanha — assinado pela Calix.
export const campaignConcept = {
  index: '01',
  kicker: 'Conceito da campanha · Calix',
  titleLines: ['O Senado aprovou,', 'sua vida avançou.'],
  body:
    'Pesquisas de opinião mostram que boa parte da população ainda conhece pouco sobre a atuação do Senado Federal e sobre os benefícios concretos gerados pelo seu trabalho. Para reduzir essa distância entre a instituição e a sociedade, a campanha apresenta exemplos de leis recentemente aprovadas que já produzem impactos positivos na vida de milhões de brasileiros, conectando a atividade legislativa aos avanços percebidos no dia a dia. Com abrangência nacional, a estratégia combina TV, rádio, mídia exterior, internet, redes sociais e plataformas digitais em uma comunicação integrada.',
};

// Big numbers estilo "cards de painel" — cada um com uma cor de identificação lateral.
export const bigNumbers = sheetData.bigNumbers;

// Série diária com 4 métricas (impressões, cliques, views, custo).
export const dailySeries = sheetData.dailySeries;

// Impressões, cliques, views e investimento por veículo — base dos 4 gráficos
// da página "Visão geral por veículo".
export const vehicleOverview = sheetData.vehicleOverview;

// Métricas reais por vídeo institucional (impressões, views, completions).
export const videoCreatives = sheetData.videoCreatives;

// Métricas reais por criativo estático (banner, áudio, push, imagens temáticas).
export const staticCreatives = sheetData.staticCreatives;

// Contratado vs. realizado por TODOS os veículos (usado pelas páginas de
// cada rede social — Meta/YouTube/TikTok/Kwai). Para a página "Entregas por
// veículo" (só portais/mídia paga), use vehicleDeliveryPortals.
export const vehicleDelivery = sheetData.vehicleDelivery;
export const vehicleDeliveryPortals = sheetData.vehicleDeliveryPortals;

// Métricas reais por rede social — Meta agrega Instagram + Facebook.
export const socialNetworks = sheetData.socialNetworks;

// Ranking de criativos por rede (melhores/pior), critério conforme modelo de
// compra da rede. Coloque os arquivos em public/creatives/<networkSlug>/<mediaSlug>.mp4|.jpg
// (uma pasta por veículo: meta, youtube, tik-tok, kwai) e o mediaUrl é
// resolvido automaticamente por getCreativeMediaUrl().
//
// Vídeos institucionais dos criativos são hospedados como "não listados" no
// YouTube em vez de ficar em public/creatives/ (evita repositório pesado). O
// mapa abaixo (chave "networkSlug/mediaSlug") sobrepõe o ID do vídeo no
// YouTube a esses itens específicos; sobrevive a um novo `npm run sync-data`
// porque fica fora do sheetData.json gerado.
const YOUTUBE_EMBED_OVERRIDES = {
  'kwai/renovacao-automatica-da-cnh': 'fztR_WPec0E',
  'kwai/tornozeleira-para-agressores': 'fKxnPzWOQ5M',
  'kwai/gas-do-povo': 'dVQ4Jv7OHt0',
  'meta/institucional-60s': 'mLHR_BU5Zho',
  'meta/institucional-30s': '_3KLVGzLkWc',
  'tik-tok/tornozeleira-eletronica-para-agressores': 'fKxnPzWOQ5M',
  'youtube/institucional-30s': 'NPk5SgLmi80',
};

export const topCreativesByNetwork = sheetData.topCreativesByNetwork.map((group) => ({
  ...group,
  items: group.items.map((item) => {
    const key = `${item.networkSlug}/${item.mediaSlug}`;
    const youtubeEmbedId = YOUTUBE_EMBED_OVERRIDES[key] || null;
    return youtubeEmbedId ? { ...item, youtubeEmbedId } : item;
  }),
}));

export function getCreativeMediaUrl(item) {
  if (item.mediaUrl) return item.mediaUrl;
  const ext = item.isVideo ? 'mp4' : 'jpg';
  const folder = item.networkSlug ? `${item.networkSlug}/` : '';
  return `/creatives/${folder}${item.mediaSlug}.${ext}`;
}

// Mídia offline — rádio, TV e mídia exterior (DOOH/Minidoor/MUB). Vem da aba
// "CONSOLIDADA - MÍDIA OFF": sem série diária nem impressões, só inserções e
// investimento por veículo/praça.
export const offlineBigNumbers = sheetData.offlineBigNumbers;
export const offlineChannelBreakdown = sheetData.offlineChannelBreakdown;
export const offlineTopVehicles = sheetData.offlineTopVehicles;
export const offlineVehiclesByCategory = sheetData.offlineVehiclesByCategory;

// Impacto geral — compila online + offline num único conjunto de números
// para a página de fechamento (Sessões/Tempo médio/Custo por sessão vêm do
// GA4 e são preenchidos manualmente via edição, não têm origem na planilha).
export const overallImpact = sheetData.overallImpact;
