import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Dumbbell } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ShieldProfile from '@/components/ShieldProfile';
import WeekStrip from '@/components/WeekStrip';
import { characters } from '@/data/characters';
import {
  reactionCounts,
  bumpReaction,
  sentToday,
  canReact,
  recordSent,
  LIMITS,
} from '@/lib/reactions';

// Recência fictícia por enquanto — vira real quando houver registro de treino.
const recency = { nicole: 'há 3 h', thiago: 'há 1 dia', felipe: 'há 6 h', ciclano: 'há 5 dias' };

// 3 reações de incentivo (1 toque).
const REACTIONS = [
  { id: 'Fogo', label: 'Fogo', icon: Flame, color: 'text-orange-400' },
  { id: 'Força', label: 'Força', icon: Dumbbell, color: 'text-red-400' },
  { id: 'Cutucar', label: 'Cutucar', icon: Zap, color: 'text-yellow-400' },
];

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

const ReactionRow = ({ onReact, counts, sent }) => (
  <div className="flex gap-2 mt-3">
    {REACTIONS.map((r) => {
      const maxed = (sent?.[r.id] ?? 0) >= LIMITS[r.id];
      return (
        <button
          key={r.id}
          onClick={() => onReact(r.id)}
          disabled={maxed}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border transition-all text-sm ${
            maxed
              ? 'border-gray-800 opacity-40 cursor-not-allowed'
              : 'border-gray-700 hover:border-red-500 hover:bg-white/5'
          }`}
        >
          <r.icon className={`w-4 h-4 ${r.color}`} />
          {r.label}
          {counts && <span className="text-xs text-gray-400">{counts[r.id] ?? 0}</span>}
        </button>
      );
    })}
  </div>
);

// "Precisa de um empurrão" + "Atividade dos amigos" + reactions.
// Visual unchanged in this etapa.
const FriendsFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, force] = useState(0);

  const friends = characters.filter((c) => c.id !== user?.id).map(mergeSaved);
  const inactive = friends.filter((f) => f.activity?.inactive);
  const active = friends.filter((f) => !f.activity?.inactive);

  const sendTo = (targetId, targetName, item, message = '') => {
    if (!targetId) return;
    try {
      const key = `dojoNotifications_${targetId}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const notif = {
        from: user?.name || 'Alguém',
        fromId: user?.id,
        item,
        message,
        date: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([notif, ...current]));
    } catch {}
    toast({
      title: `Enviado para ${targetName}!`,
      description: message ? `${item}: "${message}"` : item,
    });
    force((n) => n + 1);
  };

  const sendQuick = (friend, item) => {
    if (!canReact(user?.id, friend.id, item)) {
      toast({ title: 'Limite de hoje atingido', description: 'Essa reação volta amanhã.' });
      return;
    }
    recordSent(user?.id, friend.id, item);
    bumpReaction(friend.id, item);
    sendTo(friend.id, friend.name, item);
  };

  return (
    <>
      {inactive.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Precisa de um empurrão
          </h3>
          {inactive.map((f) => (
            <div key={f.id} className="dojo-card p-4 border border-yellow-500/20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(`/athlete/${f.id}`)}>
                  <ShieldProfile type={f.frame} emblem={f.emblem} hit={f.streak} size="small" photo={f.photo} />
                </button>
                <div className="flex-1">
                  <h4 className="font-semibold">{f.name}</h4>
                  <p className="text-xs text-gray-500">{f.activity.detail} • {recency[f.id] || 'faz tempo'}</p>
                  <WeekStrip days={f.week} />
                </div>
              </div>
              <ReactionRow
                counts={reactionCounts(f)}
                sent={sentToday(user?.id, f.id)}
                onReact={(item) => sendQuick(f, item)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500" />
          Atividade dos amigos
        </h3>
        {active.map((f) => (
          <div key={f.id} className="dojo-card p-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/athlete/${f.id}`)}>
                <ShieldProfile type={f.frame} emblem={f.emblem} hit={f.streak} size="small" photo={f.photo} />
              </button>
              <div className="flex-1">
                <h4 className="font-semibold">
                  {f.name} <span className="text-red-400 font-normal">{f.activity?.headline}</span>
                </h4>
                <p className="text-xs text-gray-400">{f.activity?.detail} • {recency[f.id] || 'recente'}</p>
                <WeekStrip days={f.week} />
              </div>
            </div>
            <ReactionRow
              counts={reactionCounts(f)}
              sent={sentToday(user?.id, f.id)}
              onReact={(item) => sendQuick(f, item)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default FriendsFeed;
