import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, ChevronDown, Users, List, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import FriendsFeed from '@/components/home/FriendsFeed';
import NotificationBell from '@/components/NotificationBell';
import { characters } from '@/data/characters';

const QUICK_MESSAGES = ['bora treinar', 'tô contigo', 'cadê você?', 'você consegue', 'vamo!'];

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
  const [customOpen, setCustomOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [view, setView] = useState('feed');
  const [menuOpen, setMenuOpen] = useState(false);
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

  const friends = characters
    .filter((c) => c.id !== user?.id)
    .map(mergeSaved);

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
      title: `Enviado para ${friend.name}!`,
      description: `"${trimmed}"`
    });
  };

  const sendQuick = (friend, message) => {
    sendIncentive(friend, message);
    closeSheet();
  };

  const sendCustom = (friend) => {
    sendIncentive(friend, customMessage);
    closeSheet();
  };

  const openSheet = (friend) => {
    setSheetFriend(friend);
    setCustomOpen(false);
    setCustomMessage('');
  };

  const closeSheet = () => {
    setSheetFriend(null);
    setCustomOpen(false);
    setCustomMessage('');
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
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35 px-2 pb-2.5">
                    Incentivar amigos
                  </div>
                  <div className="rounded-[18px] bg-[#141414] border border-white/10 overflow-hidden">
                    {friends.map((friend, idx) => {
                      const inactive = !!friend.activity?.inactive;
                      const isLast = idx === friends.length - 1;
                      return (
                        <div
                          key={friend.id}
                          className={`flex items-center gap-3 px-3.5 py-3 ${!isLast ? 'border-b border-white/10' : ''}`}
                        >
                          <button
                            onClick={() => openSheet(friend)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          >
                            <ShieldProfile
                              type={friend.frame}
                              emblem={friend.emblem}
                              hit={friend.streak}
                              size="small"
                              photo={friend.photo}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold tracking-tight text-white truncate">
                                {friend.name}
                              </div>
                              <div className={`text-xs truncate ${inactive ? 'text-white/40' : 'text-white/55'}`}>
                                {friend.activity?.headline || friend.modality}
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => openSheet(friend)}
                            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#ff6b4a]/40 bg-[#ff6b4a]/10 text-[#ff8e75] hover:bg-[#ff6b4a]/20 transition-colors"
                          >
                            Incentivar
                          </button>
                        </div>
                      );
                    })}
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[22px] bg-[#141414] border-t border-[#ff6b4a]/30 p-5 pb-8 max-h-[88vh] overflow-y-auto"
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

              <div className="mt-5 flex flex-wrap gap-2">
                {QUICK_MESSAGES.map((m) => (
                  <button
                    key={m}
                    onClick={() => sendQuick(sheetFriend, m)}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold border border-white/15 bg-white/5 text-gray-200 hover:border-[#ff6b4a] hover:text-[#ff8e75] transition-colors"
                  >
                    {m}
                  </button>
                ))}
                <button
                  onClick={() => setCustomOpen((v) => !v)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold border flex items-center gap-1 transition-colors ${
                    customOpen
                      ? 'border-[#ff6b4a] bg-[#ff6b4a]/10 text-[#ff8e75]'
                      : 'border-white/15 bg-white/5 text-gray-200 hover:border-[#ff6b4a] hover:text-[#ff8e75]'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  mensagem
                </button>
              </div>

              {customOpen && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Escreva uma mensagem..."
                    rows={3}
                    autoFocus
                    className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:border-[#ff6b4a] focus:outline-none text-sm resize-none"
                  />
                  <Button
                    onClick={() => sendCustom(sheetFriend)}
                    className="w-full dojo-button flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar para {sheetFriend.name}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;
