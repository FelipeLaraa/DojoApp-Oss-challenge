import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const USERNAME_RE = /^[a-z0-9_]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const showError = (title, description) => {
    toast({ title, description, variant: 'destructive' });
  };

  const validateSignUp = () => {
    if (!name.trim()) return 'Informe seu nome.';
    if (!USERNAME_RE.test(username) || username.length < 3) {
      return '@usuário: só minúsculas, números e _ (mínimo 3 caracteres).';
    }
    if (!EMAIL_RE.test(email)) return 'E-mail inválido.';
    if (password.length < 8) return 'Senha precisa ter pelo menos 8 caracteres.';
    if (password !== confirm) return 'As senhas não conferem.';
    return null;
  };

  const validateSignIn = () => {
    if (!EMAIL_RE.test(email)) return 'E-mail inválido.';
    if (!password) return 'Informe a senha.';
    return null;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const err = mode === 'signup' ? validateSignUp() : validateSignIn();
    if (err) {
      showError('Confira os campos', err);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp({
          email: email.trim(),
          password,
          name: name.trim(),
          username: username.trim().toLowerCase(),
        });
        if (error) {
          showError('Não foi possível criar a conta', error.message);
          return;
        }
        toast({
          title: 'Conta criada!',
          description: 'Confira seu e-mail se o Supabase pedir confirmação.',
        });
        navigate('/student');
      } else {
        const { error } = await signIn({ email: email.trim(), password });
        if (error) {
          showError('Falha ao entrar', error.message);
          return;
        }
        navigate('/student');
      }
    } catch (e) {
      showError('Erro inesperado', e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const isSignUp = mode === 'signup';

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
        <p className="text-gray-300">Hub social de atividade física</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-5 max-w-sm w-full mx-auto"
      >
        {/* Toggle entre Entrar / Criar conta */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 rounded-md text-sm font-medium transition ${
              !isSignUp ? 'bg-red-500 text-white' : 'text-gray-300'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-md text-sm font-medium transition ${
              isSignUp ? 'bg-red-500 text-white' : 'text-gray-300'
            }`}
          >
            Criar conta
          </button>
        </div>

        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none"
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">@usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none"
                placeholder="felipe_lara"
                autoComplete="username"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none"
            placeholder="seu@email.com"
            autoComplete="email"
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
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium mb-2">Confirmar senha</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-500 focus:outline-none"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full dojo-button text-lg py-4"
        >
          {submitting ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar no Dojo'}
        </Button>
      </motion.div>
    </div>
  );
};

export default Login;
