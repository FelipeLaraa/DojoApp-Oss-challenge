import React, { useState } from 'react';
import { Bell, X, Flame } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { characters } from '@/data/characters';

// Resolve sender id. New notifications carry fromId; older ones only had name.
const senderIdOf = (n) =>
  n.fromId || characters.find((c) => c.name.toLowerCase() === (n.from || '').toLowerCase())?.id;

// Lists received notifications and lets the user reply or send fire back.
// Owns its own reply draft state. Writes to localStorage directly, same as
// before — no backend involved.
const NotificationPanel = ({ notifications, onClose, onChange }) => {
  const { user } = useAuth();
  const [replyIdx, setReplyIdx] = useState(null);
  const [replyText, setReplyText] = useState('');

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

  return (
    <div className="dojo-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-500" />
          Notificações
        </h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400">Nada por aqui ainda. Treine e incentive!</p>
      ) : (
        notifications.map((n, i) => {
          const sid = senderIdOf(n);
          return (
            <div key={i} className="text-sm bg-white/5 rounded-lg p-3">
              <span className="font-medium">{n.from}</span> mandou{' '}
              <span className="text-red-400">{n.item}</span>
              {n.message && <p className="text-gray-300 mt-1">"{n.message}"</p>}

              {sid && (
                <div className="flex gap-2 mt-2">
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
