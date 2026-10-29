import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, ChevronDown, ChevronRight, Users, List, X, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import FriendsFeed from '@/components/home/FriendsFeed';
import NotificationBell from '@/components/NotificationBell';
import { characters } from '@/data/characters';

// Chips contextuais ao estado do amigo. Preenchem o campo de mensagem;
// o envio é sempre um único botão (sem atalho que dispara direto).
const QUICK_BY_STATE = {
  sumido: ['tô sentindo sua falta', 'bora amanhã?', 'te espero no treino'],
  alta: ['monstro', 'tá voando', 'quero essa energia'],
  ok: ['bora treinar', 'tô contigo', 'vamo junto']
};

// Classifica o amigo em "em alta" / "sumido" / "ok" a partir do que o
// characters.js já carrega (semana + streak + flag inactive).
const classifyFriend = (f) => {
  const weekCount = (f.week || []).filter(Boolean).length;
  if (f.activity?.inactive || (f.streak === 0 && weekCount <= 1)) return 'sumido';
  if (f.streak >= 7 || weekCount >= 3) return 'alta';
  return 'ok';
};

// Quantos dias desde o último treino, lendo o `month` de 30 posições (29 = hoje).
// Retorna null quando não há dado suficiente, Infinity quando não treinou no mês.
const daysSinceLastWorkout = (f) => {
  const month = f.month || [];
  if (!month.length) return null;
  for (let i = month.length - 1; i >= 0; i--) {
    if (month[i]) return month.length - 1 - i;
  }
  return Infinity;
};

// Lê o perfil salvo de um personagem (foto/moldura editadas), se houver.
const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

const readNotifications = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`dojoNotifications_${userId}`) || '[]');
  } catch {
    return [];
  }
};

const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sheetFriend, setSheetFriend] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [view, setView] = useState('feed');
  const [menuOpen, setMenuOpen] = useState(false);
  const [incentiveTab, setIncentiveTab] = useState('empurrao'); // 'empurrao' | 'alta'
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [menuOpen]);

  const friends = useMemo(
    () => characters.filter((c) => c.id !== user?.id).map(mergeSaved),
    [user?.id]
  );

  // Classifica e separa amigos pelas duas pills.
  const { sumidos, emAlta } = useMemo(() => {
    const buckets = { sumidos: [], emAlta: [], ok: [] };
    friends.forEach((f) => {
      const state = classifyFriend(f);
      if (state === 'sumido') buckets.sumidos.push({ ...f, _state: state });
      else if (state === 'alta') buckets.emAlta.push({ ...f, _state: state });
      else buckets.ok.push({ ...f, _state: state });
    });
    // Sumidos: mais tempo sumido primeiro. Em alta: streak maior primeiro.
    buckets.sumidos.sort((a, b) => daysSinceLastWorkout(b) - daysSinceLastWorkout(a));
    buckets.emAlta.sort((a, b) => b.streak - a.streak);
    return buckets;
  }, [friends]);

  const incentiveList = incentiveTab === 'empurrao' ? sumidos : emAlta;

  const sheetState = sheetFriend ? sheetFriend._state || classifyFriend(sheetFriend) : 'ok';

  const sendIncentive = (friend, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const notif = {
      from: user?.name || 'Alguém',
      fromId: user?.id,
      item: 'Incentivo',
      message: trimmed,
      date: new Date().toISOString()
    };
    const key = `dojoNotifications_${friend.id}`;
    const current = readNotifications(friend.id);
    localStorage.setItem(key, JSON.stringify([notif, ...current]));
    toast({
      title: `Enviado para ${friend.name}`,
      description: `"${trimmed}"`
    });
  };

  const openSheet = (friend) => {
    setSheetFriend(friend);
    setCustomMessage('');
  };

  const closeSheet = () => {
    setSheetFriend(null);
    setCustomMessage('');
  };

  const handleSend = () => {
    if (!sheetFriend) return;
    sendIncentive(sheetFriend, customMessage);
    closeSheet();
  };

  const options = [
    { id: 'feed', label: 'Amigos', icon: Users },
    { id: 'list', label: 'Lista de amigos', icon: List }
  ];
  const current = options.find((o) => o.id === view) || options[0];

  const choose = (id) => {
    setView(id);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen pb-28 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <NotificationBell>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xl font-extrabold tracking-tight hover:opacity-80"
            >
              <span>{current.label}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-2 min-w-[200px] rounded-xl bg-[#141414] border border-white/10 shadow-2xl overflow-hidden z-20"
                >
                  {options.map((o) => {
                    const Icon = o.icon;
                    const active = o.id === view;
                    return (
                      <button
                        key={o.id}
                        onClick={() => choose(o.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-left transition-colors ${
                          active
                            ? 'bg-white/5 text-white'
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {o.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </NotificationBell>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {view === 'feed' ? (
              <>
                <FriendsFeed />

                <div>
                  <div className="flex items-center justify-between px-2 pb-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                      Incentivar amigos
                    </div>
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-white/5 border border-white/10">
                      {[
                        { id: 'empurrao', label: `Empurrão${sumidos.length ? ` · ${sumidos.length}` : ''}`, accent: 'text-amber-300' },
                        { id: 'alta', label: `Em alta${emAlta.length ? ` · ${emAlta.length}` : ''}`, accent: 'text-emerald-300' }
                      ].map((t) => {
                        const active = incentiveTab === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setIncentiveTab(t.id)}
                            className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide transition-colors ${
                              active
                                ? `bg-white/10 ${t.accent}`
                                : 'text-white/45 hover:text-white/70'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[18px] bg-[#141414] border border-white/10 overflow-hidden">
                    {incentiveList.length === 0 ? (
                      <div className="px-4 py-6 text-center text-[12px] text-white/45 font-medium">
                        {incentiveTab === 'empurrao'
                          ? 'ninguém sumido agora · grupo tá treinando'
                          : 'ninguém em maratona esta semana'}
                      </div>
                    ) : (
                      incentiveList.map((friend, idx) => {
                        const isLast = idx === incentiveList.length - 1;
                        const days = daysSinceLastWorkout(friend);
                        let dotColor = '';
                        let dotIcon = null;
                        let subLabel = friend.activity?.headline || friend.modality;
                        if (friend._state === 'sumido') {
                          if (days === Infinity || (days != null && days >= 30)) {
                            dotColor = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]';
                            dotIcon = <Clock className="w-2.5 h-2.5 text-black" />;
                            subLabel = days === Infinity ? 'sem treino no mês' : `sumido há ${days}d`;
                          } else if (days != null && days >= 14) {
                            dotColor = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]';
                            subLabel = `sumido há ${days}d`;
                          } else {
                            dotColor = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]';
                            subLabel = days != null ? `sumido há ${days}d` : 'inativo';
                          }
                        } else if (friend._state === 'alta') {
                          dotColor =
                            friend.streak >= 14
                              ? 'bg-[#d4af37] shadow-[0_0_6px_rgba(212,175,55,0.6)]'
                              : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]';
                          subLabel =
                            friend.streak >= 7
                              ? `${friend.streak} dias de hit`
                              : `${(friend.week || []).filter(Boolean).length}/7 na semana`;
                        }
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => openSheet(friend)}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-white/[0.03] transition-colors ${
                              !isLast ? 'border-b border-white/10' : ''
                            }`}
                          >
                            <div className="relative flex-shrink-0">
                              <ShieldProfile
                                type={friend.frame}
                                emblem={friend.emblem}
                                hit={friend.streak}
                                size="small"
                                photo={friend.photo}
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#141414] flex items-center justify-center ${dotColor}`}
                              >
                                {dotIcon}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold tracking-tight text-white truncate">
                                {friend.name}
                              </div>
                              <div
                                className={`text-[11.5px] font-medium truncate ${
                                  friend._state === 'sumido'
                                    ? days != null && days >= 14
                                      ? 'text-rose-300/80'
                                      : 'text-amber-200/80'
                                    : friend._state === 'alta'
                                    ? friend.streak >= 14
                                      ? 'text-[#d4af37]/90'
                                      : 'text-emerald-300/80'
                                    : 'text-white/55'
                                }`}
                              >
                                {subLabel}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="dojo-card divide-y divide-white/5 overflow-hidden">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => navigate(`/athlete/${friend.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <ShieldProfile
                      type={friend.frame}
                      emblem={friend.emblem}
                      hit={friend.streak}
                      size="small"
                      photo={friend.photo}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{friend.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {friend.modality}
                        {friend.activity?.headline ? ` · ${friend.activity.headline}` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {sheetFriend && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[65]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[22px] bg-[#141414] border-t border-[#ff6b4a]/30 px-5 pt-5 pb-[calc(96px+env(safe-area-inset-bottom,0px))] max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-3">
                <ShieldProfile
                  type={sheetFriend.frame}
                  emblem={sheetFriend.emblem}
                  hit={sheetFriend.streak}
                  size="small"
                  photo={sheetFriend.photo}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-extrabold tracking-tight text-white truncate">
                    {sheetFriend.name}
                  </div>
                  <div className={`text-xs truncate ${sheetFriend.activity?.inactive ? 'text-white/40' : 'text-white/55'}`}>
                    {sheetFriend.activity?.headline || sheetFriend.modality}
                  </div>
                </div>
                <button
                  onClick={closeSheet}
                  className="p-1.5 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={
                    sheetState === 'sumido'
                      ? 'Puxa ele pro treino...'
                      : sheetState === 'alta'
                      ? 'Celebra a maratona...'
                      : 'Escreva uma mensagem...'
                  }
                  rows={3}
                  maxLength={240}
                  autoFocus
                  className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:border-[#ff6b4a] focus:outline-none text-sm resize-none"
                />

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">
                    sugestões
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_BY_STATE[sheetState].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMessage(m)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/15 bg-white/5 text-gray-200 hover:border-[#ff6b4a] hover:text-[#ff8e75] transition-colors"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!customMessage.trim()}
                  className="w-full py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-opacity bg-gradient-to-br from-[#ff6b4a] to-[#ff4d2e] text-white shadow-[0_10px_24px_rgba(255,77,46,0.4)] disabled:opacity-40 disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                  Enviar para {sheetFriend.name}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;
