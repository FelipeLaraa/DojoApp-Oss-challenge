import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';

const MILESTONES = [7, 14, 30, 50, 100, 365];

const nextMilestone = (days) => {
  for (const m of MILESTONES) if (m > days) return m;
  return null;
};

// Mostra o marco mais recente do mês entre os amigos. Esconde se não houver.
const MilestoneCard = ({ friends = [] }) => {
  const navigate = useNavigate();
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  const recent = friends
    .filter((f) => f.milestone?.hitAt)
    .filter((f) => now - new Date(f.milestone.hitAt).getTime() <= THIRTY_DAYS)
    .sort((a, b) => new Date(b.milestone.hitAt) - new Date(a.milestone.hitAt))[0];

  if (!recent) return null;

  const next = nextMilestone(recent.milestone.days);

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35 px-2 pb-2.5 flex items-center gap-2">
        Marco de hoje
        <span className="text-[9px] text-[#ff6b4a] bg-[#ff6b4a]/10 px-1.5 py-0.5 rounded-full tracking-wider">
          NOVO
        </span>
      </div>
      <button
        onClick={() => navigate(`/athlete/${recent.id}`)}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left bg-gradient-to-br from-[#ff6b4a]/15 to-[#ff4d2e]/5 border border-[#ff6b4a]/30"
      >
        <div className="w-[38px] h-[38px] rounded-full flex-shrink-0 bg-gradient-to-br from-[#ff6b4a] to-[#ff4d2e] flex items-center justify-center shadow-[0_6px_14px_rgba(255,77,46,0.35)]">
          <Flame className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <div className="text-sm font-extrabold tracking-tight">
            {recent.name} bateu {recent.milestone.days} dias de sequência
          </div>
          <div className="text-[11.5px] text-white/55 mt-0.5">
            {next ? `próximo marco: ${next} dias · ` : ''}toque pra incentivar
          </div>
        </div>
      </button>
    </div>
  );
};

export default MilestoneCard;
