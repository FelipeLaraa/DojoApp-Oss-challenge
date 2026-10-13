import React from 'react';

// Emblemas temáticos (SVG) desenhados em traço branco.
const emblems = {
  swim: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="13" r="3.2" />
      <circle cx="16" cy="13" r="3.2" />
      <path d="M11.2 12.5h1.6" />
      <path d="M4.8 11.5l-1.3-2.2a2 2 0 0 1 1.7-3h.3" />
      <path d="M19.2 11.5l1.3-2.2a2 2 0 0 0-1.7-3h-.3" />
    </svg>
  ),
  lift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5c3 3 15 3 18 0" />
      <path d="M3.5 8v5M5.5 9v3M18.5 9v3M20.5 8v5" />
    </svg>
  ),
  grapple: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16v3H4z" />
      <path d="M11 12l-2.5 5M13 12l2.5 5" />
    </svg>
  ),
  run: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16h12l4-1.5c1.5-.5 2-1 2-2 0-.8-.6-1.3-1.6-1.2l-4.4.4-3-3-2 2 2.5 2.5-6 .3" />
      <path d="M3 18.5h18" />
    </svg>
  )
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
const ShieldProfile = ({ type = 'black', hit = null, size = 'medium', photo = null, emblem }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
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
    large: 'text-base px-4 py-1.5'
  };

  const emblemSize = {
    small: 'w-5 h-5 p-0.5',
    medium: 'w-7 h-7 p-1',
    large: 'w-9 h-9 p-1.5'
  };

  // Se emblem foi passado (inclusive null para "nenhum"), ele manda. Caso
  // contrário, cai no comportamento antigo (emblema derivado da moldura).
  const emblemKey = emblem !== undefined ? emblem : type;
  const emblemSvg = emblemKey ? emblems[emblemKey] : null;
  const showHit = hit !== null && hit !== undefined;

  return (
    <div className="relative inline-block">
      <div className={`shield-frame ${frameClasses[type]} ${sizeClasses[size]} overflow-hidden`}>
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
