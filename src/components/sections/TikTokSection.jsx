import SocialNetworkSection from './SocialNetworkSection.jsx';
import { socialNetworks, vehicleDelivery } from '../../data/campaignData.js';

export default function TikTokSection() {
  const data = socialNetworks.find((n) => n.network === 'Tik Tok');
  const delivery = vehicleDelivery.find((v) => v.veiculo === 'Tik Tok');
  if (!data) return null;

  return (
    <SocialNetworkSection
      id="slide-tiktok"
      editPrefix="tiktok"
      eyebrow="Rede social"
      networkName="TikTok"
      logoSrc="/tik-tok.png"
      logoClassName="social-logo-tiktok"
      data={data}
      delivery={delivery}
      primaryMetric={{ label: 'Cliques totais', value: data.clicks }}
    />
  );
}
