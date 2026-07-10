import SocialNetworkSection from './SocialNetworkSection.jsx';
import { socialNetworks, vehicleDelivery } from '../../data/campaignData.js';

export default function KwaiSection() {
  const data = socialNetworks.find((n) => n.network === 'Kwai');
  const delivery = vehicleDelivery.find((v) => v.veiculo === 'Kwai');
  if (!data) return null;

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
      primaryMetric={{ label: 'Impressões totais', value: data.impressions }}
    />
  );
}
