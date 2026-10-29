// Notificações — persistidas no Supabase (tabela `notifications`).
// Shape mantido retrocompatível com o modelo antigo em localStorage:
//   { id, from, fromId, item, message, date, type, activityId, readAt }
// mapeado a partir das colunas snake_case + embed de profiles para resolver
// o nome do remetente (`from_profile.name`).
//
// Padrão idêntico ao `activity.js`: async + event bus pra consumidores
// (useNotifications) re-fetcharem quando algo é gravado em outra tela.

import { supabase } from '@/lib/supabase';

export const NOTIFICATIONS_CHANGED_EVENT = 'dojo:notifications-changed';
const notifyChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
};

// Mapeia uma linha do Supabase pro shape que o front já consome.
const mapRow = (row) => ({
  id: row.id,
  from: row.from_profile?.name || null,
  fromId: row.from_user_id,
  item: row.item,
  message: row.message,
  type: row.type,
  activityId: row.activity_id,
  data: row.data,
  readAt: row.read_at,
  date: row.created_at,
});

// Deriva o `type` do check constraint a partir do `item` quando o chamador
// não especifica — reaproveita os rótulos que o painel já exibe.
const defaultTypeFor = (item) => {
  if (!item) return 'incentive';
  if (item === 'Fogo' || item === 'Força' || item === 'Cutucar') return 'reaction';
  if (item === 'Parabéns' || item === 'Marco') return 'milestone';
  if (item === 'Resposta') return 'reply';
  return 'incentive';
};

// Lê as notificações do user, mais recentes primeiro. Embute o nome do
// remetente via join com profiles pra evitar segunda query no front.
export const readNotifications = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, from_profile:profiles!from_user_id(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('readNotifications error:', error.message);
      return [];
    }
    return (data || []).map(mapRow);
  } catch (err) {
    console.warn('readNotifications exception:', err);
    return [];
  }
};

// Insere uma notificação pra outro user. Retorna a entrada mapeada em sucesso,
// null em erro (RLS exige authenticated; a trava diária de reações continua
// no front por enquanto).
export const addNotification = async (
  userId,
  { fromUserId, type, item, message, activityId, data } = {}
) => {
  if (!userId) return null;
  const payload = {
    user_id: userId,
    from_user_id: fromUserId || null,
    type: type || defaultTypeFor(item),
    item: item || null,
    message: message ? String(message).slice(0, 240) : null,
    activity_id: activityId || null,
    data: data || null,
  };
  try {
    const { data: row, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select('*, from_profile:profiles!from_user_id(name)')
      .single();
    if (error) {
      console.warn('addNotification error:', error.message);
      return null;
    }
    notifyChanged();
    return mapRow(row);
  } catch (err) {
    console.warn('addNotification exception:', err);
    return null;
  }
};

// Marca todas as não-lidas do user como lidas (read_at = agora).
export const markAllRead = async (userId) => {
  if (!userId) return;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
    if (error) {
      console.warn('markAllRead error:', error.message);
      return;
    }
    notifyChanged();
  } catch (err) {
    console.warn('markAllRead exception:', err);
  }
};
