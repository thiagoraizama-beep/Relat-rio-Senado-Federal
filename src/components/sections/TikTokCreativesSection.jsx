import CreativeSpotlightSection from './CreativeSpotlightSection.jsx';
import { topCreativesByNetwork } from '../../data/campaignData.js';

export default function TikTokCreativesSection() {
  const data = topCreativesByNetwork.find((n) => n.network === 'Tik Tok');
  return (
    <CreativeSpotlightSection
      id="slide-tiktok-creatives"
      editPrefix="tiktok-creatives"
      networkName="TikTok"
      items={data?.items}
    />
  );
}
