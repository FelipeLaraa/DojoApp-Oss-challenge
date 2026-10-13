import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, Gift, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
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
  const [openFor, setOpenFor] = useState(null); // id do amigo com o form aberto
  const [item, setItem] = useState(ITEMS[0]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.id) setNotifications(readNotifications(user.id));
  }, [user]);

  const friends = characters
    .filter((c) => c.id !== user?.id)
    .map(mergeSaved);

  const sendIncentive = (friend) => {
    const notif = {
      from: user?.name || 'Alguém',
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

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Amigos</h1>
          <p className="text-gray-400 text-sm">Acompanhe e incentive seu grupo de treino</p>
        </div>

        {/* Notificações recebidas */}
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

        {/* Feed de amigos */}
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="dojo-card p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/athlete/${friend.id}`)}
                  className="flex items-center gap-4 flex-1 text-left hover:opacity-80 transition-opacity"
                >
                  <ShieldProfile type={friend.frame} years={friend.years} size="small" photo={friend.photo} />
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
      </motion.div>
    </div>
  );
};

export default Friends;
