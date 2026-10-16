import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, Gift, Bell, ChevronDown, Users, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import FriendsFeed from '@/components/home/FriendsFeed';
import { characters } from '@/data/characters';

const ITEMS = ['Carbo gel', 'Cutucada', 'Água', 'Parabéns'];

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
  const [notifications, setNotifications] = useState([]);
  const [openFor, setOpenFor] = useState(null);
  const [item, setItem] = useState(ITEMS[0]);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('feed');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user?.id) setNotifications(readNotifications(user.id));
  }, [user]);

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

  const sendIncentive = (friend) => {
    const notif = {
      from: user?.name || 'Alguém',
      fromId: user?.id,
      item,
      message: message.trim(),
      date: new Date().toISOString()
    };
    const key = `dojoNotifications_${friend.id}`;
    const current = readNotifications(friend.id);
    localStorage.setItem(key, JSON.stringify([notif, ...current]));
    toast({
      title: `Enviado para ${friend.name}!`,
      description: `${item}${notif.message ? `: "${notif.message}"` : ''}`
    });
    setOpenFor(null);
    setMessage('');
    setItem(ITEMS[0]);
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
                {notifications.length > 0 && (
                  <div className="dojo-card p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Bell className="w-5 h-5 text-red-500" />
                      Para você
                    </h3>
                    {notifications.map((n, i) => (
                      <div key={i} className="text-sm bg-white/5 rounded-lg p-3">
                        <span className="font-medium">{n.from}</span> enviou{' '}
                        <span className="text-red-400">{n.item}</span>
                        {n.message && <p className="text-gray-300 mt-1">"{n.message}"</p>}
                      </div>
                    ))}
                  </div>
                )}

                <FriendsFeed />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Incentivar amigos
                  </h3>
                  {friends.map((friend) => (
                    <div key={friend.id} className="dojo-card p-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate(`/athlete/${friend.id}`)}
                          className="flex items-center gap-4 flex-1 text-left hover:opacity-80 transition-opacity"
                        >
                          <ShieldProfile type={friend.frame} emblem={friend.emblem} hit={friend.streak} size="small" photo={friend.photo} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{friend.name}</h4>
                            <p className={`text-sm ${friend.activity?.inactive ? 'text-gray-500' : 'text-red-400'}`}>
                              {friend.activity?.headline}
                            </p>
                            <p className="text-xs text-gray-400">{friend.activity?.detail}</p>
                          </div>
                        </button>
                        <Button
                          onClick={() => setOpenFor(openFor === friend.id ? null : friend.id)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Gift className="w-4 h-4" />
                          Incentivar
                        </Button>
                      </div>

                      {openFor === friend.id && (
                        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                          <div className="flex flex-wrap gap-2">
                            {ITEMS.map((it) => (
                              <button
                                key={it}
                                onClick={() => setItem(it)}
                                className={`px-3 py-1 rounded-full text-sm border ${
                                  item === it ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-gray-600 text-gray-300'
                                }`}
                              >
                                {it}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escreva uma mensagem (ex: VAI TREINAR!)"
                            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
                          />
                          <Button onClick={() => sendIncentive(friend)} className="w-full dojo-button flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" />
                            Enviar para {friend.name}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
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
    </div>
  );
};

export default Friends;
