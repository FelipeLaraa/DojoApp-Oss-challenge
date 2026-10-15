import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('today');
  
  const days = [
    { id: 'today', label: 'Hoje', date: '23' },
    { id: 'tomorrow', label: 'Amanhã', date: '24' },
    { id: 'wednesday', label: 'Qua', date: '25' },
    { id: 'thursday', label: 'Qui', date: '26' },
    { id: 'friday', label: 'Sex', date: '27' }
  ];

  const classes = {
    today: [
      {
        id: 1,
        name: 'BJJ Fundamentals',
        time: '19:00 - 20:00',
        teacher: 'Prof. Carlos',
        level: 'Iniciante',
        spots: '8/12',
        location: 'Tatame 1'
      },
      {
        id: 2,
        name: 'Wrestling',
        time: '20:30 - 21:30',
        teacher: 'Prof. Anderson',
        level: 'Intermediário',
        spots: '6/10',
        location: 'Tatame 2'
      }
    ],
    tomorrow: [
      {
        id: 3,
        name: 'BJJ Avançado',
        time: '19:00 - 20:30',
        teacher: 'Prof. Rafael',
        level: 'Avançado',
        spots: '4/8',
        location: 'Tatame 1'
      },
      {
        id: 4,
        name: 'No-Gi',
        time: '20:00 - 21:00',
        teacher: 'Prof. Bruno',
        level: 'Todos os níveis',
        spots: '7/15',
        location: 'Tatame 2'
      }
    ],
    wednesday: [
      {
        id: 5,
        name: 'BJJ Kids',
        time: '17:00 - 18:00',
        teacher: 'Prof. Ana',
        level: 'Infantil',
        spots: '12/15',
        location: 'Tatame 1'
      },
      {
        id: 6,
        name: 'BJJ Fundamentals',
        time: '19:00 - 20:00',
        teacher: 'Prof. Carlos',
        level: 'Iniciante',
        spots: '5/12',
        location: 'Tatame 1'
      }
    ],
    thursday: [
      {
        id: 7,
        name: 'Wrestling',
        time: '19:00 - 20:00',
        teacher: 'Prof. Anderson',
        level: 'Intermediário',
        spots: '3/10',
        location: 'Tatame 2'
      }
    ],
    friday: [
      {
        id: 8,
        name: 'Open Mat',
        time: '19:00 - 21:00',
        teacher: 'Treino Livre',
        level: 'Todos os níveis',
        spots: '∞',
        location: 'Todos os Tatames'
      }
    ]
  };

  const handleRSVP = (classId) => {
    toast({
      title: "Presença confirmada!",
      description: "Você confirmou presença na aula"
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Iniciante': return 'bg-green-500';
      case 'Intermediário': return 'bg-yellow-500';
      case 'Avançado': return 'bg-red-500';
      case 'Infantil': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

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
            <Calendar className="w-6 h-6" />
            Agenda de Aulas
          </h1>
          <p className="text-gray-300">Setembro 2024</p>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all min-w-[70px] ${
                selectedDay === day.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{day.date}</div>
                <div className="text-xs">{day.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Classes list */}
        <div className="space-y-4">
          {classes[selectedDay]?.map((cls) => (
            <motion.div
              key={cls.id}
              className="dojo-card p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(cls.level)}`}>
                      {cls.level}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{cls.teacher}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span>{cls.spots}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{cls.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{cls.location}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleRSVP(cls.id)}
                  className="flex-1 dojo-button"
                >
                  Confirmar Presença
                </Button>
                
                <Button
                  onClick={() => toast({
                    title: "🚧 Esta funcionalidade não está implementada ainda",
                    description: "Mas não se preocupe! Você pode solicitar na próxima mensagem! 🚀"
                  })}
                  variant="outline"
                  size="sm"
                >
                  Detalhes
                </Button>
              </div>
            </motion.div>
          )) || (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma aula agendada para este dia</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Schedule;