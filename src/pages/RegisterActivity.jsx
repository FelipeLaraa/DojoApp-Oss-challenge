import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Flame,
  Camera,
  ArrowLeft,
  X,
  Shield,
  Lock,
  Check,
  Plus,
  Minus
} from 'lucide-react';
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

const SPORTS = ['BJJ', 'Wrestling', 'Corrida', 'Musculação', 'Boxe', 'Luta livre', 'Natação'];

const MOODS = [
  { key: 'exausto', emoji: '😮‍💨', label: 'exausto' },
  { key: 'sofreu', emoji: '😤', label: 'sofreu' },
  { key: 'em alta', emoji: '🔥', label: 'em alta' },
  { key: 'leve', emoji: '🙂', label: 'leve' },
  { key: 'técnico', emoji: '🧠', label: 'técnico' }
];

// Próximo múltiplo de 7 estritamente maior que o streak atual.
const nextMilestone = (streak) => {
  const base = Math.floor(streak / 7) * 7;
  return base + 7;
};

const RegisterActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const existing = readActivities(user?.id);
  const streak = useMemo(() => computeStreak(existing), [existing]);
  const doneToday = useMemo(() => trainedToday(existing), [existing]);
  const targetDay = streak + (doneToday ? 0 : 1);
  const milestone = nextMilestone(streak);
  const prevMilestone = milestone - 7;
  const progressPct = Math.min(
    100,
    Math.max(0, ((streak - prevMilestone) / 7) * 100)
  );
  const remaining = Math.max(0, milestone - streak);

  const [sport, setSport] = useState(user?.mainSport || 'BJJ');
  const [duration, setDuration] = useState(60);
  const [comment, setComment] = useState('');
  const [mood, setMood] = useState(null);
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
      comment,
      mood,
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
    toast({
      title: 'Treino registrado! 🔥',
      description: `Sua sequência está em ${newStreak} ${newStreak === 1 ? 'dia' : 'dias'}.`
    });
    navigate('/student');
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
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

  const now = new Date();
  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
  const timeLabel = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const lit = doneToday;

  // Animação da chama: tremulação contínua, forte se acesa, sutil se apagada.
  const flameAnim = lit
    ? {
        scale: [0.95, 1.05, 0.95],
        rotate: [-3, 3, -3]
      }
    : {
        scale: [0.98, 1.02, 0.98]
      };
  const flameTransition = lit
    ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' };

  return (
    <div className="min-h-screen pb-40 dojo-gradient relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header: back + date pill */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="date-pill">{dateLabel} · {timeLabel}</span>
          <div className="w-9" />
        </div>

        {/* HERO card (Nicole) */}
        <div className="px-5">
          <div className={`hero-card ${lit ? '' : 'dim'}`}>
            <div className="hero-card-inner px-5 pt-5 pb-6">
              <div className="hero-grid-mini" />

              {/* Header: label + chip integrado */}
              <div className="relative flex items-center justify-between">
                <span
                  className="section-label"
                  style={{ color: lit ? '#fcd34d' : '#a3a3a3' }}
                >
                  {lit ? 'Sequência viva' : 'Sequência em risco'}
                </span>
                <span className={`today-chip ${lit ? 'go' : 'warn'}`}>
                  <span className="dot" />
                  {lit ? 'hoje garantido' : 'falta hoje'}
                </span>
              </div>

              {/* Chama + número grudados */}
              <div className="relative mt-4 flex items-end justify-center gap-3">
                <motion.svg
                  className="flame-icon"
                  width="68"
                  height="88"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={flameAnim}
                  transition={flameTransition}
                  style={{
                    originX: 0.5,
                    originY: 0.9,
                    opacity: lit ? 1 : 0.55
                  }}
                >
                  <defs>
                    <linearGradient id="flameLit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="55%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="flameDim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4d4d8" />
                      <stop offset="100%" stopColor="#737373" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.74-1.5-2-1.5-4.5 0 0-3.5.5-3.5 4.5zM12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5C10 5 12 2 12 2z"
                    fill={lit ? 'url(#flameLit)' : 'url(#flameDim)'}
                  />
                </motion.svg>
                <div className={`streak-number ${lit ? '' : 'dim'}`}>{streak}</div>
              </div>

              <div className="relative text-center mt-1 text-[13px] text-neutral-400">
                {lit
                  ? streak === 1 ? 'dia no fogo' : 'dias no fogo'
                  : 'dias · hoje ainda não'}
              </div>

              {/* Barra de progresso ao próximo marco */}
              <div className="relative mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                    próximo marco
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${lit ? 'text-amber-300' : 'text-neutral-400'}`}
                  >
                    {milestone} dias{' '}
                    <span className="text-neutral-500 font-normal">
                      · faltam {remaining}
                    </span>
                  </span>
                </div>
                <div className="milestone-track">
                  <div
                    className={`milestone-fill ${lit ? '' : 'dim'}`}
                    style={{ width: `${progressPct}%` }}
                  />
                  <div className="milestone-tick" />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`text-center mt-3 text-[11px] ${
              lit ? 'text-neutral-500' : 'text-amber-300/80'
            }`}
          >
            {lit ? 'bateu hoje · agora é segurar amanhã' : 'registra agora pra não quebrar'}
          </div>
        </div>

        {/* ESSENCIAL */}
        <div className="px-5 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="section-label">Essencial</div>
            <div className="text-[10px] text-neutral-500">basta isto pra contar</div>
          </div>

          {/* Modalidade em chips */}
          <div>
            <div className="text-xs text-neutral-400 mb-2">Modalidade</div>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`chip ${s === sport ? 'on' : ''}`}
                >
                  {s === sport && <Check className="w-3 h-3" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duração com stepper visual */}
          <div className="card-tight p-4">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-3">
              Duração
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDuration(Math.max(0, Number(duration || 0) - 5))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
                aria-label="Diminuir 5 minutos"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-20 bg-transparent text-4xl font-bold outline-none text-white text-center"
                />
                <span className="text-xs text-neutral-500">min</span>
              </div>
              <button
                type="button"
                onClick={() => setDuration(Number(duration || 0) + 5)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
                aria-label="Aumentar 5 minutos"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mood */}
          <div>
            <div className="text-xs text-neutral-400 mb-2">Como você saiu do treino?</div>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                  className={`mood-tile ${mood === m.key ? 'on' : ''}`}
                >
                  <div className="mood-emoji">{m.emoji}</div>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comente algo sobre isso */}
          <div className="card-tight p-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
              Comente algo
            </div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={240}
              placeholder="Como foi o treino de hoje?"
              className="w-full bg-transparent text-sm font-medium outline-none text-white placeholder:text-neutral-600"
            />
          </div>

          {/* Prova do dia (foto) */}
          <div>
            <div className="text-xs text-neutral-400 mb-2">Prova do dia</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="grid grid-cols-3 gap-2">
              {photo ? (
                <div className="aspect-square rounded-xl overflow-hidden relative bg-black border border-white/10">
                  <img src={photo} alt="Prova do treino" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white"
                    aria-label="Remover foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border border-dashed border-white/15 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:text-red-300 hover:border-red-500/50 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px]">+ foto</span>
                </button>
              )}
              <div className="aspect-square rounded-xl border border-dashed border-white/10 flex items-center justify-center text-neutral-700 text-[10px]">
                vazio
              </div>
              <div className="aspect-square rounded-xl border border-dashed border-white/10 flex items-center justify-center text-neutral-700 text-[10px]">
                vazio
              </div>
            </div>
          </div>
        </div>

        {/* PRO borrado — teaser */}
        <div className="px-5 pt-7 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="section-label">Pro · competidor</div>
            <span className="text-[10px] text-amber-400 font-semibold">em breve</span>
          </div>

          <div className="card premium p-4 relative overflow-hidden">
            <div className="premium-shine" />
            <div className="premium-tag">
              <Lock className="w-2.5 h-2.5" />
              PRO
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <div className="text-sm font-semibold text-amber-300">
                Métricas de competidor
              </div>
            </div>

            <div className="space-y-2 lock-blur">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">Vídeo da rola</span>
                <span className="text-neutral-500">anexar MP4</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">BPM médio · freq. card.</span>
                <span className="text-neutral-500">conectar relógio</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">Peso de corte · hidratação</span>
                <span className="text-neutral-500">— —</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">Plano semanal do técnico</span>
                <span className="text-neutral-500">— —</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                toast({
                  title: 'Vamos avisar',
                  description: 'Entrará na lista quando o plano competidor abrir.'
                })
              }
              className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-amber-100 bg-amber-500/10 border border-amber-500/30"
            >
              Avisar quando chegar
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
            <Shield className="w-3 h-3" />
            prova do hábito · nunca palco
          </div>
        </div>
      </motion.div>

      {/* Save bar sticky bottom */}
      <div className="save-bar">
        <button type="button" onClick={handleRegister} className="save-btn">
          <Flame className="w-5 h-5" fill="currentColor" />
          {doneToday
            ? `Registrar outra sessão · dia ${targetDay}`
            : `Registrar treino · dia ${targetDay}`}
        </button>
        <div className="text-center text-[10px] text-neutral-500 mt-2">
          basta a modalidade · o resto é bônus
        </div>
      </div>
    </div>
  );
};

export default RegisterActivity;
