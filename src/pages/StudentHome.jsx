import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Plus, Zap, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import ProgressBar from '@/components/ProgressBar';
import { characters } from '@/data/characters';

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

const ReactionRow = ({ onReact }) => (
  <div className="flex gap-2 mt-3">
    {REACTIONS.map((r) => (
      <button
        key={r.id}
        onClick={() => onReact(r.id)}
        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-700 hover:border-red-500 hover:bg-white/5 transition-all text-sm"
      >
        <r.icon className={`w-4 h-4 ${r.color}`} />
        {r.label}
      </button>
    ))}
  </div>
);

const StudentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, force] = useState(0);

  const friends = characters.filter((c) => c.id !== user?.id).map(mergeSaved);
  const inactive = friends.filter((f) => f.activity?.inactive);
  const active = friends.filter((f) => !f.activity?.inactive);

  const sendQuick = (friend, item) => {
    try {
      const key = `dojoNotifications_${friend.id}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const notif = { from: user?.name || 'Alguém', item, message: '', date: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify([notif, ...current]));
    } catch {}
    toast({ title: `Enviado para ${friend.name}!`, description: item });
    force((n) => n + 1);
  };

  const handleRegister = () => {
    toast({
      title: "Registrar treino — em breve",
      description: "Vai alimentar sua sequência e seus status de verdade."
    });
  };

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Seu resumo */}
        <div className="dojo-card p-4">
          <div className="flex items-center gap-4">
            <ShieldProfile type={user?.frame || 'black'} years={user?.years || 1} size="small" photo={user?.photo} />
            <div className="flex-1">
              <h2 className="text-lg font-bold">Olá, {user?.name}!</h2>
              <p className="text-sm text-gray-400">{user?.mainSport || 'BJJ'}</p>
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
                    <ShieldProfile type={f.frame} years={f.years} size="small" photo={f.photo} />
                  </button>
                  <div className="flex-1">
                    <h4 className="font-semibold">{f.name}</h4>
                    <p className="text-xs text-gray-500">{f.activity.detail} • {recency[f.id] || 'faz tempo'}</p>
                  </div>
                </div>
                <ReactionRow onReact={(item) => sendQuick(f, item)} />
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
                  <ShieldProfile type={f.frame} years={f.years} size="small" photo={f.photo} />
                </button>
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {f.name} <span className="text-red-400 font-normal">{f.activity?.headline}</span>
                  </h4>
                  <p className="text-xs text-gray-400">{f.activity?.detail} • {recency[f.id] || 'recente'}</p>
                </div>
              </div>
              <ReactionRow onReact={(item) => sendQuick(f, item)} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentHome;
