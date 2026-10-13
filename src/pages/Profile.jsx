import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Trophy, Calendar, Star, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ShieldProfile from '@/components/ShieldProfile';
import ProgressBar from '@/components/ProgressBar';
import { readActivities, computeStreak } from '@/lib/activity';

// Molduras disponíveis (cor/estilo) com raridade, mostradas em lista compacta.
const MOLDURAS = [
  { id: 'white', label: 'Pérola', rarity: 'Comum' },
  { id: 'coral', label: 'Coral', rarity: 'Comum' },
  { id: 'run', label: 'Verde', rarity: 'Rara' },
  { id: 'swim', label: 'Azul', rarity: 'Rara' },
  { id: 'lift', label: 'Aço', rarity: 'Épica' },
  { id: 'grapple', label: 'Ouro', rarity: 'Épica' },
  { id: 'black', label: 'Obsidiana', rarity: 'Lendária' }
];

// Selos de esporte (emblema do canto), independentes da moldura.
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

// Molduras que, no modelo antigo, também carregavam o emblema do esporte.
const SPORT_FRAMES = ['swim', 'lift', 'grapple', 'run'];
const initialEmblemFor = (u) =>
  u?.emblem !== undefined ? u.emblem : (SPORT_FRAMES.includes(u?.frame) ? u.frame : null);

const Profile = () => {
  const { user, userType, logout, updateUser } = useAuth();
  const [selectedFrame, setSelectedFrame] = useState(user?.frame || 'black');
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [mainSport, setMainSport] = useState(user?.mainSport || 'BJJ');
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [belt, setBelt] = useState(user?.belt || 'Branca');
  const [photo, setPhoto] = useState(user?.photo || null);
  const [selectedEmblem, setSelectedEmblem] = useState(() => initialEmblemFor(user));
  const [showFrames, setShowFrames] = useState(false);

  const myStreak = computeStreak(readActivities(user?.id));

  // Re-sincroniza os campos quando o usuário carrega do armazenamento.
  useEffect(() => {
    if (!user) return;
    setSelectedFrame(user.frame || 'black');
    setSelectedEmblem(initialEmblemFor(user));
    setName(user.name || '');
    setUsername(user.username || '');
    setBio(user.bio || '');
    setMainSport(user.mainSport || 'BJJ');
    setWeight(user.weight || '');
    setHeight(user.height || '');
    setBelt(user.belt || 'Branca');
    setPhoto(user.photo || null);
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Escolha uma imagem (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const SPORTS = ['BJJ', 'Wrestling', 'Corrida', 'Musculação', 'Boxe', 'Luta livre'];

  const stats = {
    student: [
      { label: 'Aulas Frequentadas', value: '47', icon: Calendar },
      { label: 'Progresso Atual', value: '20/60', icon: Trophy },
      { label: 'Avaliação Média', value: '4.8', icon: Star },
      { label: 'Posição no Ranking', value: '#12', icon: Trophy }
    ],
    teacher: [
      { label: 'Aulas Ministradas', value: '156', icon: Calendar },
      { label: 'Alunos Ativos', value: '34', icon: Trophy },
      { label: 'Avaliação Média', value: '4.9', icon: Star },
      { label: 'Anos de Ensino', value: '8', icon: Trophy }
    ],
    academy: [
      { label: 'Alunos Ativos', value: '127', icon: Trophy },
      { label: 'Professores', value: '8', icon: Calendar },
      { label: 'Avaliação Geral', value: '4.8', icon: Star },
      { label: 'Anos de Operação', value: '15', icon: Trophy }
    ]
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre ao Dojo App"
    });
  };

  const handleSaveProfile = () => {
    const cleanUsername = username.replace(/^@+/, '').trim();
    updateUser({
      name,
      username: cleanUsername,
      bio,
      mainSport,
      photo,
      frame: selectedFrame,
      emblem: selectedEmblem,
      ...(userType === 'student' && {
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        belt
      })
    });
    toast({
      title: "Perfil atualizado!",
      description: "Suas alterações foram salvas com sucesso"
    });
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
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-gray-300 capitalize">{userType}</p>
        </div>

        {/* 1. Foto */}
        <div className="text-center">
          <div className="relative inline-block">
            <ShieldProfile
              type={selectedFrame}
              emblem={selectedEmblem}
              hit={myStreak}
              size="large"
              photo={photo}
            />
            <button
              type="button"
              onClick={() => setShowFrames(true)}
              aria-label="Personalizar escudo"
              className="absolute -bottom-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg border-2 border-gray-900"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <label className="inline-block cursor-pointer text-sm text-red-400 hover:text-red-300">
              Trocar foto
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-xl font-bold mt-2">{name}</h2>
          {username && <p className="text-red-400 text-sm">@{username}</p>}
          <p className="text-gray-300 text-sm mt-1">
            {mainSport}{belt ? ` • Faixa ${belt}` : ''}
          </p>
          {bio && <p className="text-gray-300 text-sm mt-2 max-w-xs mx-auto">{bio}</p>}
        </div>

        {/* 2. Bio / Informações */}
        <div className="dojo-card p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Informações Pessoais
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Usuário</label>
              <div className="flex items-center rounded-lg bg-gray-800 border border-gray-600 focus-within:border-red-500">
                <span className="pl-3 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                  placeholder="seunome"
                  className="w-full p-2 bg-transparent focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Modalidade principal</label>
              <select
                value={mainSport}
                onChange={(e) => setMainSport(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Biografia <span className="text-gray-500">({bio.length}/150)</span>
              </label>
              <textarea
                value={bio}
                maxLength={150}
                rows={3}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte quem você é no tatame (emoji liberado)"
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm resize-none"
              />
            </div>

            {userType === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Faixa Atual</label>
                  <select
                    value={belt}
                    onChange={(e) => setBelt(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none text-sm"
                  >
                    <option value="Branca">Branca</option>
                    <option value="Azul">Azul</option>
                    <option value="Roxa">Roxa</option>
                    <option value="Marrom">Marrom</option>
                    <option value="Preta">Preta</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Acompanhar progresso */}
        {userType === 'student' && (
          <div className="dojo-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Progresso para Próxima Faixa
            </h3>
            <ProgressBar
              current={user?.progress || 20}
              max={user?.maxProgress || 60}
              label="aulas"
            />
          </div>
        )}

        {/* 5. Estatísticas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Estatísticas</h3>

          <div className="grid grid-cols-2 gap-4">
            {stats[userType]?.map((stat, index) => (
              <div key={index} className="dojo-card p-4 text-center">
                <stat.icon className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Salvar */}
        <div className="space-y-3">
          <Button
            onClick={handleSaveProfile}
            className="w-full dojo-button"
          >
            Salvar Alterações
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair do App
          </Button>
        </div>
      </motion.div>

      {/* Painel de personalização do escudo */}
      {showFrames && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
          onClick={() => setShowFrames(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="dojo-card w-full max-w-md p-5 space-y-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Personalizar escudo</h3>
              <button onClick={() => setShowFrames(false)} aria-label="Fechar">
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Prévia ao vivo */}
            <div className="flex justify-center">
              <ShieldProfile
                type={selectedFrame}
                emblem={selectedEmblem}
                hit={myStreak}
                size="large"
                photo={photo}
              />
            </div>

            {/* Painel 1: Moldura (lista: cor + raridade) */}
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
                      <span
                        className={`shield-frame shield-${m.id}`}
                        style={{ width: 36, height: 36, margin: 0 }}
                      />
                      <span className="flex-1 text-left font-medium text-sm">{m.label}</span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: RARITY_COLOR[m.rarity] }}
                      >
                        {m.rarity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel 2: Selo de esporte */}
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
                      <ShieldProfile type={selectedFrame} emblem={s.id} size="small" />
                      <span className="text-xs">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              As mudanças aparecem na hora. Toque em "Salvar Alterações" para guardar.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
