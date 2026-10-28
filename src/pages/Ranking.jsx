import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { characters } from '@/data/characters';
import {
  readActivities,
  computeStreak,
  weekTrained,
  trainedToday as didTrainToday
} from '@/lib/activity';

// Milestones de sequência considerados "recorde" (coerente com RegisterActivity).
const MILESTONE_DAYS = new Set([7, 14, 30, 50, 100, 365]);

// Dias até fechar a semana corrente. Semana fecha no domingo 23:59.
// getDay(): 0=domingo, 1=segunda, ... 6=sábado.
const daysUntilSundayClose = (now = new Date()) => (7 - now.getDay()) % 7;

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

// Pódio por cor: ouro / prata / bronze / coral / cinza (inativo).
const avatarByPos = (pos, inactive) => {
  if (inactive) {
    return 'bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] border-white/10 text-white/40';
  }
  if (pos === 0) return 'bg-gradient-to-br from-[#d4af37] to-[#8b6f1f] border-[#d4af37] text-white';
  if (pos === 1) return 'bg-gradient-to-br from-[#d7d7d7] to-[#8a8a8a] border-[#d7d7d7] text-black';
  if (pos === 2) return 'bg-gradient-to-br from-[#c67a3d] to-[#6b3c17] border-[#c67a3d] text-white';
  return 'bg-gradient-to-br from-[#ff7a59] to-[#f4502f] border-[#ff6b4a] text-white';
};

const posNumberClass = (pos, inactive) => {
  if (inactive) return 'text-white/35';
  if (pos === 0) return 'text-[#d4af37]';
  if (pos === 1) return 'text-[#d7d7d7]';
  if (pos === 2) return 'text-[#c67a3d]';
  return 'text-white/55';
};

const groupMonth = (month = []) => {
  const safe = Array.from({ length: 30 }, (_, i) => !!month[i]);
  return [safe.slice(0, 7), safe.slice(7, 14), safe.slice(14, 21), safe.slice(21, 30)];
};

const Dot = ({ on, highlight }) => {
  if (!on) return <span className="w-[3.5px] h-[3.5px] rounded-full bg-white/10 flex-shrink-0" />;
  if (highlight) {
    return (
      <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#2ec27a] shadow-[0_0_3px_rgba(46,194,122,0.5)] flex-shrink-0" />
    );
  }
  return (
    <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#ff6b4a] shadow-[0_0_3px_rgba(255,107,74,0.6)] flex-shrink-0" />
  );
};

const countWeek = (week = []) => week.filter(Boolean).length;
const countMonthWeek = (month = []) => (month.length >= 7 ? month.slice(-7).filter(Boolean).length : 0);
const countPrevWeek = (month = []) =>
  month.length >= 14 ? month.slice(-14, -7).filter(Boolean).length : null;

// Converte os dados reais do usuário num "character-like" com month fictício
// de 30 dias (preenchido pelo que der). Semana atual vem de weekTrained;
// semana anterior fica como null (dado real curto; mostramos "—").
const buildSelf = (user, activities) => {
  const streak = computeStreak(activities);
  const week = weekTrained(activities);
  const month = Array.from({ length: 30 }, (_, i) => {
    // Preenche os últimos 7 com weekTrained; o restante fica vazio por enquanto.
    if (i >= 23) return !!week[i - 23];
    return false;
  });
  return {
    id: user?.id || 'me',
    name: 'Você',
    frame: user?.frame || 'black',
    emblem: user?.emblem,
    photo: user?.photo,
    streak,
    week,
    month,
    trainedTodayReal: didTrainToday(activities),
    milestone: null,
    isMe: true,
    hasRealHistory: false
  };
};

const Ranking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const myActivities = readActivities(user?.id);
  const self = useMemo(() => buildSelf(user, myActivities), [user, myActivities]);

  // Participantes: amigos (characters) + eu. Se eu já for um character, sobrescreve.
  const people = useMemo(() => {
    const base = characters.map(mergeSaved).map((c) => ({
      id: c.id,
      name: c.id === user?.id ? 'Você' : c.name,
      frame: c.frame,
      emblem: c.emblem,
      photo: c.photo,
      streak: c.id === user?.id ? self.streak : c.streak,
      week: c.id === user?.id ? self.week : c.week,
      month: c.id === user?.id ? self.month : c.month,
      trainedTodayReal: c.id === user?.id ? self.trainedTodayReal : !!c.month?.[29],
      milestone: c.milestone || null,
      isMe: c.id === user?.id,
      hasRealHistory: c.id === user?.id ? false : true
    }));
    if (user?.id && !base.some((p) => p.isMe)) base.push(self);
    return base
      .map((p) => ({ ...p, inactive: !p.streak && countMonthWeek(p.month) === 0 }))
      .sort(
        (a, b) =>
          countMonthWeek(b.month) - countMonthWeek(a.month) ||
          b.streak - a.streak
      )
      .map((p, i) => ({ ...p, position: i + 1 }));
  }, [user, self]);

  // Headline: 1) EU bati milestone agora (streak é marco) → prioridade máxima.
  //           2) Qualquer character com milestone.hitAt < 7 dias.
  //           3) Nenhum → faixa some.
  const headline = useMemo(() => {
    if (self.streak > 0 && MILESTONE_DAYS.has(self.streak)) {
      return { name: 'Você', days: self.streak, isMe: true };
    }
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let best = null;
    characters.forEach((c) => {
      if (!c.milestone?.hitAt || !c.milestone?.days) return;
      const t = new Date(c.milestone.hitAt).getTime();
      if (t < sevenDaysAgo) return;
      if (!best || t > new Date(best.hitAt).getTime()) {
        best = { name: c.name, days: c.milestone.days, hitAt: c.milestone.hitAt, isMe: false };
      }
    });
    return best;
  }, [self.streak]);

  const now = new Date();
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const daysLeft = daysUntilSundayClose(now);
  const closeLabel =
    daysLeft === 0
      ? 'fecha hoje · 23:59'
      : `${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} pra fechar`;

  return (
    <div className="min-h-screen pb-28 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Ranking</h1>
          <div className="mt-1 text-[12px] text-white/55 font-medium capitalize">
            {weekday} · <span className="text-white/75">{closeLabel}</span>
          </div>
        </div>

        {/* Faixa de destaque (sumariza o fato da semana) */}
        {headline && (
          <div className="px-5 pt-1 pb-3">
            <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-gradient-to-br from-[#d4af37]/15 to-[#ff6b4a]/8 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center flex-shrink-0 text-xl">
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9.5px] font-black uppercase tracking-[0.14em] text-[#d4af37]">
                    manchete da semana
                  </div>
                  <div className="text-[14px] font-extrabold tracking-tight text-white mt-0.5 leading-tight">
                    <span className={headline.isMe ? 'text-[#ff6b4a]' : ''}>
                      {headline.name}
                    </span>{' '}
                    bateu recorde:{' '}
                    <span className="text-[#d4af37]">
                      {headline.days} dias seguidos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="px-5">
          <div className="rounded-[18px] bg-[#141414] border border-white/10 overflow-hidden">
            {people.map((p, idx) => {
              const pos = idx;
              const weeks = groupMonth(p.month);
              const wc = countMonthWeek(p.month);
              const prev = countPrevWeek(p.month);
              const isLast = idx === people.length - 1;
              const isOpen = expandedId === p.id;

              return (
                <div key={p.id} className={!isLast ? 'border-b border-white/10' : ''}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : p.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-3.5 text-left transition-colors ${
                      p.isMe ? 'bg-[#ff6b4a]/8' : ''
                    }`}
                  >
                    <div className={`w-[18px] text-center text-[13px] font-black ${posNumberClass(pos, p.inactive)}`}>
                      {pos + 1}
                    </div>
                    <div
                      className={`w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center text-xs font-extrabold border-[1.5px] ${avatarByPos(pos, p.inactive)}`}
                    >
                      {p.photo ? (
                        <img src={p.photo} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        p.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] font-bold tracking-tight leading-none ${
                          p.inactive ? 'text-white/55' : p.isMe ? 'text-[#ff6b4a]' : 'text-white'
                        }`}
                      >
                        {p.name}
                      </div>
                      <div className="mt-2 flex items-center gap-[3px]">
                        {weeks.map((week, wi) => (
                          <div key={wi} className={`flex gap-[1.5px] ${wi > 0 ? 'ml-[3px]' : ''}`}>
                            {week.map((on, di) => {
                              const isToday = wi === 3 && di === week.length - 1;
                              return <Dot key={di} on={on} highlight={isToday && on} />;
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 min-w-[46px]">
                      <span
                        className={`text-[15px] font-extrabold tracking-tight ${
                          p.inactive ? 'text-white/55' : 'text-white'
                        }`}
                      >
                        {wc}x
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-white/35">
                        semana
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-white/25 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3.5 pt-0 flex items-center gap-3 text-[11.5px] text-white/70 font-medium">
                          <span>
                            última semana:{' '}
                            <span className="text-white font-bold">
                              {prev == null ? '—' : `${prev}x`}
                            </span>
                          </span>
                          <span className="w-[3px] h-[3px] rounded-full bg-white/20" />
                          <span>
                            hit atual:{' '}
                            <span className="text-white font-bold">{p.streak}d</span>
                          </span>
                          {!p.isMe && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/athlete/${p.id}`);
                              }}
                              className="ml-auto text-[11px] font-bold text-[#ff6b4a] hover:text-[#ff8666]"
                            >
                              ver perfil →
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-white/40 font-medium mt-4">
            {daysLeft === 0 ? 'última chamada · fecha hoje 23:59' : `fecha domingo · 23:59`}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Ranking;
