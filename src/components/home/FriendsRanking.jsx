import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Conta treinos da última semana (índices 23..29 do array month[30]).
const weekCount = (month = []) => {
  if (month.length < 7) return 0;
  return month.slice(-7).filter(Boolean).length;
};

// Agrupa 30 dias em 4 "semanas" visuais: 7+7+7+9.
const groupMonth = (month = []) => {
  const safe = Array.from({ length: 30 }, (_, i) => !!month[i]);
  return [safe.slice(0, 7), safe.slice(7, 14), safe.slice(14, 21), safe.slice(21, 30)];
};

const posClass = ['text-[#d4af37]', 'text-[#d7d7d7]', 'text-[#c67a3d]'];

const avaBgByColor = {
  gold: 'bg-gradient-to-br from-[#d4af37] to-[#8b6f1f] border-[#d4af37]',
  coral: 'bg-gradient-to-br from-[#ff7a59] to-[#f4502f] border-[#ff6b4a]',
  gray: 'bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] border-white/10 text-white/40'
};

const colorFor = (friend, pos) => {
  if (friend.activity?.inactive || !friend.streak) return 'gray';
  if (pos === 0) return 'gold';
  return 'coral';
};

const Dot = ({ on, highlight }) => {
  if (!on) return <span className="w-[3.5px] h-[3.5px] rounded-full bg-white/10 flex-shrink-0" />;
  if (highlight) {
    return <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#2ec27a] shadow-[0_0_3px_rgba(46,194,122,0.5)] flex-shrink-0" />;
  }
  return <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#ff6b4a] shadow-[0_0_3px_rgba(255,107,74,0.6)] flex-shrink-0" />;
};

const FriendsRanking = ({ friends = [] }) => {
  const navigate = useNavigate();
  const sorted = [...friends].sort((a, b) => weekCount(b.month) - weekCount(a.month));

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/ranking')}
        className="w-full px-2 pb-2.5 flex items-center justify-between text-left group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35 group-hover:text-white/55 transition-colors">
          Top do mês
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/55 group-hover:text-white transition-colors">
          Ver tudo
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </button>
      <div className="rounded-[18px] bg-[#141414] border border-white/10 overflow-hidden">
        {sorted.map((f, pos) => {
          const color = colorFor(f, pos);
          const weeks = groupMonth(f.month);
          const wc = weekCount(f.month);
          const isLast = pos === sorted.length - 1;
          return (
            <button
              key={f.id}
              onClick={() => navigate(`/athlete/${f.id}`)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3.5 text-left ${!isLast ? 'border-b border-white/10' : ''}`}
            >
              <div className={`w-[18px] text-center text-[13px] font-black ${posClass[pos] || 'text-white/55'}`}>
                {pos + 1}
              </div>
              <div className={`w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white border-[1.5px] ${avaBgByColor[color]}`}>
                {f.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-bold tracking-tight leading-none ${color === 'gray' ? 'text-white/55' : 'text-white'}`}>
                  {f.name}
                </div>
                <div className="mt-2 flex items-center gap-[3px]">
                  {weeks.map((week, wi) => (
                    <div key={wi} className={`flex gap-[1.5px] ${wi > 0 ? 'ml-[3px]' : ''}`}>
                      {week.map((on, di) => {
                        // destaca o último "on" da série (hoje) em verde
                        const isToday = wi === 3 && di === week.length - 1;
                        return <Dot key={di} on={on} highlight={isToday && on} />;
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className={`text-[15px] font-extrabold tracking-tight ${color === 'gray' ? 'text-white/55' : 'text-white'}`}>
                  {wc}x
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-white/35">
                  semana
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsRanking;
