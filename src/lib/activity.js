// Registro de treinos — agora persistido no Supabase (tabela `activities`).
// Fotos vão pro bucket `training-photos` em <user_id>/<timestamp>.jpg.
//
// Shape mantido retrocompatível com o modelo antigo em localStorage:
//   { date, sport, durationMin, distanceKm, comment, mood, photo }
// mapeado a partir das colunas snake_case (created_at, duration_min, etc).
//
// readActivities e addActivity agora são async. Os helpers puros (dayKey,
// computeStreak, weekTrained, todaySessions, trainedToday) continuam
// síncronos — operam sobre o array já carregado.

import { supabase } from '@/lib/supabase';

// Bus leve pra notificar consumidores (useActivities) que a lista mudou.
// Evita que cada tela precise saber manualmente quando re-fetchar depois
// que alguém grava um treino em outra tela.
export const ACTIVITIES_CHANGED_EVENT = 'dojo:activities-changed';
const notifyActivitiesChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ACTIVITIES_CHANGED_EVENT));
};

// Chave de dia no fuso local (YYYY-MM-DD), para a sequência casar com o "hoje"
// que o usuário enxerga no aparelho.
export const dayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Mapeia uma linha do Supabase pro shape que o resto do app consome.
const mapRow = (row) => ({
  id: row.id,
  date: row.created_at,
  sport: row.sport,
  durationMin: row.duration_min != null ? Number(row.duration_min) : null,
  distanceKm: row.distance_km != null ? Number(row.distance_km) : null,
  comment: row.comment,
  mood: row.mood,
  photo: row.photo_url
});

// Lê os treinos do user, mais recente primeiro. Retorna [] em qualquer erro.
export const readActivities = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('readActivities error:', error.message);
      return [];
    }
    return (data || []).map(mapRow);
  } catch (err) {
    console.warn('readActivities exception:', err);
    return [];
  }
};

// Fração aproximada de uso do localStorage. Mantido como stub (sempre 0)
// pra código legado que ainda chama — agora o storage é remoto, limite irrelevante.
export const storageUsageRatio = () => 0;

// Converte um dataURL ("data:image/jpeg;base64,...") em Blob pra upload.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

// Faz upload da foto de treino, retorna a URL pública (ou null em erro).
// Caminho: <user_id>/<timestamp>-<rand>.jpg (RLS exige folder = auth.uid()).
const uploadTrainingPhoto = async (userId, photo) => {
  if (!photo) return null;
  // Se já é uma URL http(s), passa direto — nada a fazer.
  if (typeof photo === 'string' && /^https?:/i.test(photo)) return photo;
  if (typeof photo !== 'string' || !photo.startsWith('data:')) return null;

  try {
    const blob = await dataUrlToBlob(photo);
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${userId}/${Date.now()}-${rand}.jpg`;
    const { error: upErr } = await supabase.storage
      .from('training-photos')
      .upload(path, blob, { upsert: false, contentType: 'image/jpeg' });
    if (upErr) {
      console.warn('training photo upload failed:', upErr.message);
      return null;
    }
    const { data } = supabase.storage.from('training-photos').getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (err) {
    console.warn('training photo upload exception:', err);
    return null;
  }
};

// Grava um treino no Supabase. Retorna a entry mapeada em sucesso, ou null em erro.
// Campos opcionais sem suporte no schema atual (local, positions, partner,
// rolls, submissions, caught, note) são aceitos mas ignorados — ficam pra
// uma migração futura.
export const addActivity = async (
  userId,
  { sport, durationMin, distanceKm, comment, mood, photo } = {}
) => {
  if (!userId) return null;

  const toInt = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const toFloat = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  // Upload da foto PRIMEIRO. Se falhar, continua sem foto (não quebra o registro).
  const photoUrl = await uploadTrainingPhoto(userId, photo);

  const payload = {
    user_id: userId,
    sport: sport || null,
    duration_min: toInt(durationMin),
    distance_km: toFloat(distanceKm),
    comment: comment ? String(comment).slice(0, 240) : null,
    mood: mood || null,
    photo_url: photoUrl
  };

  try {
    const { data, error } = await supabase
      .from('activities')
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.warn('addActivity error:', error.message);
      return null;
    }
    const entry = mapRow(data);
    notifyActivitiesChanged();
    return entry;
  } catch (err) {
    console.warn('addActivity exception:', err);
    return null;
  }
};

// Sequência atual: dias consecutivos com pelo menos um treino, terminando hoje.
// Treinou hoje → conta hoje. Não treinou hoje mas treinou ontem → sequência
// segue viva (encerrando ontem) até o fim do dia de hoje. Senão, zero.
export const computeStreak = (activities) => {
  if (!activities || activities.length === 0) return 0;

  const days = new Set(activities.map((a) => dayKey(a.date)));

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let cursor;
  if (days.has(dayKey(today))) {
    cursor = today;
  } else if (days.has(dayKey(yesterday))) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

// Últimos n dias (mais antigo → hoje): true em cada dia com pelo menos um treino.
export const weekTrained = (activities, n = 7) => {
  const days = new Set((activities || []).map((a) => dayKey(a.date)));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(days.has(dayKey(d)));
  }
  return out;
};

// Todas as sessões cujo dia local bate com "hoje". Pode retornar vazio.
export const todaySessions = (activities) => {
  if (!activities || activities.length === 0) return [];
  const today = dayKey(new Date());
  return activities.filter((a) => dayKey(a.date) === today);
};

export const trainedToday = (activities) => {
  if (!activities || activities.length === 0) return false;
  const today = dayKey(new Date());
  return activities.some((a) => dayKey(a.date) === today);
};
