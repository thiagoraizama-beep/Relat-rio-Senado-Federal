import { useState, useEffect, useRef } from 'react';
import { getCreativeMediaUrl } from '../data/campaignData.js';

const IMAGE_FALLBACK_EXTS = ['png', 'jpeg', 'webp'];

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function MuteIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />
    </svg>
  );
}

// Mostra o vídeo/imagem do criativo quando o arquivo existir em
// public/creatives/; até lá, cai num placeholder com o tipo de mídia.
// Para imagens, tenta .jpg primeiro e, se não existir, tenta outras
// extensões comuns (.png, .jpeg, .webp) antes de desistir.
export default function CreativeMedia({ item, className = '', showMuteToggle = false }) {
  const baseUrl = getCreativeMediaUrl(item);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    setMuted(true);
  }, [baseUrl]);

  const url = attempt === 0 ? baseUrl : baseUrl.replace(/\.jpg$/, `.${IMAGE_FALLBACK_EXTS[attempt - 1]}`);

  const handleError = () => {
    if (!item.isVideo && attempt < IMAGE_FALLBACK_EXTS.length) {
      setAttempt((a) => a + 1);
    } else {
      setFailed(true);
    }
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  if (item.youtubeEmbedId) {
    return (
      <iframe
        className={`creative-media creative-media-youtube ${className}`}
        src={`https://www.youtube.com/embed/${item.youtubeEmbedId}?rel=0&modestbranding=1`}
        title={item.name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    );
  }

  if (failed || !url) {
    return (
      <div className={`creative-media creative-media-placeholder ${className}`}>
        <span className="creative-media-placeholder-icon">{item.isVideo ? '▶' : '▢'}</span>
        <span className="creative-media-placeholder-label">{item.isVideo ? 'Vídeo' : 'Imagem'} pendente</span>
      </div>
    );
  }

  if (item.isVideo) {
    return (
      <>
        <video
          ref={videoRef}
          className={`creative-media ${className}`}
          src={url}
          muted={muted}
          loop
          playsInline
          autoPlay
          onError={handleError}
        />
        {showMuteToggle && (
          <button
            type="button"
            className="creative-media-mute-btn"
            onClick={toggleMute}
            aria-label={muted ? 'Ativar áudio' : 'Desativar áudio'}
          >
            {muted ? <MuteIcon /> : <UnmuteIcon />}
          </button>
        )}
      </>
    );
  }

  return (
    <img
      className={`creative-media ${className}`}
      src={url}
      alt={item.name}
      onError={handleError}
    />
  );
}
