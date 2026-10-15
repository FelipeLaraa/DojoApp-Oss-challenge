import React from 'react';

// Week frequency strip (last 7 days). The last dot is "today".
//
// Props:
// - days: boolean[7] — trained on each of the last 7 days
// - size: 'sm' | 'lg'
//     sm (default): current visual used across cards in the feed
//     lg: bigger skeleton — hooks ready for the Etapa 2 redesign
//        (named days, weekend color). Visual intentionally minimal here.
// - showLabels: when true, shows a letter under each dot.
//     Labels follow local getDay() with the rotating array
//     ['D','S','T','Q','Q','S','S'].
// - showCount: show the "Nx esta semana" suffix (default true).
//
// NOTE: visual completo cabe na Etapa 2. Esta etapa só prepara os ganchos
// sem alterar a aparência do que já existe hoje.
const DAY_LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const WeekStrip = ({ days = [], size = 'sm', showLabels = false, showCount = true }) => {
  const count = days.filter(Boolean).length;
  const isLg = size === 'lg';

  const dotClass = isLg ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const gapClass = isLg ? 'gap-1.5' : 'gap-1';

  // Build day letters for the last 7 dots ending today (only when needed).
  let labels = null;
  if (showLabels) {
    const todayIdx = new Date().getDay(); // 0..6 (Sun..Sat)
    labels = days.map((_, i) => {
      const offset = days.length - 1 - i; // 0 = today, 6 = 6 days ago
      const dayIdx = (todayIdx - offset + 7) % 7;
      return DAY_LETTERS[dayIdx];
    });
  }

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className={`flex ${gapClass}`}>
        {days.map((d, i) => {
          const dot = (
            <span
              className={`${dotClass} rounded-full ${d ? 'bg-orange-400' : 'bg-gray-700'} ${
                i === days.length - 1 ? 'ring-1 ring-white/50' : ''
              }`}
            />
          );
          if (!showLabels) return <React.Fragment key={i}>{dot}</React.Fragment>;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              {dot}
              {labels && (
                <span className="text-[10px] text-gray-500 leading-none">{labels[i]}</span>
              )}
            </div>
          );
        })}
      </div>
      {showCount && <span className="text-xs text-gray-400">{count}x esta semana</span>}
    </div>
  );
};

export default WeekStrip;
