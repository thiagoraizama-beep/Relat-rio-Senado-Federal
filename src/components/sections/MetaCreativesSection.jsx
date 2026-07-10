import CreativeSpotlightSection from './CreativeSpotlightSection.jsx';
import { topCreativesByNetwork } from '../../data/campaignData.js';

export default function MetaCreativesSection() {
  const data = topCreativesByNetwork.find((n) => n.network === 'Meta');
  return (
    <CreativeSpotlightSection
      id="slide-meta-creatives"
      editPrefix="meta-creatives"
      networkName="Meta"
      items={data?.items}
    />
  );
}
