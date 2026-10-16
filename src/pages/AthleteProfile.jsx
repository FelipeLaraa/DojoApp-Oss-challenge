import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, Swords, BarChart3, Unlock } from 'lucide-react';
import ShieldProfile from '@/components/ShieldProfile';
import WeekStories from '@/components/WeekStories';
import { characters } from '@/data/characters';

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

// Deriva "atividades" fake dos últimos 7 dias a partir do month[30]
// para alimentar o WeekStories (sem precisar de registro real).
const activitiesFromMonth = (month = []) => {
  const last7 = month.slice(-7); // 23..29
  const out = [];
  const today = new Date();
  last7.forEach((trained, i) => {
    if (!trained) return;
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    out.push({ date: d.toISOString(), sport: null, photo: null });
  });
  return out;
};

const monthWorkoutCount = (month = []) => month.filter(Boolean).length;

// Emblema textual de modalidade pro card "Último treino".
const sportIcon = (sport) => {
  if (!sport) return '🏋';
  const s = sport.toLowerCase();
  if (s.includes('corr')) return '🏃';
  if (s.includes('nata')) return '🏊';
  if (s.includes('bjj') || s.includes('luta') || s.includes('wrest')) return '🥋';
  if (s.includes('musc')) return '🏋';
  return '🏋';
};

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = characters.find((c) => c.id === id);

  if (!base) {
    return (
      <div className="min-h-screen p-6 dojo-gradient flex flex-col items-center justify-center text-center">
        <p className="text-gray-400 mb-4">Atleta não encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-red-400 underline">Voltar</button>
      </div>
    );
  }

  const athlete = mergeSaved(base);
  const activities = activitiesFromMonth(athlete.month);
  const monthCount = monthWorkoutCount(athlete.month);
  const isDistanceSport = athlete.mainSport === 'Corrida' || athlete.mainSport === 'Natação';
  const distanceSub = isDistanceSport && athlete.activity?.headline?.includes('km')
    ? `${athlete.activity.headline} no mês`
    : null;

  return (
    <div className="min-h-screen pb-28 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
            Atleta
          </div>
          <div className="w-9" />
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center px-6 pt-5 pb-2">
          <ShieldProfile
            type={athlete.frame}
            emblem={athlete.emblem}
            hit={athlete.streak}
            size="xl"
            photo={athlete.photo}
          />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">{athlete.name}</h1>
          <p className="mt-0.5 text-[13px] text-white/55 font-medium">
            @{athlete.username} · {athlete.mainSport || athlete.modality}
          </p>
          {athlete.bio && (
            <p className="mt-3 text-[13.5px] text-white/78 leading-snug text-center max-w-[280px] font-medium">
              {athlete.bio}
            </p>
          )}
        </div>

        {/* Semana atual */}
        <div className="px-5 pt-6 pb-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35 mb-2.5 px-1">
            Semana atual
          </div>
          <WeekStories
            activities={activities}
            user={athlete}
            trainedToday={!!athlete.month?.[29]}
            showCount={false}
          />
        </div>

        {/* Último treino */}
        <div className="mx-5 mt-4 flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/[0.02] border border-[#d4af37]/25">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-xl flex-shrink-0">
            {sportIcon(athlete.mainSport)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
              Último treino
            </div>
            <div className="text-sm font-bold mt-0.5 tracking-tight">
              {athlete.mainSport || athlete.modality} · {athlete.activity?.headline || '—'}
            </div>
            {athlete.activity?.detail && (
              <div className="text-[11.5px] text-white/55 mt-0.5">
                {athlete.activity.detail}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2.5 px-5 pt-4">
          <div className="flex-1 bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">Mês</div>
            <div className="text-xl font-extrabold mt-1 tracking-tight">{monthCount}</div>
            <div className="text-[11px] text-white/55 mt-0.5 font-medium">treinos</div>
          </div>
          <div className="flex-1 bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">Modalidade</div>
            <div className="text-xl font-extrabold mt-1 tracking-tight">
              {athlete.mainSport || athlete.modality}
            </div>
            {distanceSub && (
              <div className="text-[11px] text-white/55 mt-0.5 font-medium">{distanceSub}</div>
            )}
          </div>
        </div>

        {/* PRO teaser */}
        <div className="relative mx-5 mt-5 p-[18px_18px_60px] rounded-[20px] overflow-hidden border border-[#d4af37]/25 bg-gradient-to-b from-[rgba(20,20,20,0.1)] via-[rgba(20,20,20,0.6)] to-[rgba(20,20,20,0.95)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/15 to-[#ff6b4a]/10 pointer-events-none" />
          <div className="relative flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold tracking-tight">Desbloquear perfil completo</div>
            <div className="text-[9px] font-black tracking-widest text-[#0a0a0a] bg-gradient-to-br from-[#f5d274] to-[#d4af37] px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(212,175,55,0.4)]">
              PRO
            </div>
          </div>
          <div className="relative flex flex-col gap-3 blur-[3.5px] opacity-65 pointer-events-none">
            {[
              { icon: BarChart3, lbl: 'Histórico de 12 meses', sub: 'calendário completo de treinos' },
              { icon: Map, lbl: 'Mapa das corridas', sub: 'rotas, pace e elevação' },
              { icon: Swords, lbl: 'Comparar com você', sub: 'quem mais treinou nos últimos 30 dias' }
            ].map((it, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                  <it.icon className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <div className="text-xs font-bold">{it.lbl}</div>
                  <div className="text-[10px] text-white/55 mt-0.5">{it.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute left-0 right-0 bottom-4 flex justify-center">
            <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-extrabold text-[13px] bg-gradient-to-br from-[#f5d274] to-[#d4af37] text-[#0a0a0a] shadow-[0_10px_24px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] tracking-tight">
              <Unlock className="w-3.5 h-3.5" />
              Virar PRO
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AthleteProfile;
