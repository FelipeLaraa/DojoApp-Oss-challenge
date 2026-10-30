import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ShieldProfile from '@/components/ShieldProfile';
import StoryPhotoModal from '@/components/StoryPhotoModal';
import { useAuth } from '@/contexts/AuthContext';

// Deriva estado visual do story a partir de streak + atividade.
// cold: streak===0 ou inativo. hot: streak>=7. warm: entre os dois.
const stateOf = (friend) => {
  if (friend.activity?.inactive || !friend.streak) return 'cold';
  if (friend.streak >= 7) return 'hot';
  return 'warm';
};

const stateLabel = (friend, state) => {
  // Se tem mood no último treino, o label do story vira "saiu <mood>" —
  // Felipe: mood tem que aparecer no feed. Esta é a camada que não duplica.
  const mood = friend.lastPhoto?.mood;
  if (mood) return `saiu ${mood}`;
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

const viewedKey = (uid) => `dojoStoryViewed_${uid || 'anon'}`;

const readViewed = (uid) => {
  try {
    const raw = localStorage.getItem(viewedKey(uid));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeViewed = (uid, data) => {
  try {
    localStorage.setItem(viewedKey(uid), JSON.stringify(data));
  } catch {
    /* storage cheio — ignora */
  }
};

// Converte characters[].lastPhoto no shape de activity que StoryPhotoModal lê.
const lastPhotoToActivity = (friend) => {
  const p = friend.lastPhoto;
  if (!p) return null;
  return {
    date: p.postedAt,
    sport: p.sport || null,
    durationMin: p.durationMin || null,
    mood: p.mood || null,
    comment: p.comment || null,
    photo: p.url
  };
};

const FriendsStories = ({ friends = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewed, setViewed] = useState(() => readViewed(user?.id));
  const [openFriend, setOpenFriend] = useState(null);

  useEffect(() => {
    setViewed(readViewed(user?.id));
  }, [user?.id]);

  // Regra Felipe: sem story (foto do último treino), não entra no carrossel.
  // Quem treinou hoje tem lastPhoto; quem sumiu, não. Carrossel vira sinal real.
  const withStory = friends.filter((f) => f.lastPhoto?.url);

  if (!withStory.length) return null;

  const isViewed = (f) => {
    const seen = viewed[f.id];
    const posted = f.lastPhoto?.postedAt;
    return seen && posted && seen >= posted;
  };

  const openStory = (f) => {
    const next = { ...viewed, [f.id]: f.lastPhoto.postedAt };
    setViewed(next);
    writeViewed(user?.id, next);
    setOpenFriend(f);
  };

  return (
    <>
      <div className="flex gap-3.5 overflow-x-auto py-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {withStory.map((f) => {
          const state = stateOf(f);
          const viewedNow = isViewed(f);
          return (
            <button
              key={f.id}
              onClick={() => openStory(f)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className={`w-[66px] h-[66px] rounded-full flex items-center justify-center ${
                  viewedNow ? 'p-[3px] bg-white/15 opacity-60' : ringClass[state]
                }`}
              >
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center overflow-hidden ${
                    state === 'cold' ? 'opacity-70' : ''
                  }`}
                >
                  {f.lastPhoto?.url ? (
                    <img
                      src={f.lastPhoto.url}
                      alt=""
                      className={`w-full h-full object-cover ${state === 'cold' ? 'blur-[1px]' : ''}`}
                    />
                  ) : (
                    <div className={state === 'cold' ? 'blur-[1px]' : ''}>
                      <ShieldProfile
                        type={f.frame}
                        emblem={f.emblem}
                        size="small"
                        photo={f.photo}
                      />
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`text-[12px] font-bold leading-none ${
                  state === 'cold' ? 'text-white/55' : 'text-white'
                }`}
              >
                {f.name}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider leading-none ${
                  viewedNow ? 'text-white/35' : stateColor[state]
                }`}
              >
                {stateLabel(f, state)}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {openFriend && (
          <StoryPhotoModal
            activity={lastPhotoToActivity(openFriend)}
            user={{ name: openFriend.name, photo: openFriend.photo }}
            onClose={() => setOpenFriend(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FriendsStories;
