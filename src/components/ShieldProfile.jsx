import React from 'react';
import { Dumbbell, Waves, Footprints } from 'lucide-react';

// Emblemas de esporte. Ícones polidos da lucide + faixa de BJJ desenhada à mão.
const emblems = {
  // Luta (BJJ): faixa amarrada com nó e pontas.
  grapple: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M2.5 11h6.5" />
      <path d="M15 11h6.5" />
      <rect x="9" y="8.5" width="6" height="5" rx="1.3" />
      <path d="M10.6 13.5l-1.1 4.2" />
      <path d="M13.4 13.5l1.1 4.2" />
    </svg>
  ),
  lift: <Dumbbell className="w-full h-full" />,
  run: <Footprints className="w-full h-full" />,
  swim: <Waves className="w-full h-full" />
};

// Cor do selo "hit" (sequência) por faixa: cinza → laranja → vermelho → roxo.
export const hitColor = (hit) => {
  if (hit >= 30) return '#a855f7';
  if (hit >= 7) return '#ef4444';
  if (hit >= 1) return '#fb923c';
  return '#4b5563';
};

// type   = moldura (cor/estilo). emblem = selo de esporte (independente da moldura).
// hit    = sequência de treinos; mostra o selo colorido. null/undefined = sem selo.
const ShieldProfile = ({
  type = 'black',
  hit = null,
  size = 'medium',
  photo = null,
  emblem,
  pulseIfMissing = false,
  trainedToday = true
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
    xl: 'shield-xl'
  };

  const frameClasses = {
    black: 'shield-black',
    coral: 'shield-coral',
    white: 'shield-white',
    swim: 'shield-swim',
    lift: 'shield-lift',
    grapple: 'shield-grapple',
    run: 'shield-run'
  };

  const hitBadgeSize = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5',
    xl: 'text-base px-4 py-1.5'
  };

  const emblemSize = {
    small: 'w-7 h-7 p-1',
    medium: 'w-9 h-9 p-1.5',
    large: 'w-12 h-12 p-2',
    xl: 'w-11 h-11 p-2'
  };

  // Se emblem foi passado (inclusive null para "nenhum"), ele manda. Caso
  // contrário, cai no comportamento antigo (emblema derivado da moldura).
  const emblemKey = emblem !== undefined ? emblem : type;
  const emblemSvg = emblemKey ? emblems[emblemKey] : null;
  const showHit = hit !== null && hit !== undefined;
  const pulseClass = pulseIfMissing && !trainedToday ? 'shield-pulse-missing' : '';

  return (
    <div className="relative inline-block">
      <div className={`shield-frame ${frameClasses[type]} ${sizeClasses[size]} ${pulseClass} overflow-hidden`}>
        {photo ? (
          <img src={photo} alt="Foto do perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">🥋</span>
        )}
      </div>

      {emblemSvg && (
        <div className={`emblem-badge ${emblemSize[size]}`}>
          {emblemSvg}
        </div>
      )}

      {showHit && (
        <div className={`years-badge ${hitBadgeSize[size]}`} style={{ backgroundColor: hitColor(hit) }}>
          {hit}
        </div>
      )}
    </div>
  );
};

export default ShieldProfile;
