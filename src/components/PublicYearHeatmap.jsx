import React, { useMemo } from 'react';

// Heatmap público do perfil de amigo — prova visual da consistência dos
// últimos 30 dias. Enquanto só há dado mock (characters.month[30]), limitamos
// a janela a 30 dias pra não parecer bug (grid 6m todo cinza).
// Quando Supabase e dados reais chegarem, trocar por YearHeatmap de 6m.
//
// Nicole walkthrough: dia treinado NÃO abre sheet (não há dado granular
// — abrir seria dead-end). Fica puramente visual.

const COLS = 6;
const ROWS = 5;
const DAYS_TOTAL = COLS * ROWS; // 30

const LEVEL_BG = [
  'bg-white/5',          // 0 — parado
  'bg-[#4a7a2a]'         // 1 — treinou
];

const PublicYearHeatmap = ({ monthBool = [] }) => {
  // monthBool: idx 0 = 29 dias atrás, idx 29 = hoje
  const grid = useMemo(() => {
    const cells = [];
    for (let i = 0; i < DAYS_TOTAL; i++) {
      cells.push({ level: monthBool[i] ? 1 : 0 });
    }
    return cells;
  }, [monthBool]);

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 mb-3">
        Últimos 30 dias
      </div>

      <div
        className="grid gap-[4px] mb-4"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(${ROWS}, 1fr)`
        }}
      >
        {grid.map((cell, i) => (
          <div
            key={i}
            className={`aspect-square rounded-[3px] ${LEVEL_BG[cell.level]}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-[10px] text-white/50 font-medium">
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-[2px] ${LEVEL_BG[0]}`} />
          parado
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-[2px] ${LEVEL_BG[1]}`} />
          treinou
        </span>
      </div>
    </div>
  );
};

export default PublicYearHeatmap;
