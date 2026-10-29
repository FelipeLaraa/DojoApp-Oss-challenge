import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import ShieldProfile from '@/components/ShieldProfile';
import { useAuth } from '@/contexts/AuthContext';
import { relativeTime } from '@/lib/time';

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

const StoryModal = ({ friend, onClose }) => {
  const photo = friend.lastPhoto;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[80] bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Progress bar */}
      <div className="absolute top-2 left-3 right-3 h-0.5 bg-white/20 rounded-full overflow-hidden z-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          className="h-full bg-white"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2.5 px-3 pt-5 pb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black/40 flex items-center justify-center">
          <ShieldProfile
            type={friend.frame}
            emblem={friend.emblem}
            size="small"
            photo={friend.photo}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold leading-tight drop-shadow">
            {friend.name}
          </div>
          <div className="text-white/70 text-[11px] leading-tight drop-shadow">
            {photo?.postedAt ? relativeTime(photo.postedAt) : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
          aria-label="Fechar story"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Photo */}
      <div className="flex-1 flex items-center justify-center px-2 pb-6">
        {photo?.url ? (
          <img
            src={photo.url}
            alt={`Último treino de ${friend.name}`}
            className="max-h-[80vh] max-w-full object-contain rounded-xl"
          />
        ) : (
          <div className="text-white/60 text-sm">sem foto do último treino</div>
        )}
      </div>
    </motion.div>
  );
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
          <StoryModal friend={openFriend} onClose={() => setOpenFriend(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default FriendsStories;
