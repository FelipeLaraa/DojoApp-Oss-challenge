// Hook central pra ler as notificações do user logado do Supabase.
// Centraliza o fetch + estado + unreadCount + markAllRead pra consumidores
// não lerem o banco direto nem reimplementarem o padrão async.
//
// Uso:
//   const { notifications, unreadCount, markAllRead, refetch } =
//     useNotifications(user?.id);
//
// Re-fetcha automaticamente quando:
//   - o userId muda / monta
//   - alguém grava uma nova notificação em qualquer tela (evento global)
//   - a aba volta ao foco (visibilitychange) — pega mudanças de outra sessão

import { useCallback, useEffect, useState } from 'react';
import {
  readNotifications,
  markAllRead as markAllReadRemote,
  NOTIFICATIONS_CHANGED_EVENT,
} from '@/lib/notifications';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(!!userId);

  const refetch = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const list = await readNotifications(userId);
    setNotifications(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!userId) return;
    const onChanged = () => refetch();
    const onVisible = () => {
      if (!document.hidden) refetch();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, refetch]);

  // Marca todas as não-lidas como lidas no banco e atualiza o estado local
  // otimisticamente — o badge zera sem esperar o refetch do evento.
  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: now }))
    );
    await markAllReadRemote(userId);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return { notifications, unreadCount, markAllRead, refetch, loading };
};
