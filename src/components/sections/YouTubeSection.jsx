import SocialNetworkSection from './SocialNetworkSection.jsx';
import { socialNetworks, vehicleDelivery } from '../../data/campaignData.js';

export default function YouTubeSection() {
  const data = socialNetworks.find((n) => n.network === 'YouTube');
  const delivery = vehicleDelivery.find((v) => v.veiculo === 'YouTube');
  if (!data) return null;

  return (
    <SocialNetworkSection
      id="slide-youtube"
      editPrefix="youtube"
      eyebrow="Rede social"
      networkName="YouTube"
      logoSrc="/youtube.png"
      data={data}
      delivery={delivery}
      primaryMetric={{ label: 'Visualizações totais', value: data.views }}
    />
  );
}
