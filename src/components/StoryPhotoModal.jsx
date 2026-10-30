import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { relativeTime } from '@/lib/time';

// Full-screen modal pra foto de treino. Esc ou tap fora fecha.
// Caption curta: sport · duration · mood (quando houver).
//
// activity: { date, sport, durationMin, mood, comment, photo }
// user: { name, photo, frame?, emblem? }
// header: label do dia (ex: "sex, 24 out"). Opcional — se não vier,
//   usa relativeTime(activity.date).

const StoryPhotoModal = ({ activity, user, header, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const photo = activity?.photo || null;
  const captionParts = [];
  if (activity?.sport) captionParts.push(activity.sport);
  if (activity?.durationMin) captionParts.push(`${activity.durationMin} min`);
  if (activity?.mood) captionParts.push(activity.mood);
  const caption = captionParts.join(' · ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[80] bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center gap-2.5 px-3 pt-5 pb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black/40 flex items-center justify-center">
          {user?.photo ? (
            <img src={user.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-bold">
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold leading-tight drop-shadow">
            {user?.name || 'Você'}
          </div>
          <div className="text-white/70 text-[11px] leading-tight drop-shadow">
            {header || (activity?.date ? relativeTime(activity.date) : '')}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Foto grande */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex-1 flex items-center justify-center px-2 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {photo ? (
          <img
            src={photo}
            alt="Treino"
            className="max-h-[78vh] max-w-full object-contain rounded-xl"
          />
        ) : (
          <div className="text-white/60 text-sm text-center px-6">
            treino registrado nesse dia · sem foto
          </div>
        )}
      </motion.div>

      {/* Caption */}
      {(caption || activity?.comment) && (
        <div className="relative z-10 px-5 pb-7 text-center space-y-1">
          {caption && (
            <div className="text-white/85 text-sm font-semibold tracking-tight drop-shadow">
              {caption}
            </div>
          )}
          {activity?.comment && (
            <div className="text-white/70 text-[13px] font-medium drop-shadow">
              {activity.comment}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StoryPhotoModal;
