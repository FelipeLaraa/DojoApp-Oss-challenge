// Hook central pra ler os treinos do user logado do Supabase.
// Centraliza o fetch + estado + loading pra consumidores não lerem
// localStorage direto nem reimplementarem o padrão async.
//
// Uso:
//   const { activities, loading, refresh } = useActivities(user?.id);
//
// Depois de um addActivity novo, chama refresh() pra re-puxar.

import { useCallback, useEffect, useState } from 'react';
import { readActivities } from '@/lib/activity';

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

  return { activities, loading, refresh };
};
