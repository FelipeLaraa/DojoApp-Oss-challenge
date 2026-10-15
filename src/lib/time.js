// Tempo relativo curto em português. Exemplos: "agora", "há 5min", "há 2h",
// "ontem", "há 3d". Usa Date local do aparelho.
export const relativeTime = (dateISO) => {
  if (!dateISO) return '';
  const now = new Date();
  const then = new Date(dateISO);
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return '';

  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);

  if (sec < 60) return 'agora';
  if (min < 60) return `há ${min}min`;
  if (hour < 24) return `há ${hour}h`;

  // Calcula diferença em dias de calendário, não só 24h de janela.
  const dayKey = (d) => {
    const x = new Date(d);
    return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  };
  const diffDays = Math.round((dayKey(now) - dayKey(then)) / (24 * 60 * 60 * 1000));
  if (diffDays <= 1) return 'ontem';
  return `há ${diffDays}d`;
};
