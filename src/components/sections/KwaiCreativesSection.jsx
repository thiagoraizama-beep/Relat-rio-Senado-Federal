import CreativeSpotlightSection from './CreativeSpotlightSection.jsx';
import { topCreativesByNetwork } from '../../data/campaignData.js';

export default function KwaiCreativesSection() {
  const data = topCreativesByNetwork.find((n) => n.network === 'Kwai');
  return (
    <CreativeSpotlightSection
      id="slide-kwai-creatives"
      editPrefix="kwai-creatives"
      networkName="Kwai"
      items={data?.items}
    />
  );
}
