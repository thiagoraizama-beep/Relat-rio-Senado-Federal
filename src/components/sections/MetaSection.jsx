import SocialNetworkSection from './SocialNetworkSection.jsx';
import { socialNetworks, vehicleDelivery } from '../../data/campaignData.js';

export default function MetaSection() {
  const data = socialNetworks.find((n) => n.network === 'Meta');
  const delivery = vehicleDelivery.find((v) => v.veiculo === 'Meta');
  if (!data) return null;

  return (
    <SocialNetworkSection
      id="slide-meta"
      editPrefix="meta"
      eyebrow="Rede social"
      networkName="Meta Ads"
      logoSrc="/meta.png"
      data={data}
      delivery={delivery}
      primaryMetric={{ label: 'Impressões totais', value: data.impressions }}
    />
  );
}
