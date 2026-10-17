import React, { useMemo, useState } from 'react';
import { ChevronUp, Flame } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { characters } from '@/data/characters';
import { relativeTime } from '@/lib/time';

// Resolve sender id. New notifications carry fromId; older ones only had name.
const senderIdOf = (n) =>
  n.fromId || characters.find((c) => c.name.toLowerCase() === (n.from || '').toLowerCase())?.id;

// Milestones get a special gold CTA. Detect by explicit type or by item label.
const isMilestone = (n) => n.type === 'milestone' || n.item === 'Marco';

// Panel visual follows the Nicole mockup: solid black card, no gradients, no
// animations. Static coral dot (with halo) marks unread; read items use neutral
// grey at 60% opacity. Segmented pill toggles between Novas and Todas.
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
    tab === 'new'
      ? 'Nada novo. Treine e seus amigos vão aparecer aqui.'
      : 'Nenhuma notificação ainda.';

  return (
    <div
      className="p-4 space-y-3 rounded-2xl"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-lg tracking-tight">Notificações</h3>
          {newCount > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              {newCount} {newCount === 1 ? 'nova' : 'novas'}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Retrair notificações"
          className="p-2 rounded-full hover:bg-white/5"
        >
          <ChevronUp className="w-5 h-5 text-gray-300" strokeWidth={2.5} />
        </button>
      </div>

      <div
        className="inline-flex rounded-full p-[3px] gap-[2px]"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={() => setTab('new')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            tab === 'new' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          {newCount > 0 ? `Novas · ${newCount}` : 'Novas'}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            tab === 'all' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Todas
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <div className="space-y-2.5">
          {list.map((n, i) => {
            const sid = senderIdOf(n);
            const fresh = isNew(n);
            const milestone = isMilestone(n);
            return (
              <div
                key={i}
                className={`relative text-sm rounded-xl p-3 flex gap-3 items-start ${
                  fresh ? '' : 'opacity-60'
                }`}
                style={
                  fresh
                    ? {
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.18)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }
                }
              >
                <div className="pt-1" style={{ width: 7 }}>
                  {fresh && (
                    <span
                      className="inline-block rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        background: '#ef4444',
                        boxShadow: '0 0 0 3px rgba(239,68,68,0.18)',
                      }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${fresh ? 'text-white' : 'text-gray-300'}`}>
                    <span className="font-bold">{n.from}</span> mandou{' '}
                    <span className="font-bold" style={{ color: '#ef4444' }}>
                      {n.item}
                    </span>
                  </div>
                  {n.message && (
                    <p className="text-xs text-gray-300 mt-1 italic">"{n.message}"</p>
                  )}
                  {n.date && (
                    <div className="text-[11px] text-gray-500 mt-0.5">{relativeTime(n.date)}</div>
                  )}

                  {sid && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {milestone && (
                        <button
                          onClick={() => sendTo(sid, n.from, 'Parabéns', '👏')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-black"
                          style={{ background: '#f5c542' }}
                        >
                          Mandar 👏
                        </button>
                      )}
                      <button
                        onClick={() => sendTo(sid, n.from, 'Fogo')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-white"
                      >
                        <Flame className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                        Devolver fogo
                      </button>
                      <button
                        onClick={() => {
                          setReplyIdx(replyIdx === i ? null : i);
                          setReplyText('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300"
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
                        className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none text-xs"
                      />
                      <button
                        onClick={() => {
                          if (!replyText.trim()) return;
                          sendTo(sid, n.from, 'Resposta', replyText.trim());
                          setReplyIdx(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-black"
                        style={{ background: '#ef4444', color: '#fff' }}
                      >
                        Enviar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
