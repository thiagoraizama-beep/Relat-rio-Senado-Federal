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
  'DiÃ¡rio dos Associados': 'Diário dos Associados',
};

function normalizeVehicleName(name) {
  return VEHICLE_NAME_MAP[name] || name;
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
      const nd = byNetworkDetail.get(veiculo) || { impressions: 0, clicks: 0, views: 0, completions: 0, cost: 0 };
      nd.impressions += impressions;
      nd.clicks += clicks;
      nd.views += videoViews;
      nd.completions += videoCompletions;
      nd.cost += cost;
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
        };
        nc.impressions += impressions;
        nc.clicks += clicks;
        nc.views += videoViews;
        nc.completions += videoCompletions;
        nc.cost += cost;
        nc.engagements += engagements;
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
        return acc;
      },
      { impressions: 0, clicks: 0, views: 0, completions: 0, cost: 0 }
    );
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
    };
  });

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
      const veiculo = (r[cIdx.veiculo] || '').trim();
      const modelo = (r[cIdx.modelo] || '').trim().toUpperCase();
      const contracted = toNumberBR(r[cIdx.quantidade]);
      const metric = METRIC_BY_MODEL[modelo] || 'impressions';
      const sources = VEHICLE_DELIVERY_SOURCES[veiculo] || [veiculo];
      const delivered = sources.reduce((acc, src) => acc + (byVehicleDelivery.get(src)?.[metric] || 0), 0);
      const pct = contracted ? Math.round((delivered / contracted) * 100) : 0;
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

  const topEntry = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const videoCreatives = Array.from(byVideoCreative.entries())
    .map(([name, v]) => {
      const orientation = topEntry(v.orientations);
      const placement = topEntry(v.placements);
      const veiculo = topEntry(v.veiculos);
      return {
        name: CREATIVE_LABELS[name] || name,
        format: [orientation, placement].filter(Boolean).join(' · ') || '—',
        veiculo: veiculo || '—',
        impressions: v.impressions,
        views: v.videoViews,
        completions: v.videoCompletions,
        ctr: v.impressions ? fmtPct((v.clicks / v.impressions) * 100) : '0%',
        completionRatePct: v.videoViews ? Math.round((v.videoCompletions / v.videoViews) * 100) : 0,
        completionRate: v.videoViews ? fmtPct((v.videoCompletions / v.videoViews) * 100, 0) : '—',
        view75Rate: v.videoViews ? Math.round((v.videoViews75 / v.videoViews) * 100) : 0,
        reach: `${fmt.format(Number((v.impressions / 1_000_000).toFixed(2)))}M`,
        viewsFmt: fmt.format(v.videoViews),
        completionsFmt: fmt.format(v.videoCompletions),
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
        const ctrPct = c.impressions ? (c.clicks / c.impressions) * 100 : 0;
        const completionPct = c.views ? (c.completions / c.views) * 100 : 0;
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
          engagementsFmt: fmt.format(c.engagements),
          hasEngagements: c.engagements > 0,
          ctr: fmtPct(ctrPct),
          completionRate: fmtPct(completionPct, 0),
          cost: fmtMoney(c.cost),
          score,
          scoreLabel: model === 'CPC' ? 'CTR' : model === 'CPV' ? 'Taxa de conclusão' : 'Impressões',
          scoreDisplay: model === 'CPC' ? fmtPct(ctrPct) : model === 'CPV' ? fmtPct(completionPct, 0) : fmt.format(c.impressions),
          dailySeries,
        };
      })
      .sort((a, b) => b.score - a.score);

    return { network, buyModel: NETWORK_BUY_MODEL[network], items };
  });

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
    MINIDOOR: 'Minidoor + MUB',
    MUB: 'Minidoor + MUB',
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
    if (praca) offlinePracas.add(praca);

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

  const offlineChannelBreakdown = Array.from(byOfflineCategory.entries())
    .map(([categoria, v]) => ({
      categoria,
      investment: Number(v.investment.toFixed(2)),
      investmentFmt: fmtMoney(v.investment),
      insercoes: v.insercoes,
      insercoesFmt: fmt.format(v.insercoes),
      investmentPct: offlineTotalInvestment ? Math.round((v.investment / offlineTotalInvestment) * 1000) / 10 : 0,
      insercoesPct: offlineTotalInsercoes ? Math.round((v.insercoes / offlineTotalInsercoes) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.investment - a.investment);

  const allOfflineVehicles = Array.from(byOfflineVehicle.entries())
    .map(([veiculo, v]) => ({
      veiculo,
      categoria: v.categoria,
      investment: Number(v.investment.toFixed(2)),
      investmentFmt: fmtMoney(v.investment),
      insercoes: v.insercoes,
      insercoesFmt: fmt.format(v.insercoes),
    }))
    .sort((a, b) => b.investment - a.investment);

  const withShare = (list) => {
    const max = Math.max(...list.map((v) => v.investment), 1);
    return list.map((v) => ({ ...v, investmentShare: Math.round((v.investment / max) * 100) }));
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
  const BRAZIL_POPULATION = 213_000_000;
  const impactTotalInvestment = totalInvestment + offlineTotalInvestment;
  const impactTotalImpacts = totalImpressions + offlineTotalInsercoes; // impressões (on) + inserções (off)
  const impactPopulationPct = (impactTotalImpacts / BRAZIL_POPULATION) * 100;
  // Frequência média = impactos totais ÷ população brasileira, ou seja,
  // quantas vezes cada brasileiro teria sido impactado em média SE o
  // alcance fosse a população inteira do país. É a mesma base de cálculo do
  // "% da população impactada" (não é um alcance real/único medido).
  const impactAvgFrequency = impactTotalImpacts / BRAZIL_POPULATION;

  const overallImpact = {
    bigNumbers: [
      { label: 'Investimento total (on + off)', value: fmtMoney(impactTotalInvestment), accent: 'blue' },
      { label: 'Impressões online', value: fmt.format(totalImpressions), accent: 'orange' },
      { label: 'Inserções offline', value: fmt.format(offlineTotalInsercoes), accent: 'lightblue' },
      { label: 'Cliques totais', value: fmt.format(totalClicks), accent: 'green' },
      { label: 'Video views', value: fmt.format(totalVideoViews), accent: 'blue' },
      {
        label: 'CTR médio (online)',
        value: totalImpressions ? fmtPct((totalClicks / totalImpressions) * 100) : '0%',
        accent: 'orange',
      },
      {
        label: 'Frequência média (base: população BR)',
        value: `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(impactAvgFrequency)}x`,
        accent: 'lightblue',
      },
    ],
    populationPct: fmtPct(impactPopulationPct, 1),
    populationNote: `${fmt.format(impactTotalImpacts)} impactos (impressões online + inserções offline) ÷ ${fmt.format(BRAZIL_POPULATION)} habitantes (estimativa IBGE)`,
    frequencyNote: `${fmt.format(impactTotalImpacts)} impactos ÷ ${fmt.format(BRAZIL_POPULATION)} habitantes (população brasileira, estimativa IBGE) — não é um alcance único medido, é a mesma base de cálculo do "% da população impactada"`,
  };

  const output = {
    generatedAt: new Date().toISOString(),
    rowCount: dataRows.length,
    bigNumbers,
    dailySeries,
    channelSpend,
    videoCreatives,
    staticCreatives,
    vehicleDelivery,
    vehicleDeliveryPortals,
    vehicleOverview,
    socialNetworks,
    topCreativesByNetwork,
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
