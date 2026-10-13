import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Plus, Zap, Dumbbell, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import ProgressBar from '@/components/ProgressBar';
import { characters } from '@/data/characters';
import { readActivities, computeStreak, weekTrained } from '@/lib/activity';
import { reactionCounts, bumpReaction } from '@/lib/reactions';

// Recência fictícia por enquanto — vira real quando houver registro de treino.
const recency = { nicole: 'há 3 h', thiago: 'há 1 dia', felipe: 'há 6 h', ciclano: 'há 5 dias' };

// 3 reações de incentivo (1 toque).
const REACTIONS = [
  { id: 'Fogo', label: 'Fogo', icon: Flame, color: 'text-orange-400' },
  { id: 'Força', label: 'Força', icon: Dumbbell, color: 'text-red-400' },
  { id: 'Cutucar', label: 'Cutucar', icon: Zap, color: 'text-yellow-400' }
];

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

// Tira de frequência dos últimos 7 dias (bolinhas) + contagem da semana.
// O último ponto é hoje (destacado).
const WeekStrip = ({ days = [] }) => {
  const count = days.filter(Boolean).length;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1">
        {days.map((d, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${d ? 'bg-orange-400' : 'bg-gray-700'} ${
              i === days.length - 1 ? 'ring-1 ring-white/50' : ''
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{count}x esta semana</span>
    </div>
  );
};

const ReactionRow = ({ onReact, counts }) => (
  <div className="flex gap-2 mt-3">
    {REACTIONS.map((r) => (
      <button
        key={r.id}
        onClick={() => onReact(r.id)}
        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-700 hover:border-red-500 hover:bg-white/5 transition-all text-sm"
      >
        <r.icon className={`w-4 h-4 ${r.color}`} />
        {r.label}
        {counts && <span className="text-xs text-gray-400">{counts[r.id] ?? 0}</span>}
      </button>
    ))}
  </div>
);

const StudentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, force] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  const seenKey = `dojoNotifSeen_${user?.id}`;
  const [lastSeen, setLastSeen] = useState(() => {
    try { return Number(localStorage.getItem(seenKey) || 0); } catch { return 0; }
  });

  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem(`dojoNotifications_${user?.id}`) || '[]'); } catch {}
  const unread = notifications.filter((n) => new Date(n.date).getTime() > lastSeen).length;

  const openNotif = () => {
    const now = Date.now();
    setShowNotif(true);
    setLastSeen(now);
    try { localStorage.setItem(seenKey, String(now)); } catch {}
  };

  const friends = characters.filter((c) => c.id !== user?.id).map(mergeSaved);
  const inactive = friends.filter((f) => f.activity?.inactive);
  const active = friends.filter((f) => !f.activity?.inactive);

  const [replyIdx, setReplyIdx] = useState(null);
  const [replyText, setReplyText] = useState('');

  const sendTo = (targetId, targetName, item, message = '') => {
    if (!targetId) return;
    try {
      const key = `dojoNotifications_${targetId}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const notif = { from: user?.name || 'Alguém', fromId: user?.id, item, message, date: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify([notif, ...current]));
    } catch {}
    toast({ title: `Enviado para ${targetName}!`, description: message ? `${item}: "${message}"` : item });
    force((n) => n + 1);
  };

  const sendQuick = (friend, item) => {
    bumpReaction(friend.id, item);
    sendTo(friend.id, friend.name, item);
  };

  // Resolve o id de quem mandou (notifs novas trazem fromId; antigas, pelo nome).
  const senderIdOf = (n) =>
    n.fromId || characters.find((c) => c.name.toLowerCase() === (n.from || '').toLowerCase())?.id;

  const myActivities = readActivities(user?.id);
  const streak = computeStreak(myActivities);
  const myWeek = weekTrained(myActivities);

  const handleRegister = () => navigate('/register');

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Topo com sininho */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Início</h1>
          <button
            onClick={() => (showNotif ? setShowNotif(false) : openNotif())}
            className="relative p-2 rounded-full hover:bg-white/5"
          >
            <Bell className="w-6 h-6" />
            {unread > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unread}
              </span>
            )}
          </button>
        </div>

        {/* Painel de notificações */}
        {showNotif && (
          <div className="dojo-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500" />
                Notificações
              </h3>
              <button onClick={() => setShowNotif(false)}>
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
                          onClick={() => { setReplyIdx(replyIdx === i ? null : i); setReplyText(''); }}
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
        )}

        {/* Seu resumo */}
        <div className="dojo-card p-4">
          <div className="flex items-center gap-4">
            <ShieldProfile type={user?.frame || 'black'} emblem={user?.emblem} hit={streak} size="small" photo={user?.photo} />
            <div className="flex-1">
              <h2 className="text-lg font-bold">Olá, {user?.name}!</h2>
              <p className="text-sm text-gray-400">{user?.mainSport || 'BJJ'}</p>
              <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
                <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`} />
                {streak > 0
                  ? `${streak} ${streak === 1 ? 'dia' : 'dias'} de sequência`
                  : 'Sem sequência ainda'}
              </p>
              <WeekStrip days={myWeek} />
            </div>
            <Button onClick={handleRegister} className="dojo-button flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Registrar
            </Button>
          </div>
          <div className="mt-4">
            <ProgressBar current={user?.progress || 20} max={user?.maxProgress || 60} label="aulas" />
          </div>
        </div>

        {/* Precisa de empurrão */}
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
                <ReactionRow counts={reactionCounts(f)} onReact={(item) => sendQuick(f, item)} />
              </div>
            ))}
          </div>
        )}

        {/* Feed de atividade */}
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
              <ReactionRow counts={reactionCounts(f)} onReact={(item) => sendQuick(f, item)} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentHome;
