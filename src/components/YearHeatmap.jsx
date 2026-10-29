import React, { useMemo } from 'react';
import { dayKey } from '@/lib/activity';

// Heatmap tipo Strava/GitHub: últimos 6 meses de treinos, 7 linhas x 26 colunas.
// Cada quadradinho = 1 dia. Verde mais escuro = mais sessões naquele dia.
// Prova pública do hábito — quebrar a sequência deve doer visualmente.

const WEEKS = 26;
const DAYS_TOTAL = WEEKS * 7;

const LEVEL_BG = [
  'bg-white/5',        // 0 treinos
  'bg-[#2d4e1a]',      // 1 treino (verde escuro, baixo)
  'bg-[#4a7a2a]',      // 2 treinos
  'bg-[#6ba13a]',      // 3 treinos
  'bg-[#8dc84a]'       // 4+ treinos
];

const bucketize = (count) => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
};

const YearHeatmap = ({ activities }) => {
  const { grid, total, firstMonthLabel, lastMonthLabel } = useMemo(() => {
    const counts = {};
    (activities || []).forEach((a) => {
      const k = dayKey(a.date);
      counts[k] = (counts[k] || 0) + 1;
    });

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (DAYS_TOTAL - 1));

    const cells = [];
    let totalWorkouts = 0;
    for (let i = 0; i < DAYS_TOTAL; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const k = dayKey(d);
      const c = counts[k] || 0;
      if (c > 0) totalWorkouts += c;
      cells.push({ level: bucketize(c), date: k, count: c });
    }

    const monthFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    return {
      grid: cells,
      total: totalWorkouts,
      firstMonthLabel: monthFmt.format(start).replace('.', ''),
      lastMonthLabel: monthFmt.format(today).replace('.', '')
    };
  }, [activities]);

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
          Últimos 6 meses
        </div>
        <div className="text-[11px] text-white/55 font-medium">
          {total} {total === 1 ? 'treino' : 'treinos'}
        </div>
      </div>

      <div
        className="grid gap-[3px] mb-3"
        style={{
          gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(7, 1fr)'
        }}
      >
        {grid.map((cell, i) => (
          <div
            key={i}
            title={`${cell.date} · ${cell.count} ${cell.count === 1 ? 'treino' : 'treinos'}`}
            className={`aspect-square rounded-[2px] ${LEVEL_BG[cell.level]}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-white/40 font-medium">
        <span>{firstMonthLabel}</span>
        <div className="flex items-center gap-1.5">
          <span>menos</span>
          {LEVEL_BG.map((cls, i) => (
            <span key={i} className={`w-2 h-2 rounded-[2px] ${cls}`} />
          ))}
          <span>mais</span>
        </div>
        <span>{lastMonthLabel}</span>
      </div>
    </div>
  );
};

export default YearHeatmap;
