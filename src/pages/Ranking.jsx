import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ShieldProfile from '@/components/ShieldProfile';
import { characters } from '@/data/characters';
import { readActivities, computeStreak, weekTrained } from '@/lib/activity';

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

const positionIcon = (pos) =>
  pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;

const weekCount = (w) => (w || []).filter(Boolean).length;

const Ranking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Meus dados reais (vindos dos treinos registrados).
  const myActivities = readActivities(user?.id);
  const myStreak = computeStreak(myActivities);
  const myWeek = weekTrained(myActivities);

  // Participantes: amigos (personagens) + você. Se você for um personagem,
  // seus dados viram reais; senão, entra como participante próprio.
  let people = characters.map(mergeSaved).map((c) => {
    const isMe = c.id === user?.id;
    return {
      id: c.id,
      name: isMe ? 'Você' : c.name,
      frame: c.frame,
      emblem: c.emblem,
      photo: c.photo,
      streak: isMe ? myStreak : c.streak,
      week: isMe ? myWeek : c.week,
      isMe
    };
  });

  if (user?.id && !people.some((p) => p.isMe)) {
    people.push({
      id: user.id,
      name: 'Você',
      frame: user.frame || 'black',
      emblem: user.emblem,
      photo: user.photo,
      streak: myStreak,
      week: myWeek,
      isMe: true
    });
  }

  people = people
    .sort((a, b) => weekCount(b.week) - weekCount(a.week) || b.streak - a.streak)
    .map((p, i) => ({ ...p, position: i + 1 }));

  return (
    <div className="min-h-screen pb-28 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Ranking dos amigos
          </h1>
          <p className="text-gray-300">Quem treinou mais esta semana</p>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {people.map((p, index) => (
            <motion.div
              key={p.id}
              className={`dojo-card p-4 ${p.isMe ? 'border-2 border-red-500' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold w-12 text-center ${p.isMe ? 'text-red-500' : ''}`}>
                  {positionIcon(p.position)}
                </div>

                <button
                  onClick={() => !p.isMe && navigate(`/athlete/${p.id}`)}
                  disabled={p.isMe}
                >
                  <ShieldProfile
                    type={p.frame}
                    emblem={p.emblem}
                    hit={p.streak}
                    size="small"
                    photo={p.photo}
                  />
                </button>

                <div className="flex-1">
                  <h3 className={`font-semibold ${p.isMe ? 'text-red-500' : ''}`}>{p.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="font-semibold text-gray-200">{weekCount(p.week)}x esta semana</span>
                    <span>🔥 {p.streak} {p.streak === 1 ? 'dia' : 'dias'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <div className="dojo-card p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Como funciona o ranking?
          </h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Ordenado pela frequência (dias treinados na semana)</p>
            <p>• Empate? Vale a maior sequência (hit)</p>
            <p>• Treine e registre para subir</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Ranking;
