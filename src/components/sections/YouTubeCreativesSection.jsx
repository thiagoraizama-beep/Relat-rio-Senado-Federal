import CreativeSpotlightSection from './CreativeSpotlightSection.jsx';
import { topCreativesByNetwork } from '../../data/campaignData.js';

export default function YouTubeCreativesSection() {
  const data = topCreativesByNetwork.find((n) => n.network === 'YouTube');
  return (
    <CreativeSpotlightSection
      id="slide-youtube-creatives"
      editPrefix="youtube-creatives"
      networkName="YouTube"
      items={data?.items}
    />
  );
}
