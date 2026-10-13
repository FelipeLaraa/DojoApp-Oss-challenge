import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, GraduationCap, Building2 } from 'lucide-react';
import { characters } from '@/data/characters';
import ShieldProfile from '@/components/ShieldProfile';

const Login = () => {
  const [selectedType, setSelectedType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const userTypes = [
    { id: 'student', label: 'Aluno', icon: User, route: '/student' },
    { id: 'teacher', label: 'Professor', icon: GraduationCap, route: '/teacher' },
    { id: 'academy', label: 'Academia', icon: Building2, route: '/academy' }
  ];

  // Carrega o que foi salvo de cada personagem (foto, moldura, faixa) para a
  // entrada rápida refletir o perfil atual, não os dados fixos iniciais.
  const mergeSaved = (character) => {
    try {
      const saved = localStorage.getItem(`dojoProfile_${character.id}`);
      return saved ? { ...character, ...JSON.parse(saved) } : character;
    } catch {
      return character;
    }
  };

  const displayCharacters = characters.map(mergeSaved);

  const handleCharacterLogin = (character) => {
    // Se esse perfil já foi editado antes, carrega o que foi salvo (foto, etc.).
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    const userData = saved ? JSON.parse(saved) : {
      id: character.id,
      name: character.name,
      email: `${character.id}@dojo.app`,
      belt: character.belt,
      frame: character.frame,
      years: character.years,
      weight: character.weight,
      height: character.height,
      modality: character.modality,
      classesAttended: character.classesAttended,
      bio: character.bio,
      roleLabel: character.roleLabel,
      progress: 20,
      maxProgress: 60
    };
    login(userData, 'student');
    navigate('/student');
    toast({
      title: `Bem-vindo, ${character.name}!`,
      description: character.roleLabel
    });
  };

  const handleLogin = () => {
    if (!selectedType || !email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive"
      });
      return;
    }

    const userData = {
      id: Date.now(),
      email,
      name: email.split('@')[0],
      belt: selectedType === 'student' ? 'Branca' : null,
      years: selectedType === 'student' ? 1 : 5,
      weight: selectedType === 'student' ? 70 : null,
      height: selectedType === 'student' ? 175 : null,
      progress: selectedType === 'student' ? 20 : null,
      maxProgress: selectedType === 'student' ? 60 : null
    };

    login(userData, selectedType);
    
    const selectedRoute = userTypes.find(type => type.id === selectedType)?.route;
    navigate(selectedRoute);
    
    toast({
      title: "Login realizado!",
      description: `Bem-vindo ao Dojo App!`
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
          <span className="text-3xl font-bold text-white">道</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Dojo App</h1>
        <p className="text-gray-300">Academia de Artes Marciais</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Entrada rápida (demonstração)</label>
          <div className="grid grid-cols-4 gap-2">
            {displayCharacters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleCharacterLogin(character)}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-700 hover:border-red-500 hover:bg-red-500/10 transition-all"
              >
                <ShieldProfile type={character.frame} emblem={character.emblem} hit={character.streak} size="small" photo={character.photo} />
                <span className="text-xs mt-2 font-medium">{character.name}</span>
                <span className="text-[10px] text-gray-400">{character.belt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-xs text-gray-500">ou entre manualmente</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Usuário</label>
          <div className="grid grid-cols-3 gap-3">
            {userTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === type.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <type.icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full dojo-button text-lg py-4"
        >
          Entrar no Dojo
        </Button>

        <div className="text-center text-sm text-gray-400">
          <p>Primeira vez? Use qualquer email e senha para testar</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;