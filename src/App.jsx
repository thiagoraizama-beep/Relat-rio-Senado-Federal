import { useEffect } from 'react';
import { EditableProvider, useEditable } from './hooks/useEditableContent.jsx';
import { useSectionSpy } from './hooks/useSectionSpy.js';
import { usePagedScroll } from './hooks/usePagedScroll.js';
import { useEditShortcut } from './hooks/useEditShortcut.js';
import NavDots from './components/NavDots.jsx';
import EditPanel from './components/EditPanel.jsx';
import SelectionToolbar from './components/SelectionToolbar.jsx';
import Hero from './components/sections/Hero.jsx';
import ConceptSection from './components/sections/ConceptSection.jsx';
import SummarySection from './components/sections/SummarySection.jsx';
import GlossarySection from './components/sections/GlossarySection.jsx';
import KpiSection from './components/sections/KpiSection.jsx';
import ChannelSection from './components/sections/ChannelSection.jsx';
import DeliverySection from './components/sections/DeliverySection.jsx';
import MetaSection from './components/sections/MetaSection.jsx';
import MetaCreativesSection from './components/sections/MetaCreativesSection.jsx';
import YouTubeSection from './components/sections/YouTubeSection.jsx';
import YouTubeCreativesSection from './components/sections/YouTubeCreativesSection.jsx';
import TikTokSection from './components/sections/TikTokSection.jsx';
import TikTokCreativesSection from './components/sections/TikTokCreativesSection.jsx';
import KwaiSection from './components/sections/KwaiSection.jsx';
import KwaiCreativesSection from './components/sections/KwaiCreativesSection.jsx';
import FormatSection from './components/sections/FormatSection.jsx';
import StaticSection from './components/sections/StaticSection.jsx';
import PortalsIntroSection from './components/sections/PortalsIntroSection.jsx';
import SocialIntroSection from './components/sections/SocialIntroSection.jsx';
import InsightsSection from './components/sections/InsightsSection.jsx';
import OfflineIntroSection from './components/sections/OfflineIntroSection.jsx';
import OfflineKpiSection from './components/sections/OfflineKpiSection.jsx';
import OfflineChannelSection from './components/sections/OfflineChannelSection.jsx';
import ImpactIntroSection from './components/sections/ImpactIntroSection.jsx';
import ImpactSection from './components/sections/ImpactSection.jsx';
import ThankYouSection from './components/sections/ThankYouSection.jsx';

const SECTIONS = [
  { id: 'slide-hero', label: 'Capa', tone: 'dark' },
  { id: 'slide-concept', label: 'Conceito', tone: 'dark' },
  { id: 'slide-summary', label: 'Sumário', tone: 'dark' },
  { id: 'slide-glossary', label: 'Guia de Métricas', tone: 'dark' },
  { id: 'slide-kpi', label: 'Resultados', tone: 'light' },
  { id: 'slide-portals-intro', label: 'Portais e Programática', tone: 'dark' },
  { id: 'slide-channel', label: 'Canais', tone: 'light' },
  { id: 'slide-delivery', label: 'Entregas', tone: 'light' },
  { id: 'slide-social-intro', label: 'Redes Sociais', tone: 'dark' },
  { id: 'slide-meta', label: 'Meta', tone: 'light' },
  { id: 'slide-meta-creatives', label: 'Meta · Criativos', tone: 'light' },
  { id: 'slide-youtube', label: 'YouTube', tone: 'light' },
  { id: 'slide-youtube-creatives', label: 'YouTube · Criativos', tone: 'light' },
  { id: 'slide-tiktok', label: 'TikTok', tone: 'light' },
  { id: 'slide-tiktok-creatives', label: 'TikTok · Criativos', tone: 'light' },
  { id: 'slide-kwai', label: 'Kwai', tone: 'light' },
  { id: 'slide-kwai-creatives', label: 'Kwai · Criativos', tone: 'light' },
  { id: 'slide-format', label: 'Vídeos', tone: 'light' },
  { id: 'slide-static', label: 'Imagens', tone: 'light' },
  { id: 'slide-offline-intro', label: 'Mídia Offline', tone: 'dark' },
  { id: 'slide-offline-kpi', label: 'Offline · Resultados', tone: 'light' },
  { id: 'slide-offline-channel', label: 'Offline · Canais', tone: 'light' },
  { id: 'slide-impact-intro', label: 'Compilado Geral', tone: 'dark' },
  { id: 'slide-impact', label: 'Impacto Geral', tone: 'light' },
  { id: 'slide-insights', label: 'Aprendizados', tone: 'dark' },
  { id: 'slide-thanks', label: 'Obrigado', tone: 'dark' },
];

function EditModeBodyClass() {
  const { editMode } = useEditable();
  useEffect(() => {
    document.body.classList.toggle('edit-mode', editMode);
  }, [editMode]);
  return null;
}

const SECTION_IDS = SECTIONS.map((s) => s.id);

function Report() {
  const active = useSectionSpy(SECTION_IDS);
  usePagedScroll(SECTION_IDS);
  const { editMode, setEditMode } = useEditable();
  useEditShortcut(editMode, setEditMode);

  return (
    <>
      <EditModeBodyClass />
      <NavDots sections={SECTIONS} active={active} />
      <EditPanel />
      <SelectionToolbar editMode={editMode} />
      <Hero />
      <ConceptSection />
      <SummarySection />
      <GlossarySection />
      <KpiSection />
      <PortalsIntroSection />
      <ChannelSection />
      <DeliverySection />
      <SocialIntroSection />
      <MetaSection />
      <MetaCreativesSection />
      <YouTubeSection />
      <YouTubeCreativesSection />
      <TikTokSection />
      <TikTokCreativesSection />
      <KwaiSection />
      <KwaiCreativesSection />
      <FormatSection />
      <StaticSection />
      <OfflineIntroSection />
      <OfflineKpiSection />
      <OfflineChannelSection />
      <ImpactIntroSection />
      <ImpactSection />
      <InsightsSection />
      <ThankYouSection />
    </>
  );
}

export default function App() {
  return (
    <EditableProvider>
      <Report />
    </EditableProvider>
  );
}
