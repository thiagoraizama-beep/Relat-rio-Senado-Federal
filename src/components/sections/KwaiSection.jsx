import SocialNetworkSection from './SocialNetworkSection.jsx';
import { socialNetworks, vehicleDelivery } from '../../data/campaignData.js';

// Contratado original acordado para o Kwai (31,2 milhões de impressões).
// A aba "Contratado" da planilha reflete um valor renegociado menor
// (4.227.507), então o comparativo aqui é fixo, calculado sobre o
// entregue real (mesma fonte de vehicleDelivery).
const KWAI_ORIGINAL_CONTRACTED = 31_200_000;

export default function KwaiSection() {
  const data = socialNetworks.find((n) => n.network === 'Kwai');
  const baseDelivery = vehicleDelivery.find((v) => v.veiculo === 'Kwai');
  if (!data) return null;

  const delivery = baseDelivery && {
    ...baseDelivery,
    contracted: KWAI_ORIGINAL_CONTRACTED,
    contractedFmt: new Intl.NumberFormat('pt-BR').format(KWAI_ORIGINAL_CONTRACTED),
    pct: Math.round((baseDelivery.delivered / KWAI_ORIGINAL_CONTRACTED) * 100),
    pctDisplay: Math.min(Math.round((baseDelivery.delivered / KWAI_ORIGINAL_CONTRACTED) * 100), 100),
  };

  return (
    <SocialNetworkSection
      id="slide-kwai"
      editPrefix="kwai"
      eyebrow="Rede social"
      networkName="Kwai"
      logoSrc="/kwai.png"
      logoClassName="social-logo-kwai"
      data={data}
      delivery={delivery}
      deliveryNote="Parte da verba prevista para o Kwai foi remanejada para outros meios de comunicação após a solicitação, o que explica o underdelivery frente ao contratado original."
      primaryMetric={{ label: 'Impressões totais', value: data.impressions }}
      hideCpc
    />
  );
}
