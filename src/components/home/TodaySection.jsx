import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ShieldProfile from '@/components/ShieldProfile';
import WeekStories from '@/components/WeekStories';
import {
  readActivities,
  computeStreak,
  weekTrained,
  trainedToday as didTrainToday,
  todaySessions
} from '@/lib/activity';
import { relativeTime } from '@/lib/time';

// Hero da Home. Escudo grande, chip "sua vez hoje" (quando ainda não treinou),
// CTA gigante (coral antes, verde depois) e resumo em 3 colunas.
const TodaySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myActivities = readActivities(user?.id);
  const streak = computeStreak(myActivities);
  const weekCount = weekTrained(myActivities).filter(Boolean).length;
  const trained = didTrainToday(myActivities);
  const latest = myActivities[0];
  const todays = todaySessions(myActivities);
  const totalMin = todays.reduce((acc, a) => acc + (Number(a.durationMin) || 0), 0);
  const multiSession = todays.length > 1;

  // Primeiro treino do dia abre direto a câmera; sessão extra vai pro form normal.
  const handleRegister = () =>
    navigate(trained ? '/register' : '/register?camera=1');

  // "Último" (antes do treino) vs "Hoje" (depois do treino).
  let lastLabel = 'Último';
  let lastValue = 'faz dias';
  if (trained) {
    lastLabel = 'Hoje';
    lastValue = latest?.durationMin ? `${latest.durationMin} min` : 'registrado';
  } else if (latest?.date) {
    lastValue = relativeTime(latest.date);
  }

  const belt = user?.belt ? `faixa ${String(user.belt).toLowerCase()}` : null;
  const subtitle = [user?.mainSport || 'BJJ', belt].filter(Boolean).join(' · ');

  return (
    <section className="flex flex-col items-center">
      {/* Stories semanais no topo (padrão Instagram) */}
      <div className="w-full">
        <WeekStories activities={myActivities} user={user} trainedToday={trained} />
      </div>

      {/* Hero: escudo grande */}
      <div className="pt-4 pb-2">
        <ShieldProfile
          type={user?.frame || 'black'}
          emblem={user?.emblem}
          size="xl"
          photo={user?.photo}
          hit={streak > 0 ? streak : null}
          pulseIfMissing
          trainedToday={trained}
        />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold tracking-tight">{user?.name}</h2>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>

      {/* Chip "sua vez" — só aparece se ainda não treinou hoje */}
      {!trained && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] text-xs font-bold tracking-wide">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[#ff6b4a] opacity-75 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#ff6b4a]" />
          </span>
          Sua vez hoje — não perca a sequência
        </div>
      )}

      {/* CTA gigante */}
      <div className="w-full px-1 mt-5">
        <button
          onClick={handleRegister}
          className={`w-full rounded-2xl py-5 px-5 font-extrabold text-lg flex items-center justify-center gap-2 tracking-tight transition-transform active:scale-[.98] ${
            trained
              ? 'bg-white/5 border border-white/10 text-gray-400 shadow-none'
              : 'bg-gradient-to-br from-[#ff6b4a] to-[#ff4d2e] shadow-[0_14px_30px_rgba(255,77,46,0.4)] text-white'
          }`}
        >
          {trained ? (
            <>
              <span className="w-6 h-6 rounded-full bg-white/10 inline-flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>Treinei hoje</span>
              <span className="opacity-70 font-semibold text-base">
                {multiSession
                  ? ` · ${todays.length} sessões${totalMin ? ` · total ${totalMin}min` : ''}`
                  : ` · ${relativeTime(latest?.date)}${latest?.sport ? ` · ${latest.sport}` : ''}`}
              </span>
            </>
          ) : (
            <>
              <Flame className="w-6 h-6 drop-shadow-[0_0_6px_rgba(255,180,120,0.8)]" />
              <span>Treinei hoje</span>
            </>
          )}
        </button>
      </div>

      {/* Resumo 3 colunas */}
      <div className="w-full mt-5 dojo-card px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            Sequência
          </div>
          <div
            className={`mt-0.5 text-lg font-extrabold tracking-tight ${
              trained ? 'text-[#2ec27a]' : 'text-[#ff6b4a]'
            }`}
          >
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </div>
        </div>
        <div className="w-px h-9 bg-white/10" />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            Semana
          </div>
          <div className="mt-0.5 text-lg font-extrabold tracking-tight">{weekCount} / 7</div>
        </div>
        <div className="w-px h-9 bg-white/10" />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            {lastLabel}
          </div>
          <div className="mt-0.5 text-lg font-extrabold tracking-tight">{lastValue}</div>
        </div>
      </div>

    </section>
  );
};

export default TodaySection;
