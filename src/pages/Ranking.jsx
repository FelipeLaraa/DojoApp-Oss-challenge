import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';

const Ranking = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [rankings, setRankings] = useState({});

  useEffect(() => {
    const mockRankings = {
      students: [
        {
          id: 1,
          name: 'João Silva',
          belt: 'Azul',
          points: 1250,
          position: 1,
          change: '+2',
          attendance: 95,
          frame: 'coral'
        },
        {
          id: 2,
          name: 'Maria Santos',
          belt: 'Roxa',
          points: 1180,
          position: 2,
          change: '-1',
          attendance: 92,
          frame: 'black'
        },
        {
          id: 3,
          name: 'Pedro Costa',
          belt: 'Azul',
          points: 1120,
          position: 3,
          change: '+1',
          attendance: 88,
          frame: 'white'
        },
        {
          id: 4,
          name: 'Ana Lima',
          belt: 'Branca',
          points: 980,
          position: 4,
          change: '0',
          attendance: 85,
          frame: 'black'
        },
        {
          id: 5,
          name: 'Carlos Mendes',
          belt: 'Azul',
          points: 920,
          position: 5,
          change: '-2',
          attendance: 82,
          frame: 'coral'
        }
      ],
      friends: [
        {
          id: 1,
          name: 'Rafael Oliveira',
          belt: 'Roxa',
          points: 1350,
          position: 1,
          change: '+1',
          attendance: 96,
          frame: 'coral'
        },
        {
          id: 2,
          name: 'Beatriz Rocha',
          belt: 'Azul',
          points: 1200,
          position: 2,
          change: '0',
          attendance: 90,
          frame: 'white'
        },
        {
          id: 3,
          name: 'Lucas Ferreira',
          belt: 'Branca',
          points: 850,
          position: 3,
          change: '+2',
          attendance: 78,
          frame: 'black'
        }
      ],
      academies: [
        {
          id: 1,
          name: 'Dojo Central',
          students: 127,
          rating: 4.8,
          position: 1,
          change: '0',
          classes: 45
        },
        {
          id: 2,
          name: 'Academia Guerreiros',
          students: 98,
          rating: 4.6,
          position: 2,
          change: '+1',
          classes: 38
        },
        {
          id: 3,
          name: 'Fight Club BJJ',
          students: 85,
          rating: 4.5,
          position: 3,
          change: '-1',
          classes: 32
        }
      ]
    };

    setRankings(mockRankings);
  }, []);

  const tabs = [
    { id: 'students', label: 'Alunos', icon: Trophy },
    { id: 'friends', label: 'Amigos', icon: Medal },
    { id: 'academies', label: 'Academias', icon: Award }
  ];

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getChangeColor = (change) => {
    if (change.startsWith('+')) return 'text-green-500';
    if (change.startsWith('-')) return 'text-red-500';
    return 'text-gray-400';
  };

  const getChangeIcon = (change) => {
    if (change.startsWith('+')) return '↗️';
    if (change.startsWith('-')) return '↘️';
    return '➡️';
  };

  return (
    <div className="min-h-screen pb-20 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Rankings
          </h1>
          <p className="text-gray-300">Competição saudável entre praticantes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Rankings List */}
        <div className="space-y-3">
          {activeTab === 'academies' ? (
            // Academy Rankings
            rankings[activeTab]?.map((academy, index) => (
              <motion.div
                key={academy.id}
                className="dojo-card p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold w-12 text-center">
                    {getPositionIcon(academy.position)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{academy.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{academy.students} alunos</span>
                      <span>⭐ {academy.rating}</span>
                      <span>{academy.classes} aulas/mês</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm ${getChangeColor(academy.change)}`}>
                      {getChangeIcon(academy.change)} {academy.change}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Student/Friends Rankings
            rankings[activeTab]?.map((person, index) => (
              <motion.div
                key={person.id}
                className="dojo-card p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold w-12 text-center">
                    {getPositionIcon(person.position)}
                  </div>
                  
                  <ShieldProfile
                    type={person.frame}
                    size="small"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{person.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Faixa {person.belt}</span>
                      <span>{person.points} pts</span>
                      <span>{person.attendance}% presença</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm ${getChangeColor(person.change)}`}>
                      {getChangeIcon(person.change)} {person.change}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* My Position */}
        <div className="dojo-card p-4 border-2 border-red-500">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold w-12 text-center text-red-500">
              #12
            </div>
            
            <ShieldProfile
              type="black"
              size="small"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-red-500">Você</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Faixa Branca</span>
                <span>750 pts</span>
                <span>85% presença</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-green-500">
                ↗️ +3
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="dojo-card p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Como funciona o ranking?
          </h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Pontos por presença nas aulas</p>
            <p>• Bônus por participação em competições</p>
            <p>• Avaliações positivas dos professores</p>
            <p>• Consistência na frequência</p>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={() => toast({
            title: "🚧 Esta funcionalidade não está implementada ainda",
            description: "Mas não se preocupe! Você pode solicitar na próxima mensagem! 🚀"
          })}
          className="w-full dojo-button"
        >
          Ver Ranking Completo
        </Button>
      </motion.div>
    </div>
  );
};

export default Ranking;