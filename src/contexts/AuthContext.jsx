import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { migrateLegacyActivities } from '@/lib/activityMigration';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mapeia a linha de public.profiles (snake_case) para a forma usada no app
// (camelCase, igual ao modelo antigo em localStorage).
const normalizeProfile = (row) =>
  row
    ? {
        id: row.id,
        username: row.username,
        name: row.name,
        bio: row.bio,
        mainSport: row.main_sport,
        belt: row.belt,
        weight: row.weight,
        height: row.height,
        frame: row.frame,
        emblem: row.emblem,
        photo: row.photo_url,
        roleLabel: row.role_label,
        nextWorkout: row.next_workout,
      }
    : null;

// Converte os nomes camelCase que o app usa para as colunas snake_case do DB.
const CAMEL_TO_SNAKE = {
  mainSport: 'main_sport',
  photo: 'photo_url',
  roleLabel: 'role_label',
  nextWorkout: 'next_workout',
};

const toSnakePayload = (fields) => {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    const dbKey = CAMEL_TO_SNAKE[key] ?? key;
    out[dbKey] = value;
  }
  return out;
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (id) => {
    if (!id) {
      setProfile(null);
      return null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.warn('fetchProfile error:', error.message);
      setProfile(null);
      return null;
    }
    const normalized = normalizeProfile(data);
    setProfile(normalized);
    return normalized;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authUser?.id) return null;
    return await fetchProfile(authUser.id);
  }, [authUser?.id, fetchProfile]);

  useEffect(() => {
    // Carrega sessão persistida (se houver) no mount.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setAuthUser(u);
      if (u) {
        await fetchProfile(u.id);
        // Migração silenciosa de treinos localStorage → Supabase (one-shot).
        migrateLegacyActivities(u.id);
      }
      setLoading(false);
    });

    // Reage a login/logout em qualquer aba.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setAuthUser(u);
      if (u) {
        await fetchProfile(u.id);
        migrateLegacyActivities(u.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [fetchProfile]);

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

  // Agora é um update real em public.profiles. Aceita camelCase (mesmas chaves
  // do modelo antigo em localStorage) e grava em snake_case no DB.
  const updateUser = async (fields) => {
    if (!authUser) return { error: new Error('not signed in') };
    const payload = {
      ...toSnakePayload(fields),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', authUser.id);
    if (!error) {
      await refreshProfile();
    } else {
      console.warn('updateUser error:', error.message);
    }
    return { error };
  };

  // user combinado: auth (id, email, metadata) + profile (name, bio, frame, ...).
  // Mantém backward-compat com os componentes que ainda leem user.name, user.frame etc.
  const user = authUser ? { ...authUser, ...(profile ?? {}), id: authUser.id } : null;

  const value = {
    user,
    profile,
    // Enquanto só existe o perfil aluno, exponho userType fixo pra não quebrar
    // Profile.jsx e BottomNav.jsx que ainda leem esse valor.
    userType: user ? 'student' : null,
    loading,
    signUp,
    signIn,
    signOut,
    // Aliases de compatibilidade com código antigo que chamava logout().
    logout: signOut,
    updateUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
