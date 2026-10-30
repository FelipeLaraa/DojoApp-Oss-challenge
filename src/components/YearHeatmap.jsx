import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dayKey } from '@/lib/activity';
import DaySheet from '@/components/DaySheet';

// Heatmap tipo Strava/GitHub: últimos 6 meses, 7 linhas x 26 colunas.
// 3 tons apenas — parado / treinou / dia duplo. Prova pública do hábito.
// Toque na célula abre bottom sheet com as sessões daquele dia.

const WEEKS = 26;
const DAYS_TOTAL = WEEKS * 7;

const LEVEL_BG = [
  'bg-white/5',          // 0 — parado
  'bg-[#4a7a2a]',        // 1 — treinou
  'bg-[#1f4a0e]'         // 2+ — dia duplo (mesma família, mais escuro)
];

const bucketize = (count) => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  return 2;
};

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const YearHeatmap = ({ activities, athleteId = null }) => {
  const navigate = useNavigate();
  const [openDay, setOpenDay] = useState(null); // { key, date, sessions }

  const { grid, total, byDay } = useMemo(() => {
    const counts = {};
    const sessionsByDay = {};
    (activities || []).forEach((a) => {
      const k = dayKey(a.date);
      counts[k] = (counts[k] || 0) + 1;
      if (!sessionsByDay[k]) sessionsByDay[k] = [];
      sessionsByDay[k].push(a);
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
      cells.push({ level: bucketize(c), date: k, count: c, dateObj: new Date(d) });
    }

    return { grid: cells, total: totalWorkouts, byDay: sessionsByDay };
  }, [activities]);

  const today = new Date();
  const currentMonthName = MONTHS_PT[today.getMonth()];
  const monthParam = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

  const handleCellClick = (cell) => {
    if (cell.count === 0) return; // não abre em dias parados
    const sessions = (byDay[cell.date] || []).slice().sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setOpenDay({ key: cell.date, dateObj: cell.dateObj, sessions });
  };

  return (
    <>
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
          className="grid gap-[3px] mb-4"
          style={{
            gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
            gridAutoFlow: 'column',
            gridTemplateRows: 'repeat(7, 1fr)'
          }}
        >
          {grid.map((cell, i) => {
            const clickable = cell.count > 0;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleCellClick(cell)}
                disabled={!clickable}
                title={`${cell.date} · ${cell.count} ${cell.count === 1 ? 'treino' : 'treinos'}`}
                className={`aspect-square rounded-[2px] ${LEVEL_BG[cell.level]} ${clickable ? 'cursor-pointer active:scale-90 transition-transform' : 'cursor-default'}`}
              />
            );
          })}
        </div>

        {/* Legenda 3 chips */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-white/50 font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-[2px] ${LEVEL_BG[0]}`} />
            parado
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-[2px] ${LEVEL_BG[1]}`} />
            treinou
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-[2px] ${LEVEL_BG[2]}`} />
            dia duplo
          </span>
        </div>
      </div>

      {/* Link ver mês */}
      <button
        type="button"
        onClick={() => navigate(`/history/${monthParam}${athleteId ? `?user=${athleteId}` : ''}`)}
        className="mt-2 w-full flex items-center justify-between px-4 py-3 text-white/70 hover:text-white active:scale-[0.99] transition-all"
      >
        <span className="text-sm font-medium">Ver mês de {currentMonthName}</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {openDay && (
          <DaySheet
            dateObj={openDay.dateObj}
            sessions={openDay.sessions}
            onClose={() => setOpenDay(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default YearHeatmap;
