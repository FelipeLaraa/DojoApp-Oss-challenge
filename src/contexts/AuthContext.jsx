import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega sessão persistida (se houver) no mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Reage a login/logout em qualquer aba.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async ({ email, password, name, username }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username },
      },
    });
    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Stub temporário — a tela de Profile ainda chama isso. Até a Etapa 2
  // (integração da tabela public.profiles), só evita quebrar a UI.
  const updateUser = (_fields) => {
    // TODO (etapa 2): escrever em public.profiles e refletir no state.
    console.warn('updateUser is a stub until profiles table integration is done');
  };

  const value = {
    user,
    // Enquanto só existe o perfil aluno, exponho userType fixo pra não quebrar
    // Profile.jsx e BottomNav.jsx que ainda leem esse valor. Sai na Etapa 2.
    userType: user ? 'student' : null,
    loading,
    signUp,
    signIn,
    signOut,
    // Aliases de compatibilidade com código antigo que chamava logout().
    logout: signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
