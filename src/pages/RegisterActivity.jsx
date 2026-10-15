import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Camera, ChevronDown, Check, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  addActivity,
  readActivities,
  computeStreak,
  trainedToday,
  storageUsageRatio
} from '@/lib/activity';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_SIDE = 800;
const JPEG_QUALITY = 0.75;

// Lê o arquivo, redimensiona pra que o maior lado seja MAX_SIDE (mantendo a
// proporção) e exporta como JPEG com qualidade 0.75. Devolve um dataURL.
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_error'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode_error'));
      img.onload = () => {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

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
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handleRegister = () => {
    if (storageUsageRatio() >= 0.9) {
      toast({
        title: 'Armazenamento quase cheio',
        description: 'Apague treinos antigos pra continuar registrando com foto.'
      });
    }
    const updated = addActivity(user?.id, {
      sport,
      durationMin: duration,
      note,
      photo
    });
    if (!updated) {
      toast({
        title: 'Armazenamento cheio',
        description: 'Remova treinos antigos pra registrar este.',
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // permite re-selecionar o mesmo arquivo
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast({
        title: 'Imagem muito grande',
        description: 'Escolha uma menor que 10 MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
    } catch {
      toast({
        title: 'Não foi possível ler a imagem',
        description: 'Tente outra foto (JPEG ou PNG).',
        variant: 'destructive'
      });
    }
  };

  const handleRemovePhoto = () => setPhoto(null);

  return (
    <div className="min-h-screen pb-28 p-6 dojo-gradient">
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

              {/* Foto do treino */}
              <div>
                <label className="block text-sm font-medium mb-1">Foto do treino</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {!photo ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-300 transition-all text-sm"
                  >
                    <Camera className="w-5 h-5" />
                    Adicionar foto
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <img
                      src={photo}
                      alt="Prévia do treino"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-600"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1 text-sm text-gray-300 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                      Remover foto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterActivity;
