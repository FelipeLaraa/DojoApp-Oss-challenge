import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, LogOut, Camera, Shield, Lock, BarChart3, Map, Swords, Unlock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import WeekStories from '@/components/WeekStories';
import YearHeatmap from '@/components/YearHeatmap';
import { computeStreak, weekTrained, trainedToday as didTrainToday } from '@/lib/activity';
import { useActivities } from '@/hooks/useActivities';
import { supabase } from '@/lib/supabase';

const MOLDURAS = [
  { id: 'white', label: 'Pérola', rarity: 'Comum' },
  { id: 'coral', label: 'Coral', rarity: 'Comum' },
  { id: 'run', label: 'Verde', rarity: 'Rara' },
  { id: 'swim', label: 'Azul', rarity: 'Rara' },
  { id: 'lift', label: 'Aço', rarity: 'Épica' },
  { id: 'grapple', label: 'Ouro', rarity: 'Épica' },
  { id: 'black', label: 'Obsidiana', rarity: 'Lendária' }
];

const SELOS = [
  { id: null, label: 'Nenhum' },
  { id: 'grapple', label: 'Luta' },
  { id: 'lift', label: 'Levantamento' },
  { id: 'run', label: 'Corrida' },
  { id: 'swim', label: 'Natação' }
];

const RARITY_COLOR = {
  'Comum': '#9ca3af',
  'Rara': '#60a5fa',
  'Épica': '#a855f7',
  'Lendária': '#f59e0b'
};

const SPORTS = ['BJJ', 'Wrestling', 'Corrida', 'Musculação', 'Boxe', 'Luta livre', 'Natação'];
const COMBAT_SPORTS = new Set(['BJJ', 'Wrestling', 'Luta livre', 'Boxe']);
const BELTS = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];

const SPORT_FRAMES = ['swim', 'lift', 'grapple', 'run'];
const initialEmblemFor = (u) =>
  u?.emblem !== undefined ? u.emblem : (SPORT_FRAMES.includes(u?.frame) ? u.frame : null);

const compressToBlob = (file, maxSide = 512, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_error'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode_error'));
      img.onload = () => {
        const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('blob_error'))),
          'image/jpeg',
          quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [shieldOpen, setShieldOpen] = useState(false);

  // Snapshot editado (bottom sheet). Separa "ver" de "editar".
  const [draft, setDraft] = useState({
    name: '',
    username: '',
    bio: '',
    mainSport: 'BJJ',
    belt: 'Branca'
  });
  const [selectedFrame, setSelectedFrame] = useState('black');
  const [selectedEmblem, setSelectedEmblem] = useState(null);
  const [photo, setPhoto] = useState(null);

  const { activities } = useActivities(user?.id);
  const streak = computeStreak(activities);
  const weekCount = weekTrained(activities).filter(Boolean).length;
  const trainedToday = didTrainToday(activities);

  useEffect(() => {
    if (!user) return;
    setDraft({
      name: user.name || '',
      username: user.username || '',
      bio: user.bio || '',
      mainSport: user.mainSport || 'BJJ',
      belt: user.belt || 'Branca'
    });
    setSelectedFrame(user.frame || 'black');
    setSelectedEmblem(initialEmblemFor(user));
    setPhoto(user.photo || null);
  }, [user]);

  const showsBelt = COMBAT_SPORTS.has(user?.mainSport);
  const subtitle = [user?.mainSport, showsBelt && user?.belt ? `Faixa ${user.belt}` : null]
    .filter(Boolean)
    .join(' · ');

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Escolha uma imagem (JPG, PNG).', variant: 'destructive' });
      return;
    }
    if (!user?.id) {
      toast({ title: 'Sessão não encontrada', description: 'Entre de novo pra trocar a foto.', variant: 'destructive' });
      return;
    }
    try {
      const blob = await compressToBlob(file);
      const path = `${user.id}/avatar.jpg`;
      const { error: upErr } = await supabase.storage
        .from('profile-photos')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setPhoto(url);
      await updateUser({ photo: url });
      toast({ title: 'Foto atualizada' });
    } catch (err) {
      console.warn('photo upload failed:', err);
      toast({ title: 'Falha ao enviar foto', description: err?.message ?? 'Tente novamente.', variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    const cleanUsername = draft.username.replace(/^@+/, '').trim();
    const payload = {
      name: draft.name,
      username: cleanUsername,
      bio: draft.bio,
      mainSport: draft.mainSport,
      frame: selectedFrame,
      emblem: selectedEmblem
    };
    if (COMBAT_SPORTS.has(draft.mainSport)) payload.belt = draft.belt;
    const { error } = await updateUser(payload);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Perfil atualizado' });
    setEditOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Até logo', description: 'Volte sempre' });
  };

  const draftShowsBelt = COMBAT_SPORTS.has(draft.mainSport);

  return (
    <div className="min-h-screen pb-28 dojo-gradient">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="w-9" />
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
            Meu perfil
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Editar perfil"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center px-6 pt-5 pb-2">
          <button
            type="button"
            onClick={() => setShieldOpen(true)}
            aria-label="Personalizar escudo"
            className="relative active:scale-95 transition-transform"
          >
            <ShieldProfile
              type={selectedFrame}
              emblem={selectedEmblem}
              hit={streak > 0 ? streak : null}
              size="xl"
              photo={photo}
              trainedToday={trainedToday}
            />
          </button>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">{user?.name}</h1>
          {user?.username && (
            <p className="mt-0.5 text-[13px] text-white/55 font-medium">
              @{user.username}
              {subtitle ? ` · ${subtitle}` : ''}
            </p>
          )}
          {user?.bio && (
            <p className="mt-3 text-[13.5px] text-white/78 leading-snug text-center max-w-[280px] font-medium">
              {user.bio}
            </p>
          )}
        </div>

        {/* Semana atual */}
        <div className="px-5 pt-6 pb-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35 mb-2.5 px-1">
            Semana atual
          </div>
          <WeekStories
            activities={activities}
            user={user}
            trainedToday={trainedToday}
            showCount={false}
          />
        </div>

        {/* Stats (dados reais apenas) */}
        <div className="flex gap-2.5 px-5 pt-4">
          <div className="flex-1 bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
              Hit atual
            </div>
            <div className={`text-xl font-extrabold mt-1 tracking-tight ${streak > 0 ? 'text-[#ff6b4a]' : 'text-white/55'}`}>
              {streak} {streak === 1 ? 'dia' : 'dias'}
            </div>
            <div className="text-[11px] text-white/55 mt-0.5 font-medium">
              {streak > 0 ? 'de sequência' : 'ainda sem sequência'}
            </div>
          </div>
          <div className="flex-1 bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
              Semana
            </div>
            <div className="text-xl font-extrabold mt-1 tracking-tight">
              {weekCount} / 7
            </div>
            <div className="text-[11px] text-white/55 mt-0.5 font-medium">treinos</div>
          </div>
        </div>

        {/* Heatmap anual — prova pública do hábito */}
        <div className="px-5 pt-4">
          <YearHeatmap activities={activities} />
        </div>

        {/* PRO teaser */}
        <div className="relative mx-5 mt-5 p-[18px_18px_60px] rounded-[20px] overflow-hidden border border-[#d4af37]/25 bg-gradient-to-b from-[rgba(20,20,20,0.1)] via-[rgba(20,20,20,0.6)] to-[rgba(20,20,20,0.95)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/15 to-[#ff6b4a]/10 pointer-events-none" />
          <div className="relative flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold tracking-tight">Desbloquear perfil completo</div>
            <div className="text-[9px] font-black tracking-widest text-[#0a0a0a] bg-gradient-to-br from-[#f5d274] to-[#d4af37] px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(212,175,55,0.4)]">
              PRO
            </div>
          </div>
          <div className="relative flex flex-col gap-3 blur-[3.5px] opacity-65 pointer-events-none">
            {[
              { icon: BarChart3, lbl: 'Histórico de 12 meses', sub: 'calendário completo de treinos' },
              { icon: Map, lbl: 'Mapa das corridas', sub: 'rotas, pace e elevação' },
              { icon: Swords, lbl: 'Métricas de competidor', sub: 'BPM, vídeo, plano semanal' }
            ].map((it, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                  <it.icon className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <div className="text-xs font-bold">{it.lbl}</div>
                  <div className="text-[10px] text-white/55 mt-0.5">{it.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute left-0 right-0 bottom-4 flex justify-center">
            <button
              type="button"
              onClick={() =>
                toast({ title: 'Vamos avisar', description: 'Entrará na lista quando o plano competidor abrir.' })
              }
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-extrabold text-[13px] bg-gradient-to-br from-[#f5d274] to-[#d4af37] text-[#0a0a0a] shadow-[0_10px_24px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] tracking-tight"
            >
              <Unlock className="w-3.5 h-3.5" />
              Virar PRO
            </button>
          </div>
        </div>

        {/* Rodapé — sair */}
        <div className="px-5 mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do app
          </button>
        </div>
      </motion.div>

      {/* Modal: personalização do escudo */}
      <AnimatePresence>
        {shieldOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 p-4"
            onClick={() => setShieldOpen(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="dojo-card w-full max-w-md p-5 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Personalizar escudo</h3>
                <button onClick={() => setShieldOpen(false)} aria-label="Fechar">
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="flex justify-center">
                <ShieldProfile
                  type={selectedFrame}
                  emblem={selectedEmblem}
                  hit={streak > 0 ? streak : null}
                  size="large"
                  photo={photo}
                />
              </div>

              {/* Trocar foto — vive aqui agora */}
              <label className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 cursor-pointer">
                <Camera className="w-4 h-4" />
                Trocar foto
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Moldura</h4>
                <div className="space-y-2">
                  {MOLDURAS.map((m) => {
                    const active = selectedFrame === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedFrame(m.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${
                          active ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:bg-white/5'
                        }`}
                      >
                        <span className={`shield-frame shield-${m.id}`} style={{ width: 36, height: 36, margin: 0 }} />
                        <span className="flex-1 text-left font-medium text-sm">{m.label}</span>
                        <span className="text-xs font-semibold" style={{ color: RARITY_COLOR[m.rarity] }}>
                          {m.rarity}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Selo de esporte</h4>
                <div className="grid grid-cols-3 gap-2">
                  {SELOS.map((s) => {
                    const active = selectedEmblem === s.id;
                    return (
                      <button
                        key={s.label}
                        onClick={() => setSelectedEmblem(s.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                          active ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:bg-white/5'
                        }`}
                      >
                        <ShieldProfile type={selectedFrame} emblem={s.id} size="small" photo={photo} />
                        <span className="text-xs">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const { error } = await updateUser({ frame: selectedFrame, emblem: selectedEmblem });
                  if (error) {
                    toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
                    return;
                  }
                  toast({ title: 'Escudo atualizado' });
                  setShieldOpen(false);
                }}
                className="w-full py-3 rounded-xl font-extrabold bg-gradient-to-br from-[#ff6b4a] to-[#ff4d2e] text-white shadow-[0_10px_24px_rgba(255,77,46,0.4)]"
              >
                Salvar escudo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet: editar perfil */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70"
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#141414] border-t border-white/10 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold">Editar perfil</h3>
                <button onClick={() => setEditOpen(false)} aria-label="Fechar">
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-[#ff6b4a] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">@usuário</label>
                  <div className="flex items-center rounded-lg bg-black/40 border border-white/10 focus-within:border-[#ff6b4a]">
                    <span className="pl-3 text-white/40 text-sm">@</span>
                    <input
                      type="text"
                      value={draft.username}
                      onChange={(e) => setDraft({ ...draft, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
                      placeholder="seunome"
                      className="w-full p-2.5 bg-transparent focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">
                    Biografia <span className="text-white/35 font-normal">({draft.bio.length}/150)</span>
                  </label>
                  <textarea
                    value={draft.bio}
                    maxLength={150}
                    rows={3}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    placeholder="Quem você é fora do treino"
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-[#ff6b4a] focus:outline-none text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Modalidade principal</label>
                  <select
                    value={draft.mainSport}
                    onChange={(e) => setDraft({ ...draft, mainSport: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-[#ff6b4a] focus:outline-none text-sm"
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {draftShowsBelt && (
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5">Faixa</label>
                    <select
                      value={draft.belt}
                      onChange={(e) => setDraft({ ...draft, belt: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 focus:border-[#ff6b4a] focus:outline-none text-sm"
                    >
                      {BELTS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="w-full py-3 rounded-xl font-extrabold bg-gradient-to-br from-[#ff6b4a] to-[#ff4d2e] text-white shadow-[0_10px_24px_rgba(255,77,46,0.4)]"
              >
                Salvar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
