import React from 'react';
import { dayKey } from '@/lib/activity';

// Stories semanais no topo do "Seu dia". 7 circulos (segunda -> domingo),
// cada um mostra:
// - Dia treinou: foto do treino (ou foto do perfil / inicial) com moldura
//   dourada e emblema de "feito".
// - Dia perdido: inicial do dia borrada, fundo cinza, borda tracejada.
// - Hoje: anel vivo colorido (coral antes do treino, verde depois).
// Letra abaixo das bolinhas; sabado e domingo em roxo.
const DAY_LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Monta uma janela de 7 dias terminando hoje (igual weekTrained),
// na ordem natural de leitura (mais antigo -> hoje).
const buildWindow = (activities) => {
  const map = new Map();
  (activities || []).forEach((a) => {
    const k = dayKey(a.date);
    // mantem a atividade mais recente do dia (lista ja vem por data desc)
    if (!map.has(k)) map.set(k, a);
  });

  const out = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const k = dayKey(d);
    out.push({
      key: k,
      date: d,
      isToday: i === 0,
      activity: map.get(k) || null
    });
  }
  return out;
};

const WeekStories = ({
  activities = [],
  user,
  trainedToday = false,
  showCount = true
}) => {
  const days = buildWindow(activities);
  const count = days.filter((d) => d.activity).length;
  const initial = (user?.name || '?').slice(0, 1).toUpperCase();

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-1 px-1">
        {days.map((d, i) => {
          const letterIdx = d.date.getDay(); // 0..6 Sun..Sat
          const letter = DAY_LETTERS[letterIdx];
          const isWeekend = letterIdx === 0 || letterIdx === 6;
          const trained = !!d.activity;

          // Classes do circulo
          const base =
            'relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden text-sm font-extrabold';
          let ring = '';
          if (d.isToday) {
            ring = trainedToday
              ? 'border-2 border-[#2ec27a] shadow-[0_0_0_3px_rgba(46,194,122,0.18),0_0_12px_rgba(46,194,122,0.45)]'
              : 'border-2 border-[#ff6b4a] shadow-[0_0_0_3px_rgba(255,107,74,0.18),0_0_12px_rgba(255,107,74,0.45)]';
          } else if (trained) {
            ring =
              'border-2 border-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.5)]';
          } else {
            ring = 'border-2 border-dashed border-white/10';
          }
          const bg = trained
            ? 'bg-gradient-to-br from-[#1a1a1a] to-black'
            : 'bg-[#1a1a1a]';

          // Conteudo interno: foto do treino, foto do perfil ou inicial.
          const photo = d.activity?.photo || (trained ? user?.photo : null);

          return (
            <div
              key={d.key}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 rounded-xl ${
                d.isToday
                  ? trainedToday
                    ? 'bg-[#2ec27a]/8'
                    : 'bg-[#ff6b4a]/8'
                  : ''
              }`}
            >
              <div className={`${base} ${bg} ${ring}`}>
                {trained && photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : trained ? (
                  <span className="text-white">{initial}</span>
                ) : (
                  <span
                    className="text-white/50"
                    style={{ filter: d.isToday ? 'none' : 'blur(3px)', opacity: d.isToday ? 0.9 : 0.5 }}
                  >
                    {letter}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold tracking-wide leading-none ${
                  d.isToday
                    ? trainedToday
                      ? 'text-[#2ec27a]'
                      : 'text-white'
                    : isWeekend
                    ? 'text-[#8b5cf6]'
                    : 'text-gray-500'
                }`}
              >
                {letter}
              </span>
            </div>
          );
        })}
      </div>
      {showCount && (
        <div className="text-center text-xs text-gray-400 mt-2">
          {count}x esta semana
        </div>
      )}
    </div>
  );
};

export default WeekStories;
