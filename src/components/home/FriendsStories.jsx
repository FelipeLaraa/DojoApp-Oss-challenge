import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShieldProfile from '@/components/ShieldProfile';

// Deriva estado visual do story a partir de streak + atividade.
// cold: streak===0 ou inativo. hot: streak>=7. warm: entre os dois.
const stateOf = (friend) => {
  if (friend.activity?.inactive || !friend.streak) return 'cold';
  if (friend.streak >= 7) return 'hot';
  return 'warm';
};

const stateLabel = (friend, state) => {
  if (state === 'cold') return 'sumido';
  if (state === 'hot') return 'em alta';
  return 'ativo';
};

const ringClass = {
  hot: 'p-[3px] bg-[conic-gradient(from_140deg,#ff6b4a_0deg,#d4af37_180deg,#ff4d2e_300deg,#ff6b4a_360deg)] shadow-[0_0_18px_rgba(255,107,74,0.45)]',
  warm: 'p-[3px] bg-[conic-gradient(from_90deg,#2ec27a_0deg,#4ad395_180deg,#1b8a52_300deg,#2ec27a_360deg)] opacity-90',
  cold: 'p-[3px] bg-white/10'
};

const stateColor = {
  hot: 'text-[#ff6b4a]',
  warm: 'text-[#2ec27a]',
  cold: 'text-white/35'
};

const FriendsStories = ({ friends = [] }) => {
  const navigate = useNavigate();
  if (!friends.length) return null;

  return (
    <div className="flex gap-3.5 overflow-x-auto py-1 px-1" style={{ scrollbarWidth: 'none' }}>
      {friends.map((f) => {
        const state = stateOf(f);
        return (
          <button
            key={f.id}
            onClick={() => navigate(`/athlete/${f.id}`)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className={`w-[66px] h-[66px] rounded-full flex items-center justify-center ${ringClass[state]}`}>
              <div className={`w-full h-full rounded-full bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center overflow-hidden ${state === 'cold' ? 'opacity-70' : ''}`}>
                <div className={state === 'cold' ? 'blur-[1px]' : ''}>
                  <ShieldProfile
                    type={f.frame}
                    emblem={f.emblem}
                    size="small"
                    photo={f.photo}
                  />
                </div>
              </div>
            </div>
            <span className={`text-[12px] font-bold leading-none ${state === 'cold' ? 'text-white/55' : 'text-white'}`}>
              {f.name}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider leading-none ${stateColor[state]}`}>
              {stateLabel(f, state)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FriendsStories;
