import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Pencil, X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Chip âmbar discreto no topo da Home: "próximo treino: seg 7h · BJJ".
// Edita em 2 toques via bottom sheet. Guarda em user.nextWorkout.
// Nada aqui é obrigação: Rafael pode ignorar sem culpa.

const DAYS = [
  { id: 0, short: 'dom', long: 'Domingo' },
  { id: 1, short: 'seg', long: 'Segunda' },
  { id: 2, short: 'ter', long: 'Terça' },
  { id: 3, short: 'qua', long: 'Quarta' },
  { id: 4, short: 'qui', long: 'Quinta' },
  { id: 5, short: 'sex', long: 'Sexta' },
  { id: 6, short: 'sáb', long: 'Sábado' }
];

const SPORTS = ['BJJ', 'Wrestling', 'Corrida', 'Musculação', 'Boxe', 'Luta livre', 'Natação'];

const formatHour = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  if (!m || m === '00') return `${Number(h)}h`;
  return `${Number(h)}h${m}`;
};

const chipLabel = (next) => {
  if (!next || next.day === null || next.day === undefined) return null;
  const d = DAYS.find((x) => x.id === Number(next.day));
  const bits = [d?.short, formatHour(next.time), next.sport].filter(Boolean);
  return bits.join(' · ');
};

const NextWorkoutChip = () => {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);

  const [draft, setDraft] = useState({ day: 1, time: '07:00', sport: user?.mainSport || 'BJJ' });

  useEffect(() => {
    if (!user?.nextWorkout) return;
    setDraft({
      day: user.nextWorkout.day ?? 1,
      time: user.nextWorkout.time || '07:00',
      sport: user.nextWorkout.sport || user?.mainSport || 'BJJ'
    });
  }, [user]);

  const current = user?.nextWorkout;
  const label = chipLabel(current);

  const openEditor = () => {
    setDraft({
      day: current?.day ?? 1,
      time: current?.time || '07:00',
      sport: current?.sport || user?.mainSport || 'BJJ'
    });
    setOpen(true);
  };

  const save = async () => {
    const { error } = await updateUser({ nextWorkout: { ...draft } });
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setOpen(false);
  };

  const clear = async () => {
    const { error } = await updateUser({ nextWorkout: null });
    if (error) {
      toast({ title: 'Não foi possível remover', description: error.message, variant: 'destructive' });
      return;
    }
    setOpen(false);
  };

  return (
    <>
      {label ? (
        <button
          type="button"
          onClick={openEditor}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 text-left hover:bg-[#d4af37]/15 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CalendarClock className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#d4af37]/80">
                Próximo treino
              </div>
              <div className="text-[13px] font-bold text-white truncate">{label}</div>
            </div>
          </div>
          <Pencil className="w-3.5 h-3.5 text-[#d4af37]/70 flex-shrink-0" />
        </button>
      ) : (
        <button
          type="button"
          onClick={openEditor}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[12px] font-semibold text-white/55 hover:text-white/80 hover:bg-white/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Marcar próximo treino
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#141414] border-t border-white/10 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold">Próximo treino</h3>
                <button onClick={() => setOpen(false)} aria-label="Fechar">
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Dia</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS.map((d) => {
                    const active = Number(draft.day) === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, day: d.id })}
                        className={`py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all ${
                          active
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d274]'
                            : 'bg-black/40 border-white/10 text-white/55 hover:text-white/80'
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Hora</label>
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-[#d4af37] focus:outline-none text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Modalidade</label>
                  <select
                    value={draft.sport}
                    onChange={(e) => setDraft({ ...draft, sport: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-[#d4af37] focus:outline-none text-sm"
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {current && (
                  <button
                    type="button"
                    onClick={clear}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Limpar
                  </button>
                )}
                <button
                  type="button"
                  onClick={save}
                  className="flex-[2] py-3 rounded-xl font-extrabold bg-gradient-to-br from-[#f5d274] to-[#d4af37] text-[#0a0a0a] shadow-[0_10px_24px_rgba(212,175,55,0.4)]"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NextWorkoutChip;
