import React from 'react';
import { Shield, Dumbbell, Footprints, Waves, Activity } from 'lucide-react';

// Ícone lucide pra cada modalidade. Volta Activity como fallback neutro.
// Mantém a família visual: todos stroke, mesmo peso, cor controlada pelo pai.
export const SportIcon = ({ sport, className = 'w-5 h-5' }) => {
  if (!sport) return <Activity className={className} />;
  const s = sport.toLowerCase();
  if (s.includes('corr')) return <Footprints className={className} />;
  if (s.includes('nata')) return <Waves className={className} />;
  if (s.includes('bjj') || s.includes('luta') || s.includes('wrest') || s.includes('boxe') || s.includes('karate')) {
    return <Shield className={className} />;
  }
  if (s.includes('musc')) return <Dumbbell className={className} />;
  return <Activity className={className} />;
};

export default SportIcon;
