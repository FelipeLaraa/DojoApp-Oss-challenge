// Hook central pra ler os treinos do user logado do Supabase.
// Centraliza o fetch + estado + loading pra consumidores não lerem
// localStorage direto nem reimplementarem o padrão async.
//
// Uso:
//   const { activities, loading, refresh } = useActivities(user?.id);
//
// Re-fetcha automaticamente quando:
//   - o userId muda / monta
//   - alguém grava um novo treino em qualquer tela (evento global)
//   - a aba volta ao foco (visibilitychange) — pega mudanças de outra sessão
//
// refresh() ainda é exposto pra uso manual.

import { useCallback, useEffect, useState } from 'react';
import { readActivities, ACTIVITIES_CHANGED_EVENT } from '@/lib/activity';

export const useActivities = (userId) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const list = await readActivities(userId);
    setActivities(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const onChanged = () => refresh();
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    window.addEventListener(ACTIVITIES_CHANGED_EVENT, onChanged);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(ACTIVITIES_CHANGED_EVENT, onChanged);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, refresh]);

  return { activities, loading, refresh };
};
