import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Camera, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { addActivity, readActivities, computeStreak, trainedToday } from '@/lib/activity';

const SPORTS = ['BJJ', 'Wrestling', 'Corrida', 'Musculação', 'Boxe', 'Luta livre'];

const RegisterActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const activities = readActivities(user?.id);
  const [streak, setStreak] = useState(() => computeStreak(activities));
  const [doneToday, setDoneToday] = useState(() => trainedToday(activities));

  const [showDetail, setShowDetail] = useState(false);
  const [sport, setSport] = useState(user?.mainSport || 'BJJ');
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');

  const handleRegister = () => {
    const updated = addActivity(user?.id, { sport, durationMin: duration, note });
    if (!updated) {
      toast({
        title: 'Não foi possível salvar',
        description: 'O armazenamento do navegador está cheio ou indisponível.',
        variant: 'destructive'
      });
      return;
    }
    const newStreak = computeStreak(updated);
    setStreak(newStreak);
    setDoneToday(true);
    toast({
      title: 'Treino registrado! 🔥',
      description: `Sua sequência está em ${newStreak} ${newStreak === 1 ? 'dia' : 'dias'}.`
    });
    navigate('/student');
  };

  // Foto: placeholder até existir backend (ver limite do localStorage).
  const handlePhoto = () => {
    toast({
      title: 'Foto do treino — em breve',
      description: 'Vai chegar junto com o armazenamento na nuvem.'
    });
  };

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Registrar treino</h1>
          <p className="text-gray-300 text-sm mt-1">
            Um toque e sua sequência continua viva.
          </p>
        </div>

        {/* Sequência atual */}
        <div className="dojo-card p-5 text-center">
          <Flame
            className={`w-10 h-10 mx-auto mb-2 ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}
          />
          <div className="text-3xl font-bold">
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </div>
          <p className="text-sm text-gray-400">
            {streak > 0 ? 'de sequência' : 'comece sua sequência hoje'}
          </p>
        </div>

        {/* Botão de 1 toque */}
        <Button
          onClick={handleRegister}
          className="w-full dojo-button text-lg py-4 flex items-center justify-center gap-2"
        >
          {doneToday ? <Check className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
          {doneToday ? 'Treinei de novo hoje' : 'Treinei hoje'}
        </Button>

        {/* Detalhe opcional */}
        <div className="dojo-card p-4">
          <button
            onClick={() => setShowDetail((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-medium"
          >
            <span>Adicionar detalhes (opcional)</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${showDetail ? 'rotate-180' : ''}`}
            />
          </button>

          {showDetail && (
            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modalidade</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duração (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="ex.: 60"
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nota <span className="text-gray-500">({note.length}/140)</span>
                </label>
                <textarea
                  value={note}
                  maxLength={140}
                  rows={2}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Como foi o treino?"
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Foto: placeholder até o backend */}
              <div>
                <label className="block text-sm font-medium mb-1">Foto do treino</label>
                <button
                  onClick={handlePhoto}
                  className="w-full flex items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-300 transition-all text-sm"
                >
                  <Camera className="w-5 h-5" />
                  Adicionar foto (em breve)
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterActivity;
