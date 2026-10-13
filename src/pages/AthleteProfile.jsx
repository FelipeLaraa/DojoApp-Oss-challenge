import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShieldProfile from '@/components/ShieldProfile';
import { characters } from '@/data/characters';

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = characters.find((c) => c.id === id);

  if (!base) {
    return (
      <div className="min-h-screen p-6 dojo-gradient flex flex-col items-center justify-center text-center">
        <p className="text-gray-400 mb-4">Atleta não encontrado.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Voltar</Button>
      </div>
    );
  }

  const athlete = mergeSaved(base);

  const stats = [
    { label: 'Aulas Frequentadas', value: athlete.classesAttended, icon: Calendar },
    { label: 'Anos de Carreira', value: athlete.years, icon: Trophy },
    { label: 'Modalidade', value: athlete.modality, icon: Activity }
  ];

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Cabeçalho */}
        <div className="text-center">
          <ShieldProfile type={athlete.frame} emblem={athlete.emblem} hit={athlete.streak} size="large" photo={athlete.photo} />
          <h1 className="text-2xl font-bold mt-4">{athlete.name}</h1>
          {athlete.username && <p className="text-red-400 text-sm">@{athlete.username}</p>}
          <p className="text-gray-400 mt-1">{athlete.roleLabel}</p>
          <p className="text-gray-300 text-sm">
            {athlete.mainSport || athlete.modality}{athlete.belt ? ` • Faixa ${athlete.belt}` : ''}
          </p>
        </div>

        {/* Status de atividade */}
        {athlete.activity && (
          <div className="dojo-card p-4 text-center">
            <p className={`text-lg font-semibold ${athlete.activity.inactive ? 'text-gray-500' : 'text-red-400'}`}>
              {athlete.activity.headline}
            </p>
            <p className="text-sm text-gray-400">{athlete.activity.detail}</p>
          </div>
        )}

        {/* Bio */}
        {athlete.bio && (
          <div className="dojo-card p-4">
            <p className="text-gray-300 text-sm italic">"{athlete.bio}"</p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="dojo-card p-4 text-center">
              <s.icon className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{s.value}</div>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AthleteProfile;
