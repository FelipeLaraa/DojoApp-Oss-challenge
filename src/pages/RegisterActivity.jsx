import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Flame,
  Camera,
  ArrowLeft,
  X,
  MapPin,
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
  todaySessions,
  storageUsageRatio
} from '@/lib/activity';
import { relativeTime } from '@/lib/time';

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

const BJJ_POSITIONS = [
  'Guarda aranha',
  'Berimbolo',
  'Triângulo',
  'Meia-guarda',
  '50/50',
  'Armlock',
  'Omoplata',
  'Rear naked choke',
  'Mata-leão',
  'Kimura',
  'Passagem de guarda',
  'Montada'
];

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

const Stepper = ({ label, value, onChange, accent }) => (
  <div className="card-tight p-3 text-center">
    <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{label}</div>
    <div className="flex items-center justify-between gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className={`text-xl font-bold ${accent || ''}`}>{value}</div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

const RegisterActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const existing = readActivities(user?.id);
  const streak = useMemo(() => computeStreak(existing), [existing]);
  const doneToday = useMemo(() => trainedToday(existing), [existing]);
  const todays = useMemo(() => todaySessions(existing), [existing]);
  const todayTotalMin = todays.reduce((acc, a) => acc + (Number(a.durationMin) || 0), 0);
  const targetDay = streak + (doneToday ? 0 : 1); // "dia N" a aparecer no CTA após salvar
  const milestone = nextMilestone(streak);

  const [sport, setSport] = useState(user?.mainSport || 'BJJ');
  const [duration, setDuration] = useState('');
  const [local, setLocal] = useState('');
  const [mood, setMood] = useState(null);
  const [positions, setPositions] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [partnerBelt, setPartnerBelt] = useState('');
  const [rolls, setRolls] = useState(0);
  const [submissions, setSubmissions] = useState(0);
  const [caught, setCaught] = useState(0);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const togglePosition = (p) =>
    setPositions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const isBJJ = sport === 'BJJ';

  // Marcador de dia pros streak dots (0..9 → últimos 7 dias + 3 futuros)
  const dots = Array.from({ length: 10 }, (_, i) => {
    if (i < streak) return 'done';
    if (i === streak) return 'next';
    return 'future';
  }).slice(0, 10);

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
      photo,
      local: local || null,
      mood,
      positions: isBJJ ? positions : null,
      partner: isBJJ && partnerName ? { name: partnerName, belt: partnerBelt || null } : null,
      rolls: isBJJ ? rolls : null,
      submissions: isBJJ ? submissions : null,
      caught: isBJJ ? caught : null
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

  return (
    <div className="min-h-screen pb-40 dojo-gradient relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Card discreto: sessões já registradas hoje */}
        {todays.length >= 1 && (
          <div className="px-5 pt-5">
            <div className="card-tight p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                    Hoje
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {todays.length} {todays.length === 1 ? 'sessão' : 'sessões'}
                    {todayTotalMin ? ` · total ${todayTotalMin}min` : ''}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">✓ dia garantido</div>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {todays.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] text-neutral-400"
                  >
                    <span>
                      {a.sport || '—'}
                      {a.durationMin ? ` · ${a.durationMin}min` : ''}
                    </span>
                    <span className="text-neutral-600">{relativeTime(a.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HERO celebrativo */}
        <div className="register-hero px-5 pt-10 pb-6 relative overflow-hidden">
          <div className="register-hero-grid" />

          <div className="relative flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {dateLabel} · {timeLabel}
            </div>
            <div className="w-9" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="flame-badge mb-3">
              <Flame className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-orange-300/80 font-semibold mb-1">
              Sequência viva
            </div>
            <div className="text-6xl font-bold leading-none tracking-tight">{streak}</div>
            <div className="text-sm text-neutral-400 mt-1">
              {streak === 1 ? 'dia no fogo' : 'dias no fogo'} · próximo marco:{' '}
              <b className="text-amber-300">{milestone}</b>
            </div>
          </div>

          {/* streak dots */}
          <div className="relative mt-5 flex justify-center gap-1.5">
            {dots.map((d, i) => (
              <div
                key={i}
                className={
                  d === 'done'
                    ? 'w-6 h-1.5 rounded-full bg-orange-500'
                    : d === 'next'
                    ? 'w-6 h-1.5 rounded-full bg-orange-500/40 ring-2 ring-orange-400'
                    : 'w-6 h-1.5 rounded-full bg-white/10'
                }
              />
            ))}
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

          {/* Duração + Local */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-tight p-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                Duração
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-16 bg-transparent text-2xl font-bold outline-none text-white"
                />
                <span className="text-xs text-neutral-500">min</span>
              </div>
            </div>
            <div className="card-tight p-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                Local
              </div>
              <input
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Onde treinou?"
                className="w-full bg-transparent text-sm font-medium outline-none text-white placeholder:text-neutral-600"
              />
              <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                opcional
              </div>
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
        </div>

        {/* TÉCNICO · BJJ — só aparece se modalidade = BJJ */}
        {isBJJ && (
          <div className="px-5 pt-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="section-label">Técnico · BJJ</div>
              <div className="text-[10px] text-neutral-500">o que você treinou</div>
            </div>

            {/* Posições */}
            <div>
              <div className="text-xs text-neutral-400 mb-2">Posições / golpes trabalhados</div>
              <div className="flex flex-wrap gap-2">
                {BJJ_POSITIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePosition(p)}
                    className={`chip ${positions.includes(p) ? 'on' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Parceiro */}
            <div className="card-tight p-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
                Parceiro de treino
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Nome"
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50"
                />
                <input
                  type="text"
                  value={partnerBelt}
                  onChange={(e) => setPartnerBelt(e.target.value)}
                  placeholder="Faixa"
                  className="w-24 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            {/* Contadores */}
            <div className="grid grid-cols-3 gap-2">
              <Stepper label="Rolas" value={rolls} onChange={setRolls} />
              <Stepper
                label="Finaliz."
                value={submissions}
                onChange={setSubmissions}
                accent="text-emerald-400"
              />
              <Stepper
                label="Pego"
                value={caught}
                onChange={setCaught}
                accent="text-neutral-400"
              />
            </div>

            {/* Nota */}
            <div className="card-tight p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-neutral-400">O que aprendi hoje</div>
                <div className="text-[10px] text-neutral-600">{note.length}/240</div>
              </div>
              <textarea
                value={note}
                maxLength={240}
                rows={3}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Insights, erros, o que vai treinar de novo…"
                className="w-full bg-transparent text-sm leading-relaxed text-neutral-200 placeholder:text-neutral-600 outline-none resize-none"
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
        )}

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
