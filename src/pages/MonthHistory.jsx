import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/hooks/useActivities';
import { dayKey } from '@/lib/activity';
import { characters } from '@/data/characters';
import SportIcon from '@/lib/sportIcon.jsx';

// Tela cheia navegável do mês: lista cronológica agrupada por dia,
// dias sem treino não aparecem (presença, não culpa).

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];
const WEEKDAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS_SHORT_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const parseParam = (yyyymm) => {
  const safe = String(yyyymm || '').replace(/[^0-9]/g, '').slice(0, 6);
  if (safe.length !== 6) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const year = parseInt(safe.slice(0, 4), 10);
  const month = parseInt(safe.slice(4, 6), 10) - 1;
  return { year, month };
};

const toParam = (year, month) =>
  `${year}${String(month + 1).padStart(2, '0')}`;

const formatDayHeader = (d) => {
  const date = new Date(d);
  return `${WEEKDAYS_PT[date.getDay()]} · ${date.getDate()} ${MONTHS_SHORT_PT[date.getMonth()]}`;
};

const formatTime = (d) => {
  const date = new Date(d);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const formatSessionMeta = (s) => {
  const parts = [formatTime(s.date)];
  if (s.durationMin) parts.push(`${s.durationMin} min`);
  if (s.distanceKm) parts.push(`${s.distanceKm} km`);
  return parts.join(' · ');
};

const MonthHistory = () => {
  const { yyyyMM } = useParams();
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get('user');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities: ownActivities, loading: ownLoading } = useActivities(athleteId ? null : user?.id);
  const athlete = athleteId ? characters.find((c) => c.id === athleteId) : null;
  const activities = athleteId ? (athlete?.activities || []) : ownActivities;
  const loading = athleteId ? false : ownLoading;

  const { year, month } = parseParam(yyyyMM);

  const { grouped, totalSessions, totalDays } = useMemo(() => {
    const inMonth = (activities || []).filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    // Agrupa por dia (chave YYYY-MM-DD)
    const byDay = {};
    inMonth.forEach((a) => {
      const k = dayKey(a.date);
      if (!byDay[k]) byDay[k] = [];
      byDay[k].push(a);
    });

    // Ordena cada dia por hora ascendente e os dias pelo mais recente primeiro
    const dayKeys = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
    const list = dayKeys.map((k) => {
      const sessions = byDay[k].slice().sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return { key: k, dateObj: new Date(sessions[0].date), sessions };
    });

    return { grouped: list, totalSessions: inMonth.length, totalDays: list.length };
  }, [activities, year, month]);

  const suffix = athleteId ? `?user=${athleteId}` : '';
  const goPrev = () => {
    const d = new Date(year, month - 1, 1);
    navigate(`/history/${toParam(d.getFullYear(), d.getMonth())}${suffix}`, { replace: true });
  };
  const goNext = () => {
    const d = new Date(year, month + 1, 1);
    navigate(`/history/${toParam(d.getFullYear(), d.getMonth())}${suffix}`, { replace: true });
  };

  const monthLabel = athlete ? `${MONTHS_PT[month]} de ${athlete.name}` : MONTHS_PT[month];

  return (
    <div className="min-h-screen dojo-gradient text-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>

            <div className="text-base font-bold text-white min-w-[160px] text-center capitalize">
              {monthLabel}
              {new Date().getFullYear() !== year && (
                <span className="ml-1 text-white/40 font-medium">{year}</span>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="w-9" />
        </div>

        <div className="px-5 pb-3 text-center text-[12px] text-white/50 font-medium">
          {loading ? (
            <span>carregando…</span>
          ) : totalSessions === 0 ? (
            <span>nenhum treino neste mês</span>
          ) : (
            <span>
              {totalSessions} {totalSessions === 1 ? 'sessão' : 'sessões'} em {totalDays} {totalDays === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="px-5 pt-5 space-y-5">
        {!loading && grouped.length === 0 && (
          <div className="text-center text-white/40 text-sm py-10">
            Mês em branco. O próximo registro aparece aqui.
          </div>
        )}

        {grouped.map((day, idx) => (
          <motion.div
            key={day.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50 mb-2">
              {formatDayHeader(day.dateObj)}
            </div>

            <div className="space-y-2">
              {day.sessions.map((s, i) => (
                <div
                  key={s.id || i}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5"
                >
                  <div className="w-9 h-9 rounded-full bg-[#4a7a2a]/20 flex items-center justify-center text-[#8dc84a] shrink-0">
                    <SportIcon sport={s.sport} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {s.sport || 'Treino'}
                    </div>
                    <div className="text-[12px] text-white/50 font-medium">
                      {formatSessionMeta(s)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MonthHistory;
