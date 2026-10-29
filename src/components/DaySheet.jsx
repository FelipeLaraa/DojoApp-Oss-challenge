import React from 'react';
import { motion } from 'framer-motion';
import SportIcon from '@/lib/sportIcon.jsx';

// Bottom sheet de consulta — mostra as sessões de um dia específico.
// Fecha ao arrastar pra baixo ou tocar fora. Sem ações, só leitura.

const WEEKDAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS_SHORT_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const formatDayLabel = (d) => {
  const date = new Date(d);
  return `${WEEKDAYS_PT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT_PT[date.getMonth()]}`;
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

const DaySheet = ({ dateObj, sessions = [], onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 500) onClose?.();
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#141414] border-t border-white/10 rounded-t-3xl pb-[calc(20px+env(safe-area-inset-bottom,0px))]"
      >
        {/* Dragger */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Label do dia */}
        <div className="px-5 pt-1 pb-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
            {formatDayLabel(dateObj)}
          </div>
        </div>

        {/* Lista de sessões */}
        <div className="px-5 pb-5 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-white/40 text-sm py-6">
              Nenhum treino neste dia
            </div>
          ) : (
            sessions.map((s, i) => (
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
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DaySheet;
