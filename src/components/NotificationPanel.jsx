import React, { useMemo, useState } from 'react';
import { ChevronUp, Flame } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { characters } from '@/data/characters';

// Resolve sender id. New notifications carry fromId; older ones only had name.
const senderIdOf = (n) =>
  n.fromId || characters.find((c) => c.name.toLowerCase() === (n.from || '').toLowerCase())?.id;

// Milestones get a special gold CTA. Detect by explicit type or by item label.
const isMilestone = (n) => n.type === 'milestone' || n.item === 'Marco';

// Lists received notifications and lets the user reply or send fire back.
// Owns its own reply draft state. Writes to localStorage directly, same as
// before — no backend involved.
//
// `seenAt` is the lastSeen timestamp captured BEFORE the panel opened: any
// notification newer than that counts as "new" in this session.
const NotificationPanel = ({ notifications, seenAt = 0, onClose, onChange }) => {
  const { user } = useAuth();
  const [replyIdx, setReplyIdx] = useState(null);
  const [replyText, setReplyText] = useState('');

  const isNew = (n) => new Date(n.date).getTime() > seenAt;
  const newCount = useMemo(
    () => notifications.filter(isNew).length,
    [notifications, seenAt]
  );

  // If there is nothing new, default to the full list so the panel isn't empty.
  const [tab, setTab] = useState(newCount > 0 ? 'new' : 'all');

  const list = useMemo(
    () => (tab === 'new' ? notifications.filter(isNew) : notifications),
    [tab, notifications, seenAt]
  );

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
    onChange?.();
  };

  const emptyMessage =
    tab === 'new' ? 'Sem novidades. Treine e incentive.' : 'Nenhuma notificação ainda.';

  return (
    <div className="dojo-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Notificações</h3>
          {newCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
              {newCount} {newCount === 1 ? 'nova' : 'novas'}
            </span>
          )}
        </div>
        <button onClick={onClose} aria-label="Retrair notificações">
          <ChevronUp className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      <div className="inline-flex rounded-full bg-white/5 p-1 text-xs">
        <button
          onClick={() => setTab('new')}
          className={`px-3 py-1 rounded-full font-semibold transition-colors ${
            tab === 'new' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          {newCount > 0 ? `Novas · ${newCount}` : 'Novas'}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-3 py-1 rounded-full font-semibold transition-colors ${
            tab === 'all' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Todas
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        list.map((n, i) => {
          const sid = senderIdOf(n);
          const fresh = isNew(n);
          const milestone = isMilestone(n);
          return (
            <div
              key={i}
              className={`relative text-sm rounded-lg p-3 pl-4 border ${
                fresh
                  ? 'bg-[#ff6b4a]/[0.06] border-[#ff6b4a]/25'
                  : 'bg-white/[0.03] border-white/5 opacity-60'
              }`}
            >
              {fresh && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-[#ff6b4a] opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#ff6b4a]" />
                </span>
              )}
              <span className="font-medium">{n.from}</span> mandou{' '}
              <span className="text-red-400">{n.item}</span>
              {n.message && <p className="text-gray-300 mt-1">"{n.message}"</p>}

              {sid && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {milestone && (
                    <button
                      onClick={() => sendTo(sid, n.from, 'Parabéns', '👏')}
                      className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold hover:bg-amber-500/25"
                    >
                      Mandar 👏
                    </button>
                  )}
                  <button
                    onClick={() => sendTo(sid, n.from, 'Fogo')}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-700 hover:border-red-500 text-xs"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Devolver fogo
                  </button>
                  <button
                    onClick={() => {
                      setReplyIdx(replyIdx === i ? null : i);
                      setReplyText('');
                    }}
                    className="px-2 py-1 rounded-lg border border-gray-700 hover:border-red-500 text-xs"
                  >
                    Responder
                  </button>
                </div>
              )}

              {replyIdx === i && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Responder..."
                    className="flex-1 p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!replyText.trim()) return;
                      sendTo(sid, n.from, 'Resposta', replyText.trim());
                      setReplyIdx(null);
                      setReplyText('');
                    }}
                    className="px-3 py-1 rounded-lg dojo-button text-xs"
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationPanel;
