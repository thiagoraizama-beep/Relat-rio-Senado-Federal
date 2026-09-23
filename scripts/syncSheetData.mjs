// Busca a aba "BASE CONSOLIDADA - MÍDIA ON" da planilha publicada e gera
// src/data/sheetData.json, consumido estaticamente pelo site.
// Rode com: npm run sync-data

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRroW7evqUBsumlR2O0flylsSjqjvlIyK2lUJqe2ggw_jhFx1JdpwK_guIs_jieUw58l24radb6lZ7h/pub?gid=1387234128&single=true&output=csv';

// Aba "Contratado de cada veículo - online" — quantidade contratada por veículo/modelo.
const CONTRACTED_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRroW7evqUBsumlR2O0flylsSjqjvlIyK2lUJqe2ggw_jhFx1JdpwK_guIs_jieUw58l24radb6lZ7h/pub?gid=1699522723&single=true&output=csv';

// Aba "CONSOLIDADA - MÍDIA OFF" — rádio, TV e mídia exterior (DOOH/MINIDOOR/MUB).
// Sem série diária nem impressões: cada linha é uma inserção com custo.
const OFFLINE_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRroW7evqUBsumlR2O0flylsSjqjvlIyK2lUJqe2ggw_jhFx1JdpwK_guIs_jieUw58l24radb6lZ7h/pub?output=csv';

// Export manual do GA4 "Origem da campanha manual da sessão" — tráfego do
// site institucional por origem/veículo, no período da campanha.
const GA4_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuGav-1DJstc2rx_ZYuyAwmWXWAwn8Ql7Ag1eH7N8lBRqmz_aOLa4G40vDY40Ofqf1wJXpj3cPHTm0/pub?output=csv';

// Export do Kwai Ads (nível dia/ad group) — fonte complementar só para os
// "Counts of video played to its completion", que não vêm preenchidos na
// base consolidada de mídia on. Os quartis 25/50/75% também estão vazios
// aqui: confirma que a plataforma não disponibiliza esse dado por completo.
const KWAI_VIDEO_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNmjZtbEbQqxdnrxpWZKH1PFvmQNBGCGDHDga5pUU-i4ADtV-MdEOXqppdwljx9IkHu5R4eLNlyeM1/pub?gid=2015290889&single=true&output=csv';

// Aba "Alcance - MÍDIA ONLINE" — alcance (usuários únicos) por veículo,
// usado para calcular a frequência média (impressões ÷ alcance). Enquanto a
// apuração não termina, linhas ainda não fechadas vêm como "Pendente".
const REACH_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRroW7evqUBsumlR2O0flylsSjqjvlIyK2lUJqe2ggw_jhFx1JdpwK_guIs_jieUw58l24radb6lZ7h/pub?gid=1985209631&single=true&output=csv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'sheetData.json');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r') {
      // ignore
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

function toNumberBR(value) {
  if (!value) return 0;
  // "R$ 2.379,74" -> 2379.74 | "91.811" -> 91811 | "84,00%" -> 84
  const cleaned = value.replace(/R\$\s?/, '').replace('%', '').trim();
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? 0 : num;
}

// O export CSV do GA4 (via Sheets) grava decimais de muitas casas (ex.
// médias/taxas) truncados em grupos de 3 dígitos separados por "." como se
// fossem milhar (ex: "8.113.576.273.134.840" é o float 8,113576273134840
// com o "," trocado por "."). Só o primeiro grupo é a parte inteira; o
// resto, concatenado, é a casa decimal. Com um único "." (ex: "25.875") o
// valor já vem correto.
function toNumberGA4(value) {
  if (!value) return 0;
  const cleaned = value.trim();
  if (!cleaned) return 0;
  const parts = cleaned.split('.');
  const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? 0 : num;
}

function toDateKey(ddmmyyyy) {
  // "15/06/2026" -> sortable "2026-06-15", label "15/06"
  const [d, m, y] = ddmmyyyy.split('/');
  return { sortKey: `${y}-${m}-${d}`, label: `${d}/${m}` };
}

function orientationFromAdName(adName) {
  // "VIDEO-30S_1080X1920_..._STORIES" -> largura < altura = vertical
  const match = adName.match(/(\d{3,4})X(\d{3,4})/i);
  if (!match) return null;
  const [, w, h] = match;
  return Number(w) >= Number(h) ? 'Horizontal' : 'Vertical';
}

// Rankings por criativo (vídeo/imagem) consideram só redes sociais — portais,
// programática e áudio (UOL, Spotify, AdMax...) ficam de fora dessas duas
// páginas, mas continuam somados nos big numbers e no investimento por canal.
const SOCIAL_CHANNELS = new Set(['Instagram', 'Tik Tok', 'Facebook', 'YouTube', 'Kwai']);

const GENERIC_FORMAT_LABELS = {
  BANNER: 'Banner display',
  AUDIO: 'Áudio',
  'PUSH-NOTIFICATION': 'Push notification',
};

function genericFormatFromAdName(adName) {
  const prefix = adName.split('_')[0];
  return GENERIC_FORMAT_LABELS[prefix] || null;
}

// Corrige variações/erros de digitação na planilha de origem para que o
// mesmo criativo não seja contado como dois grupos diferentes.
const CREATIVE_NAME_FIXES = {
  'Isencao De Impsoto De Renda': 'Isencao De Imposto De Renda',
};

function normalizeCreativeName(name) {
  return CREATIVE_NAME_FIXES[name] || name;
}

async function fetchCsvRows(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar CSV: ${res.status}`);
  const text = await res.text();
  return parseCsv(text);
}

// Normaliza nomes de veículo para bater entre a base MÍDIA ON e a aba de
// contratado, que usam grafias diferentes para o mesmo canal.
const VEHICLE_NAME_MAP = {
  'globo.com': 'Globo.com',
  'Portal R7': 'R7 Portal',
  'DiÃ¡rio dos Associados': 'Diário Associados',
  'Diário dos Associados': 'Diário Associados',
};

function normalizeVehicleName(name) {
  return VEHICLE_NAME_MAP[name] || name;
}

// Nomes de veículo na aba de alcance que divergem da grafia usada no resto
// do site (mesmos veículos, rótulos diferentes na planilha de origem).
const REACH_VEHICLE_NAME_MAP = {
  R7: 'R7 Portal',
  TikTok: 'Tik Tok',
};

async function fetchReachByVehicle() {
  console.log('Buscando CSV de alcance (mídia online)...');
  const rows = await fetchCsvRows(REACH_CSV_URL);
  const header = rows[0];
  const idx = {
    veiculo: header.findIndex((h) => h.includes('Ve') && h.includes('culo')),
    quantitativo: header.indexOf('Quantitativo'),
  };
  const byVehicle = new Map(); // veiculo -> alcance (null se pendente)
  for (const r of rows.slice(1)) {
    const rawVeiculo = (r[idx.veiculo] || '').trim();
    if (!rawVeiculo) continue;
    const veiculo = REACH_VEHICLE_NAME_MAP[rawVeiculo] || normalizeVehicleName(rawVeiculo);
    const rawValue = (r[idx.quantitativo] || '').trim();
    byVehicle.set(veiculo, rawValue.toLowerCase() === 'pendente' ? null : toNumberBR(rawValue));
  }
  return byVehicle;
}

// Identifica o criativo institucional pelo "Ad Group Name" do export do Kwai
// Ads, usando os mesmos nomes de exibição já usados no resto do site.
const KWAI_AD_GROUP_PATTERNS = [
  [/RENOVACAO-AUTOMATICA-DA-CNH/i, 'Renovação Automática da CNH'],
  [/TORNOZELEIRA/i, 'Tornozeleira para Agressores'],
  [/GAS-DO-POVO/i, 'Gás do Povo'],
];

function creativeNameFromKwaiAdGroup(adGroup) {
  const match = KWAI_AD_GROUP_PATTERNS.find(([pattern]) => pattern.test(adGroup));
  return match?.[1] || null;
}

async function fetchKwaiVideoCompletions() {
  console.log('Buscando CSV de vídeo do Kwai (completions)...');
  const rows = await fetchCsvRows(KWAI_VIDEO_CSV_URL);
  const header = rows[0];
  const idx = {
    adGroup: header.indexOf('Ad Group Name'),
    completion: header.indexOf('Counts of video played to its completion'),
  };
  const byCreative = new Map();
  for (const r of rows.slice(1)) {
    const name = creativeNameFromKwaiAdGroup((r[idx.adGroup] || '').trim());
    if (!name) continue;
    byCreative.set(name, (byCreative.get(name) || 0) + toNumberBR(r[idx.completion]));
  }
  return byCreative;
}

async function main() {
  console.log('Buscando CSV da planilha...');
  const rows = await fetchCsvRows(CSV_URL);
  const header = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim() !== ''));

  const col = (name) => header.indexOf(name);
  const idx = {
    date: col('Date'),
    impressions: col('Impressions'),
    clicks: col('Clicks'),
    videoViews: col('Video views'),
    videoViews25: col('Video views 25%'),
    videoViews50: col('Video views 50%'),
    videoViews75: col('Video views 75%'),
    videoCompletions: col('Video completions'),
    engagements: col('Total engagements'),
    veiculo: header.findIndex((h) => h.includes('Ve') && h.includes('culo')),
    cost: col('Cost'),
    posicionamento: col('Posicionamento'),
    creativeName: col('Nome do Criativo'),
    adName: col('Ad Name'),
  };

  let totalInvestment = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalVideoViews = 0;
  let totalVideoCompletions = 0;
  let totalEngagements = 0;

  const byDate = new Map(); // sortKey -> { label, impressions }
  const byChannel = new Map(); // veiculo -> cost
  const byVehicleDelivery = new Map(); // veiculo -> { impressions, clicks, views }
  const byNetworkDetail = new Map(); // veiculo -> { impressions, clicks, views, completions, cost }
  const byVideoCreative = new Map(); // nome do criativo -> agregados
  const byStaticCreative = new Map(); // nome do criativo estático -> agregados
  const byNetworkCreative = new Map(); // "rede||criativo" -> agregados (p/ ranking por rede)
  const byCreativeDate = new Map(); // "rede||criativo" -> Map(sortKey -> { label, impressions, clicks, views })
  let videoRows = 0;
  let imageRows = 0;

  for (const r of dataRows) {
    const impressions = toNumberBR(r[idx.impressions]);
    const clicks = toNumberBR(r[idx.clicks]);
    const cost = toNumberBR(r[idx.cost]);
    const videoViews = toNumberBR(r[idx.videoViews]);
    const videoViews25 = toNumberBR(r[idx.videoViews25]);
    const videoViews50 = toNumberBR(r[idx.videoViews50]);
    const videoViews75 = toNumberBR(r[idx.videoViews75]);
    const videoCompletions = toNumberBR(r[idx.videoCompletions]);
    const engagements = toNumberBR(r[idx.engagements]);
    const veiculo = normalizeVehicleName((r[idx.veiculo] || 'Desconhecido').trim() || 'Desconhecido');
    const dateStr = r[idx.date];
    const isVideo = (r[idx.videoViews] || '').trim() !== '';
    const creativeName = normalizeCreativeName((r[idx.creativeName] || '').trim());
    const adName = (r[idx.adName] || '').trim();
    const posicionamento = (r[idx.posicionamento] || '').trim();

    totalInvestment += cost;
    totalImpressions += impressions;
    totalClicks += clicks;
    totalVideoViews += videoViews;
    totalVideoCompletions += videoCompletions;
    totalEngagements += engagements;

    if (dateStr) {
      const { sortKey, label } = toDateKey(dateStr);
      const prev = byDate.get(sortKey) || { label, impressions: 0, clicks: 0, views: 0, cost: 0 };
      prev.impressions += impressions;
      prev.clicks += clicks;
      prev.views += videoViews;
      prev.cost += cost;
      byDate.set(sortKey, prev);
    }

    byChannel.set(veiculo, (byChannel.get(veiculo) || 0) + cost);

    const delivery = byVehicleDelivery.get(veiculo) || { impressions: 0, clicks: 0, views: 0, cost: 0 };
    delivery.impressions += impressions;
    delivery.clicks += clicks;
    delivery.views += videoViews;
    delivery.cost += cost;
    byVehicleDelivery.set(veiculo, delivery);

    if (SOCIAL_CHANNELS.has(veiculo)) {
      const nd = byNetworkDetail.get(veiculo) || {
        impressions: 0,
        clicks: 0,
        views: 0,
        completions: 0,
        cost: 0,
        videoViews25: 0,
        videoViews50: 0,
        videoViews75: 0,
      };
      nd.impressions += impressions;
      nd.clicks += clicks;
      nd.views += videoViews;
      nd.completions += videoCompletions;
      nd.cost += cost;
      nd.videoViews25 += videoViews25;
      nd.videoViews50 += videoViews50;
      nd.videoViews75 += videoViews75;
      byNetworkDetail.set(veiculo, nd);

      const rawName = creativeName || genericFormatFromAdName(adName) || '';
      if (rawName) {
        const ncKey = `${veiculo}||${rawName}`;
        const nc = byNetworkCreative.get(ncKey) || {
          veiculo,
          name: rawName,
          impressions: 0,
          clicks: 0,
          views: 0,
          completions: 0,
          cost: 0,
          engagements: 0,
          isVideo,
          orientations: new Map(),
          placements: new Map(),
          videoViews25: 0,
          videoViews50: 0,
          videoViews75: 0,
        };
        nc.impressions += impressions;
        nc.clicks += clicks;
        nc.views += videoViews;
        nc.completions += videoCompletions;
        nc.cost += cost;
        nc.engagements += engagements;
        nc.videoViews25 += videoViews25;
        nc.videoViews50 += videoViews50;
        nc.videoViews75 += videoViews75;
        const orientation = orientationFromAdName(adName);
        if (orientation) nc.orientations.set(orientation, (nc.orientations.get(orientation) || 0) + 1);
        if (posicionamento) nc.placements.set(posicionamento, (nc.placements.get(posicionamento) || 0) + 1);
        byNetworkCreative.set(ncKey, nc);

        if (dateStr) {
          const { sortKey, label } = toDateKey(dateStr);
          const series = byCreativeDate.get(ncKey) || new Map();
          const day = series.get(sortKey) || { label, impressions: 0, clicks: 0, views: 0 };
          day.impressions += impressions;
          day.clicks += clicks;
          day.views += videoViews;
          series.set(sortKey, day);
          byCreativeDate.set(ncKey, series);
        }
      }
    }

    if (isVideo) {
      videoRows++;
      if (creativeName && SOCIAL_CHANNELS.has(veiculo)) {
        const prev = byVideoCreative.get(creativeName) || {
          impressions: 0,
          clicks: 0,
          cost: 0,
          videoViews: 0,
          videoViews25: 0,
          videoViews50: 0,
          videoViews75: 0,
          videoCompletions: 0,
          orientations: new Map(),
          placements: new Map(),
          veiculos: new Map(),
        };
        prev.impressions += impressions;
        prev.clicks += clicks;
        prev.cost += cost;
        prev.videoViews += videoViews;
        prev.videoViews25 += videoViews25;
        prev.videoViews50 += videoViews50;
        prev.videoViews75 += videoViews75;
        prev.videoCompletions += videoCompletions;
        const orientation = orientationFromAdName(adName);
        if (orientation) prev.orientations.set(orientation, (prev.orientations.get(orientation) || 0) + 1);
        if (posicionamento) prev.placements.set(posicionamento, (prev.placements.get(posicionamento) || 0) + 1);
        if (veiculo) prev.veiculos.set(veiculo, (prev.veiculos.get(veiculo) || 0) + impressions);
        byVideoCreative.set(creativeName, prev);
      }
    } else {
      imageRows++;
      if (SOCIAL_CHANNELS.has(veiculo)) {
        const staticName = creativeName || genericFormatFromAdName(adName) || 'Outros estáticos';
        const prev = byStaticCreative.get(staticName) || {
          impressions: 0,
          clicks: 0,
          cost: 0,
          orientations: new Map(),
          placements: new Map(),
          veiculos: new Map(),
        };
        prev.impressions += impressions;
        prev.clicks += clicks;
        prev.cost += cost;
        const orientation = orientationFromAdName(adName);
        if (orientation) prev.orientations.set(orientation, (prev.orientations.get(orientation) || 0) + 1);
        if (posicionamento) prev.placements.set(posicionamento, (prev.placements.get(posicionamento) || 0) + 1);
        if (veiculo) prev.veiculos.set(veiculo, (prev.veiculos.get(veiculo) || 0) + impressions);
        byStaticCreative.set(staticName, prev);
      }
    }
  }

  const dailySeries = Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, v]) => ({
      label: v.label,
      impressions: v.impressions,
      clicks: v.clicks,
      views: v.views,
      cost: Number(v.cost.toFixed(2)),
    }));

  const channelSpendRaw = Array.from(byChannel.entries()).sort((a, b) => b[1] - a[1]);
  const totalSpendForChannels = channelSpendRaw.reduce((acc, [, v]) => acc + v, 0) || 1;
  const channelSpend = channelSpendRaw.map(([label, value]) => ({
    label,
    pct: Math.round((value / totalSpendForChannels) * 100 * 10) / 10,
  }));

  const fmt = new Intl.NumberFormat('pt-BR');
  const fmtMoney = (n) =>
    `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
  const fmtPct = (n, digits = 2) => `${fmt.format(Number(n.toFixed(digits)))}%`;

  // Uma linha por veículo com as 4 métricas cruas — cada gráfico da página
  // de visão geral ordena e formata a sua própria métrica a partir disto.
  // Redes sociais (SOCIAL_CHANNELS) ficam de fora: elas já têm páginas
  // próprias (Vídeos, Imagens), então aqui sobram só portais/mídia paga.
  const vehicleOverview = Array.from(byVehicleDelivery.entries())
    .filter(
      ([veiculo]) =>
        veiculo !== 'Desconhecido' && veiculo.toLowerCase() !== 'unknown' && !SOCIAL_CHANNELS.has(veiculo)
    )
    .map(([veiculo, v]) => ({
      veiculo,
      impressions: v.impressions,
      clicks: v.clicks,
      views: v.views,
      cost: Number(v.cost.toFixed(2)),
    }));

  // Uma página própria por rede social — Meta agrega Instagram + Facebook,
  // as demais mapeiam 1:1 para o veículo bruto da planilha.
  const NETWORK_GROUPS = {
    Meta: ['Instagram', 'Facebook'],
    YouTube: ['YouTube'],
    'Tik Tok': ['Tik Tok'],
    Kwai: ['Kwai'],
  };
  const socialNetworks = Object.entries(NETWORK_GROUPS).map(([network, sources]) => {
    const agg = sources.reduce(
      (acc, src) => {
        const nd = byNetworkDetail.get(src);
        if (!nd) return acc;
        acc.impressions += nd.impressions;
        acc.clicks += nd.clicks;
        acc.views += nd.views;
        acc.completions += nd.completions;
        acc.cost += nd.cost;
        acc.videoViews25 += nd.videoViews25 || 0;
        acc.videoViews50 += nd.videoViews50 || 0;
        acc.videoViews75 += nd.videoViews75 || 0;
        return acc;
      },
      { impressions: 0, clicks: 0, views: 0, completions: 0, cost: 0, videoViews25: 0, videoViews50: 0, videoViews75: 0 }
    );
    const quartilePct = (n) => (agg.views ? Math.round((n / agg.views) * 100) : 0);
    return {
      network,
      investment: fmtMoney(agg.cost),
      impressions: fmt.format(agg.impressions),
      clicks: fmt.format(agg.clicks),
      views: fmt.format(agg.views),
      completions: fmt.format(agg.completions),
      cpm: agg.impressions ? fmtMoney((agg.cost / agg.impressions) * 1000) : 'R$ 0,00',
      cpc: agg.clicks ? fmtMoney(agg.cost / agg.clicks) : 'R$ 0,00',
      cpv: agg.views ? fmtMoney(agg.cost / agg.views) : 'R$ 0,00',
      ctr: agg.impressions ? fmtPct((agg.clicks / agg.impressions) * 100) : '0%',
      completionRate: agg.views ? fmtPct((agg.completions / agg.views) * 100, 0) : '0%',
      quartiles: {
        q25: quartilePct(agg.videoViews25),
        q50: quartilePct(agg.videoViews50),
        q75: quartilePct(agg.videoViews75),
        q100: agg.views ? Math.round((agg.completions / agg.views) * 100) : 0,
      },
    };
  });

  const reachByVehicle = await fetchReachByVehicle();

  console.log('Buscando CSV de contratado por veículo...');
  const contractedRows = await fetchCsvRows(CONTRACTED_CSV_URL);
  const contractedHeader = contractedRows[0];
  const contractedCol = (name) => contractedHeader.indexOf(name);
  const cIdx = {
    veiculo: contractedHeader.findIndex((h) => h.includes('Ve') && h.includes('culo')),
    modelo: contractedCol('Modelo de Compra'),
    quantidade: contractedCol('Quantidade contratada'),
  };

  // "Meta" no contratado cobre Instagram + Facebook na base entregue.
  const VEHICLE_DELIVERY_SOURCES = {
    Meta: ['Instagram', 'Facebook'],
  };
  const METRIC_BY_MODEL = { CPM: 'impressions', CPC: 'clicks', CPV: 'views' };
  const METRIC_LABEL = { impressions: 'Impressões', clicks: 'Cliques', views: 'Views' };

  // vehicleDelivery cobre TODOS os veículos (portais + redes sociais) — usado
  // pelas páginas individuais de rede (Meta/YouTube/TikTok/Kwai). A página
  // "Entregas por veículo" usa vehicleDeliveryPortals, que exclui as redes
  // sociais (elas já têm sua própria barra de contratado vs. realizado).
  const SOCIAL_VEHICLE_NAMES = new Set(['Meta', 'YouTube', 'Tik Tok', 'Kwai']);

  const vehicleDelivery = contractedRows
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => {
      const veiculo = normalizeVehicleName((r[cIdx.veiculo] || '').trim());
      const modelo = (r[cIdx.modelo] || '').trim().toUpperCase();
      const contracted = toNumberBR(r[cIdx.quantidade]);
      const metric = METRIC_BY_MODEL[modelo] || 'impressions';
      const sources = VEHICLE_DELIVERY_SOURCES[veiculo] || [veiculo];
      const delivered = sources.reduce((acc, src) => acc + (byVehicleDelivery.get(src)?.[metric] || 0), 0);
      const pct = contracted ? Math.round((delivered / contracted) * 100) : 0;
      const impressions = sources.reduce((acc, src) => acc + (byVehicleDelivery.get(src)?.impressions || 0), 0);
      const reach = reachByVehicle.get(veiculo);
      const frequency = reach ? Math.round((impressions / reach) * 10) / 10 : null;
      return {
        veiculo,
        modelo,
        metricLabel: METRIC_LABEL[metric],
        contracted,
        delivered,
        contractedFmt: fmt.format(contracted),
        deliveredFmt: fmt.format(delivered),
        pct,
        pctDisplay: Math.min(pct, 100),
        reach: reach ?? null,
        reachFmt: reach ? fmt.format(reach) : 'Pendente',
        frequency,
        frequencyFmt: frequency ? `${fmt.format(frequency)}x` : 'Pendente',
      };
    })
    .sort((a, b) => b.contracted - a.contracted);

  const vehicleDeliveryPortals = vehicleDelivery.filter((v) => !SOCIAL_VEHICLE_NAMES.has(v.veiculo));

  const CREATIVE_LABELS = {
    'Video 30S': 'Institucional · 30s',
    'Video 60S': 'Institucional · 60s',
    'Renovacao Automatica Da Cnh': 'Renovação Automática da CNH',
    'Tornozeleira Eletronica Para Agressores': 'Tornozeleira Eletrônica para Agressores',
    'Tornozeleira para Agressores': 'Tornozeleira para Agressores',
    'GÃ¡s do Povo': 'Gás do Povo',
    'Isencao De Imposto De Renda': 'Isenção de Imposto de Renda',
    'Vicaricidio Vira Crime Hediondo': 'Vicariocídio Vira Crime Hediondo',
    'Carrossel Coneca 5 Leis Que Ja Fazem Parte Da Sua Vida': 'Carrossel · 5 Leis que já Fazem Parte da Sua Vida',
    'Gas Do Povo': 'Gás do Povo',
  };

  const kwaiCompletions = await fetchKwaiVideoCompletions();

  const topEntry = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const videoCreatives = Array.from(byVideoCreative.entries())
    .map(([name, v]) => {
      const orientation = topEntry(v.orientations);
      const placement = topEntry(v.placements);
      const veiculo = topEntry(v.veiculos);
      const displayName = CREATIVE_LABELS[name] || name;
      // Kwai não reporta completions/quartis na base consolidada — usa o
      // completion real de um export complementar do Kwai Ads quando existe.
      const completions = veiculo === 'Kwai' ? kwaiCompletions.get(displayName) ?? v.videoCompletions : v.videoCompletions;
      return {
        name: displayName,
        format: [orientation, placement].filter(Boolean).join(' · ') || '—',
        veiculo: veiculo || '—',
        impressions: v.impressions,
        views: v.videoViews,
        completions,
        ctr: v.impressions ? fmtPct((v.clicks / v.impressions) * 100) : '0%',
        completionRatePct: v.videoViews ? Math.round((completions / v.videoViews) * 100) : 0,
        completionRate: v.videoViews ? fmtPct((completions / v.videoViews) * 100, 0) : '—',
        view75Rate: v.videoViews ? Math.round((v.videoViews75 / v.videoViews) * 100) : 0,
        reach: `${fmt.format(Number((v.impressions / 1_000_000).toFixed(2)))}M`,
        viewsFmt: fmt.format(v.videoViews),
        completionsFmt: fmt.format(completions),
        quartiles: {
          q25: v.videoViews ? Math.round((v.videoViews25 / v.videoViews) * 100) : 0,
          q50: v.videoViews ? Math.round((v.videoViews50 / v.videoViews) * 100) : 0,
          q75: v.videoViews ? Math.round((v.videoViews75 / v.videoViews) * 100) : 0,
          q100: v.videoViews ? Math.round((completions / v.videoViews) * 100) : 0,
        },
      };
    })
    .sort((a, b) => b.views - a.views);

  const maxViews = Math.max(...videoCreatives.map((c) => c.views), 1);
  videoCreatives.forEach((c) => {
    c.viewsShare = Math.round((c.views / maxViews) * 100);
  });

  const staticCreatives = Array.from(byStaticCreative.entries())
    .map(([name, v]) => {
      const orientation = topEntry(v.orientations);
      const placement = topEntry(v.placements);
      const veiculo = topEntry(v.veiculos);
      return {
        name: CREATIVE_LABELS[name] || name,
        format: [orientation, placement].filter(Boolean).join(' · ') || '—',
        veiculo: veiculo || '—',
        impressions: v.impressions,
        clicks: v.clicks,
        ctr: v.impressions ? fmtPct((v.clicks / v.impressions) * 100) : '0%',
        reach: `${fmt.format(Number((v.impressions / 1_000_000).toFixed(2)))}M`,
        impressionsFmt: fmt.format(v.impressions),
        clicksFmt: fmt.format(v.clicks),
      };
    })
    .sort((a, b) => b.impressions - a.impressions);

  const maxStaticImpressions = Math.max(...staticCreatives.map((c) => c.impressions), 1);
  staticCreatives.forEach((c) => {
    c.impressionsShare = Math.round((c.impressions / maxStaticImpressions) * 100);
  });

  // Ranking de criativos por rede — critério de "melhor" segue o modelo de
  // compra: CPM = mais impressões, CPC = maior CTR, CPV = maior retenção.
  const NETWORK_BUY_MODEL = { Meta: 'CPM', YouTube: 'CPV', 'Tik Tok': 'CPC', Kwai: 'CPM' };
  const topCreativesByNetwork = Object.entries(NETWORK_GROUPS).map(([network, sources]) => {
    const items = Array.from(byNetworkCreative.entries())
      .filter(([, c]) => sources.includes(c.veiculo))
      .reduce((acc, [ncKey, c]) => {
        const existing = acc.find((x) => x.name === c.name);
        if (existing) {
          existing.impressions += c.impressions;
          existing.clicks += c.clicks;
          existing.views += c.views;
          existing.completions += c.completions;
          existing.cost += c.cost;
          existing.engagements += c.engagements;
          existing.videoViews25 += c.videoViews25;
          existing.videoViews50 += c.videoViews50;
          existing.videoViews75 += c.videoViews75;
          existing.isVideo = existing.isVideo || c.isVideo;
          existing.sourceKeys.push(ncKey);
          c.orientations.forEach((n, k) => existing.orientations.set(k, (existing.orientations.get(k) || 0) + n));
          c.placements.forEach((n, k) => existing.placements.set(k, (existing.placements.get(k) || 0) + n));
        } else {
          acc.push({
            ...c,
            sourceKeys: [ncKey],
            orientations: new Map(c.orientations),
            placements: new Map(c.placements),
          });
        }
        return acc;
      }, [])
      .map((c) => {
        const displayNameForCompletion = CREATIVE_LABELS[c.name] || c.name;
        // Kwai não reporta completions/quartis na base consolidada — usa o
        // completion real de um export complementar do Kwai Ads quando existe.
        const completions =
          network === 'Kwai' ? kwaiCompletions.get(displayNameForCompletion) ?? c.completions : c.completions;
        const ctrPct = c.impressions ? (c.clicks / c.impressions) * 100 : 0;
        const completionPct = c.views ? (completions / c.views) * 100 : 0;
        const model = NETWORK_BUY_MODEL[network];
        const score = model === 'CPC' ? ctrPct : model === 'CPV' ? completionPct : c.impressions;
        const displayName = CREATIVE_LABELS[c.name] || c.name;
        const slug = displayName
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const orientation = topEntry(c.orientations);
        const placement = topEntry(c.placements);

        // combina a série diária de todas as fontes (ex: Instagram + Facebook -> Meta)
        const dailyMap = new Map();
        c.sourceKeys.forEach((key) => {
          const series = byCreativeDate.get(key);
          if (!series) return;
          series.forEach((day, sortKey) => {
            const prev = dailyMap.get(sortKey) || { label: day.label, impressions: 0, clicks: 0, views: 0 };
            prev.impressions += day.impressions;
            prev.clicks += day.clicks;
            prev.views += day.views;
            dailyMap.set(sortKey, prev);
          });
        });
        const dailySeries = Array.from(dailyMap.entries())
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([, v]) => v);

        const networkSlug = network
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        return {
          name: displayName,
          isVideo: c.isVideo,
          buyModel: model,
          network,
          networkSlug,
          format: [orientation, placement].filter(Boolean).join(' · ') || '—',
          orientation: orientation || 'Horizontal',
          placement: placement || '—',
          mediaUrl: null, // ex: `/creatives/${networkSlug}/${slug}.mp4` ou `.jpg` — coloque o arquivo em public/creatives/<veiculo>/
          mediaSlug: slug,
          investment: fmtMoney(c.cost),
          impressionsFmt: fmt.format(c.impressions),
          clicksFmt: fmt.format(c.clicks),
          viewsFmt: fmt.format(c.views),
          completionsFmt: fmt.format(completions),
          engagementsFmt: fmt.format(c.engagements),
          hasEngagements: c.engagements > 0,
          ctr: fmtPct(ctrPct),
          completionRate: fmtPct(completionPct, 0),
          completionRateDetailed: fmtPct(completionPct, 1),
          cost: fmtMoney(c.cost),
          score,
          scoreLabel: model === 'CPC' ? 'CTR' : model === 'CPV' ? 'Taxa de conclusão' : 'Impressões',
          scoreDisplay: model === 'CPC' ? fmtPct(ctrPct) : model === 'CPV' ? fmtPct(completionPct, 0) : fmt.format(c.impressions),
          dailySeries,
          quartiles: {
            q25: c.views ? Math.round((c.videoViews25 / c.views) * 1000) / 10 : 0,
            q50: c.views ? Math.round((c.videoViews50 / c.views) * 1000) / 10 : 0,
            q75: c.views ? Math.round((c.videoViews75 / c.views) * 1000) / 10 : 0,
            q100: c.views ? Math.round((completions / c.views) * 1000) / 10 : 0,
          },
        };
      })
      .sort((a, b) => b.score - a.score);

    return { network, buyModel: NETWORK_BUY_MODEL[network], items };
  });

  // Alcance consolidado só soma veículos com apuração fechada (sem
  // "Pendente") — evita subestimar o alcance total. A frequência usa o total
  // geral de impressões do digital (mesmo número do card "Impressões"),
  // não só o dos veículos já apurados, então fica mais alta até os
  // pendentes fecharem e o alcance capturar 100% das impressões.
  let reachKnownTotal = 0;
  let reachPending = false;
  for (const [veiculo] of byVehicleDelivery.entries()) {
    const reach = reachByVehicle.get(veiculo);
    if (reach === undefined) continue;
    if (reach === null) {
      reachPending = true;
      continue;
    }
    reachKnownTotal += reach;
  }
  const overallFrequency = reachKnownTotal ? Math.round((totalImpressions / reachKnownTotal) * 10) / 10 : null;
  const reachSummary = {
    reach: reachKnownTotal || null,
    reachFmt: reachKnownTotal ? `${fmt.format(reachKnownTotal)}${reachPending ? '+' : ''}` : 'Pendente',
    frequency: overallFrequency,
    frequencyFmt: overallFrequency ? `${fmt.format(overallFrequency)}x` : 'Pendente',
  };

  const bigNumbers = [
    { label: 'Investimento', value: fmtMoney(totalInvestment), accent: 'blue' },
    { label: 'Impressões', value: fmt.format(totalImpressions), accent: 'orange' },
    { label: 'Cliques', value: fmt.format(totalClicks), accent: 'lightblue' },
    { label: 'Video views', value: fmt.format(totalVideoViews), accent: 'green' },
    { label: 'Engajamentos', value: fmt.format(totalEngagements), accent: 'blue' },
    { label: 'Video completions', value: fmt.format(totalVideoCompletions), accent: 'orange' },
    {
      label: 'CTR médio',
      value: totalImpressions ? fmtPct((totalClicks / totalImpressions) * 100) : '0%',
      accent: 'lightblue',
    },
    {
      label: 'CPM médio',
      value: totalImpressions ? fmtMoney((totalInvestment / totalImpressions) * 1000) : 'R$ 0,00',
      accent: 'green',
    },
  ];

  console.log('Buscando CSV do GA4 (origem da sessão)...');
  const ga4Rows = await fetchCsvRows(GA4_CSV_URL);
  // As primeiras linhas são comentários de export do GA4 ("# ..."); o
  // cabeçalho real é a primeira linha que não começa com "#".
  const ga4HeaderIdx = ga4Rows.findIndex((r) => r[0] && !r[0].trim().startsWith('#'));
  const ga4Header = ga4Rows[ga4HeaderIdx];
  const gCol = (name) => ga4Header.findIndex((h) => h.trim() === name);
  const gIdx = {
    origem: gCol('Origem da campanha manual da sessão'),
    activeUsers: gCol('Usuários ativos'),
    sessions: gCol('Sessões'),
    engagedSessions: gCol('Sessões engajadas'),
    avgEngagementTime: gCol('Tempo médio de engajamento por sessão'),
    eventCount: gCol('Contagem de eventos'),
    revenue: gCol('Receita total'),
  };
  const ga4DataRows = ga4Rows.slice(ga4HeaderIdx + 1).filter((r) => r.some((c) => c.trim() !== ''));

  // Origens que são a mesma fonte de tráfego espalhada em vários domínios/rótulos
  // do GA4 — somadas para não contar o mesmo veículo várias vezes.
  const GA4_VEHICLE_GROUPS = {
    Instagram: ['ig', 'l.instagram.com', '{{site_source_name}}'],
    Facebook: ['fb', 'facebook.com', 'm.facebook.com', 'l.facebook.com', 'lm.facebook.com'],
    'Senado (site oficial)': ['link.senado.leg.br', 'www12.senado.leg.br', 'www12hml.senado.leg.br'],
    YouTube: ['youtube.com', 'imasdk.googleapis.com'],
    Spotify: ['spotify', 'open.spotify.com'],
  };
  const GA4_ORIGIN_TO_VEHICLE = new Map();
  Object.entries(GA4_VEHICLE_GROUPS).forEach(([vehicle, origins]) => {
    origins.forEach((origin) => GA4_ORIGIN_TO_VEHICLE.set(origin, vehicle));
  });

  // Origens de rótulo único cujo nome de exibição difere do valor bruto da
  // planilha (grafia interna/técnica -> nome real do veículo).
  const GA4_LABEL_FIXES = {
    r7_portal: 'Portal R7',
    hands: 'Hands',
    tiktok: 'TikTok',
    deezer: 'Deezer',
    uol: 'UOL',
    kwai: 'Kwai',
    diario_dos_associados: 'Diários Associados',
    newcom: 'NewCom',
    globocom: 'GLOBO.COM',
    admax: 'AdMax',
    google: 'Google',
  };

  // Tráfego irrelevante/técnico para o relatório — fora da agregação.
  const GA4_EXCLUDED_ORIGINS = new Set([
    'kap.sgp-adm.corp.kuaishou.com',
    'paid.outbrain.com',
    'teams.public.onecdn.static.microsoft',
    'bing',
    'statics.teams.cdn.office.net',
    'app.base44.com',
  ]);

  const byGa4Vehicle = new Map(); // veiculo -> { activeUsers, sessions, engagedSessions, engagementTimeTotal, eventCount, revenue }

  for (const r of ga4DataRows) {
    const origin = (r[gIdx.origem] || '').trim();
    if (!origin || GA4_EXCLUDED_ORIGINS.has(origin)) continue;

    const vehicle =
      origin === '(not set)'
        ? 'Sem atribuição'
        : GA4_ORIGIN_TO_VEHICLE.get(origin) || GA4_LABEL_FIXES[origin] || origin;
    const activeUsers = toNumberGA4(r[gIdx.activeUsers]);
    const sessions = toNumberGA4(r[gIdx.sessions]);
    const engagedSessions = toNumberGA4(r[gIdx.engagedSessions]);
    const avgEngagementTime = toNumberGA4(r[gIdx.avgEngagementTime]); // segundos, média da linha
    const eventCount = toNumberGA4(r[gIdx.eventCount]);
    const revenue = toNumberGA4(r[gIdx.revenue]);

    const prev = byGa4Vehicle.get(vehicle) || {
      activeUsers: 0,
      sessions: 0,
      engagedSessions: 0,
      engagementTimeTotal: 0, // soma ponderada (segundos * sessões) p/ recalcular a média no agregado
      eventCount: 0,
      revenue: 0,
    };
    prev.activeUsers += activeUsers;
    prev.sessions += sessions;
    prev.engagedSessions += engagedSessions;
    prev.engagementTimeTotal += avgEngagementTime * sessions;
    prev.eventCount += eventCount;
    prev.revenue += revenue;
    byGa4Vehicle.set(vehicle, prev);
  }

  const fmtDuration = (totalSeconds) => {
    const s = Math.round(totalSeconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
  };

  const ga4Vehicles = Array.from(byGa4Vehicle.entries())
    .map(([veiculo, v]) => ({
      veiculo,
      activeUsers: v.activeUsers,
      activeUsersFmt: fmt.format(v.activeUsers),
      sessions: v.sessions,
      sessionsFmt: fmt.format(v.sessions),
      engagedSessions: v.engagedSessions,
      engagedSessionsFmt: fmt.format(v.engagedSessions),
      avgEngagementTimeSec: v.sessions ? Math.round(v.engagementTimeTotal / v.sessions) : 0,
      avgEngagementTimeFmt: v.sessions ? fmtDuration(v.engagementTimeTotal / v.sessions) : '0s',
      engagementRate: v.sessions ? fmtPct((v.engagedSessions / v.sessions) * 100, 0) : '0%',
      eventCount: v.eventCount,
      eventCountFmt: fmt.format(v.eventCount),
      revenue: v.revenue,
      revenueFmt: fmtMoney(v.revenue),
    }))
    .sort((a, b) => b.activeUsers - a.activeUsers);

  const ga4Totals = ga4Vehicles.reduce(
    (acc, v) => {
      acc.activeUsers += v.activeUsers;
      acc.sessions += v.sessions;
      acc.engagedSessions += v.engagedSessions;
      acc.eventCount += v.eventCount;
      acc.engagementTimeTotal += v.avgEngagementTimeSec * v.sessions;
      return acc;
    },
    { activeUsers: 0, sessions: 0, engagedSessions: 0, eventCount: 0, engagementTimeTotal: 0 }
  );

  const ga4BigNumbers = [
    { label: 'Usuários ativos', value: fmt.format(ga4Totals.activeUsers), accent: 'blue' },
    { label: 'Sessões', value: fmt.format(ga4Totals.sessions), accent: 'orange' },
    {
      label: 'Taxa de engajamento',
      value: ga4Totals.sessions ? fmtPct((ga4Totals.engagedSessions / ga4Totals.sessions) * 100, 0) : '0%',
      accent: 'lightblue',
    },
    {
      label: 'Tempo médio de engajamento',
      value: ga4Totals.sessions ? fmtDuration(ga4Totals.engagementTimeTotal / ga4Totals.sessions) : '0s',
      accent: 'green',
    },
    { label: 'Eventos', value: fmt.format(ga4Totals.eventCount), accent: 'blue' },
  ];

  const maxGa4Users = Math.max(...ga4Vehicles.map((v) => v.activeUsers), 1);
  ga4Vehicles.forEach((v) => {
    v.activeUsersShare = Math.round((v.activeUsers / maxGa4Users) * 100);
  });

  const ga4Report = { bigNumbers: ga4BigNumbers, vehicles: ga4Vehicles };

  console.log('Buscando CSV de mídia offline...');
  const offlineRows = await fetchCsvRows(OFFLINE_CSV_URL);
  const offlineHeader = offlineRows[0];
  const oCol = (name) => offlineHeader.indexOf(name);
  const oIdx = {
    veiculo: oCol('Veiculo'),
    praca: offlineHeader.findIndex((h) => h.includes('Pra') && h.includes('a')),
    programa: oCol('Programa'),
    insercoes: offlineHeader.findIndex((h) => h.includes('Inser')),
    custo: oCol('Custo'),
    categoria: oCol('Categoria'),
    estado: oCol('Estado'),
  };
  const offlineDataRows = offlineRows.slice(1).filter((r) => r.some((c) => c.trim() !== ''));

  // Categorias cruas da planilha agrupadas nos 6 grupos usados na página offline.
  const OFFLINE_CATEGORY_GROUPS = {
    'Rádio': 'Rádio',
    'Televisão Aberta': 'TV Aberta',
    'Televisão fechada': 'TV Fechada',
    'DOOH Painel Digital': 'DOOH Painel Digital',
    MINIDOOR: 'Minidoor',
    MUB: 'MUB',
    'DOOH Metro': 'DOOH Metrô + Aeroporto',
    'DOOH Aeroporto': 'DOOH Metrô + Aeroporto',
  };

  let offlineTotalInvestment = 0;
  let offlineTotalInsercoes = 0;
  const offlineVehicles = new Set();
  const offlinePracas = new Set();
  const byOfflineCategory = new Map(); // grupo -> { investment, insercoes }
  const byOfflineVehicle = new Map(); // veiculo -> { investment, insercoes, categoria }

  for (const r of offlineDataRows) {
    const veiculo = (r[oIdx.veiculo] || '').trim();
    const praca = (r[oIdx.praca] || '').trim();
    const insercoes = toNumberBR(r[oIdx.insercoes]);
    const custo = toNumberBR(r[oIdx.custo]);
    const categoriaRaw = (r[oIdx.categoria] || '').trim();
    const categoria = OFFLINE_CATEGORY_GROUPS[categoriaRaw] || categoriaRaw || 'Outros';

    offlineTotalInvestment += custo;
    offlineTotalInsercoes += insercoes;
    if (veiculo) offlineVehicles.add(veiculo);
    if (praca && praca !== 'Nacional') offlinePracas.add(praca);

    const cat = byOfflineCategory.get(categoria) || { investment: 0, insercoes: 0 };
    cat.investment += custo;
    cat.insercoes += insercoes;
    byOfflineCategory.set(categoria, cat);

    const veh = byOfflineVehicle.get(veiculo) || { investment: 0, insercoes: 0, categoria };
    veh.investment += custo;
    veh.insercoes += insercoes;
    byOfflineVehicle.set(veiculo, veh);
  }

  const offlineBigNumbers = [
    { label: 'Investimento offline', value: fmtMoney(offlineTotalInvestment), accent: 'blue' },
    { label: 'Inserções', value: fmt.format(offlineTotalInsercoes), accent: 'orange' },
    { label: 'Veículos', value: fmt.format(offlineVehicles.size), accent: 'lightblue' },
    { label: 'Praças/estados', value: fmt.format(offlinePracas.size), accent: 'green' },
  ];

  // Impacto (Cobertura/Fluxo) vem de abas próprias da planilha de mídia
  // exterior (uma aba por categoria: MUB, DOOH-METRO, DOOH-AEROPORTO,
  // DOOH-PAINEL DIGITAL, MINIDOOR SOCIAL). DOOH-METRO e DOOH-AEROPORTO
  // somam na categoria combinada "DOOH Metrô + Aeroporto". Rádio e TV
  // (Aberta/Fechada) ainda não têm essa métrica — ficam sem campo `impact`
  // e a página esconde essas barras na aba "Impacto".
  const OFFLINE_IMPACT_BY_CATEGORY = {
    MUB: 187_572_568,
    'DOOH Metrô + Aeroporto': 103_001_275 + 34_613_604,
    'DOOH Painel Digital': 397_445_206,
    Minidoor: 118_863_120,
  };

  const offlineChannelBreakdown = Array.from(byOfflineCategory.entries())
    .map(([categoria, v]) => {
      const impact = OFFLINE_IMPACT_BY_CATEGORY[categoria];
      return {
        categoria,
        investment: Number(v.investment.toFixed(2)),
        investmentFmt: fmtMoney(v.investment),
        insercoes: v.insercoes,
        insercoesFmt: fmt.format(v.insercoes),
        investmentPct: offlineTotalInvestment ? Math.round((v.investment / offlineTotalInvestment) * 1000) / 10 : 0,
        insercoesPct: offlineTotalInsercoes ? Math.round((v.insercoes / offlineTotalInsercoes) * 1000) / 10 : 0,
        ...(impact != null ? { impact, impactFmt: fmt.format(impact) } : {}),
      };
    })
    .sort((a, b) => b.investment - a.investment);

  // Impacto (Cobertura/Fluxo) por veículo, somado a partir dos totais "TOTAL
  // <veículo>" de cada aba da planilha de mídia exterior (MUB, DOOH-METRO,
  // DOOH-AEROPORTO, DOOH-PAINEL DIGITAL, MINIDOOR SOCIAL). Um mesmo veículo
  // (ex: JCDecaux em MUB e Metrô) soma o impacto das duas abas, do mesmo
  // jeito que investimento/inserções já são somados por veículo global.
  const OFFLINE_IMPACT_BY_VEHICLE = {
    JCDecaux: 112_473_240 + 33_029_143 + (8_853_124 + 9_074_870) + 4_200_000,
    ELETROMIDIA: 17_415_737,
    'All Space': 24_241_612,
    MOBTV: 78_000_000,
    'Eletromídia': 2_873_281,
    NEOOH: 34_613_604,
    'WE SUPER OOH': 187_235_526,
    'Bureau de Mídia': 154_951_680,
    'WP MIDIA': 11_694_000,
    Alumi: 33_912_000,
    'LED ME': 5_700_000,
    'Hocxx Smart Mídia': 3_952_000,
    'COMUNIDADE DOOR': 42_109_590,
    'WP MÍDIA': 44_134_200,
    'REDE OPS': 32_619_330,
  };

  const offlineTotalImpact = Object.values(OFFLINE_IMPACT_BY_VEHICLE).reduce((acc, n) => acc + n, 0);

  const allOfflineVehicles = Array.from(byOfflineVehicle.entries())
    .map(([veiculo, v]) => {
      const impact = OFFLINE_IMPACT_BY_VEHICLE[veiculo];
      return {
        veiculo,
        categoria: v.categoria,
        investment: Number(v.investment.toFixed(2)),
        investmentFmt: fmtMoney(v.investment),
        investmentPct: offlineTotalInvestment ? Math.round((v.investment / offlineTotalInvestment) * 1000) / 10 : 0,
        insercoes: v.insercoes,
        insercoesFmt: fmt.format(v.insercoes),
        insercoesPct: offlineTotalInsercoes ? Math.round((v.insercoes / offlineTotalInsercoes) * 1000) / 10 : 0,
        ...(impact != null
          ? {
              impact,
              impactFmt: fmt.format(impact),
              impactPct: offlineTotalImpact ? Math.round((impact / offlineTotalImpact) * 1000) / 10 : 0,
            }
          : {}),
      };
    })
    .sort((a, b) => b.investment - a.investment);

  const withShare = (list, key = 'investment', shareKey = 'investmentShare') => {
    const max = Math.max(...list.map((v) => v[key] ?? 0), 1);
    return list.map((v) => ({ ...v, [shareKey]: Math.round(((v[key] ?? 0) / max) * 100) }));
  };

  const offlineTopVehicles = withShare(allOfflineVehicles.slice(0, 10));

  // Ranking (top 10) de veículos separado por categoria, para o seletor da
  // página de canais offline — cada categoria tem sua própria escala de barra.
  const offlineVehiclesByCategory = Array.from(byOfflineCategory.keys())
    .sort((a, b) => (byOfflineCategory.get(b).investment || 0) - (byOfflineCategory.get(a).investment || 0))
    .map((categoria) => ({
      categoria,
      vehicles: withShare(allOfflineVehicles.filter((v) => v.categoria === categoria).slice(0, 10)),
    }));

  // Impacto geral — compila mídia online (impressões/cliques/investimento) e
  // offline (inserções/investimento) num único conjunto de números, para a
  // página de fechamento "Impacto geral da campanha".
  // "% da população impactada" e "Frequência média" removidos por enquanto —
  // aguardando dados reais de alcance/frequência para substituir a estimativa
  // baseada em impressões + inserções ÷ população (BRAZIL_POPULATION).
  const impactTotalInvestment = totalInvestment + offlineTotalInvestment;

  const overallImpact = {
    reach: reachSummary,
    bigNumbers: [
      { label: 'Investimento total (on + off)', value: fmtMoney(impactTotalInvestment), accent: 'blue' },
      { label: 'Impacto (mídia exterior)', value: fmt.format(offlineTotalImpact), accent: 'green' },
      { label: 'Impressões online', value: fmt.format(totalImpressions), accent: 'orange' },
      { label: 'Inserções offline', value: fmt.format(offlineTotalInsercoes), accent: 'lightblue' },
      { label: 'Cliques totais', value: fmt.format(totalClicks), accent: 'green' },
      { label: 'Video views', value: fmt.format(totalVideoViews), accent: 'blue' },
      {
        label: 'CTR médio (online)',
        value: totalImpressions ? fmtPct((totalClicks / totalImpressions) * 100) : '0%',
        accent: 'orange',
      },
    ],
  };

  const output = {
    generatedAt: new Date().toISOString(),
    rowCount: dataRows.length,
    bigNumbers,
    reachSummary,
    dailySeries,
    channelSpend,
    videoCreatives,
    staticCreatives,
    vehicleDelivery,
    vehicleDeliveryPortals,
    vehicleOverview,
    socialNetworks,
    topCreativesByNetwork,
    ga4Report,
    offlineBigNumbers,
    offlineChannelBreakdown,
    offlineTopVehicles,
    offlineVehiclesByCategory,
    overallImpact,
  };

  await writeFile(OUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`OK: ${dataRows.length} linhas processadas -> ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
