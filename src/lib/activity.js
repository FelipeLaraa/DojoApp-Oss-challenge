// Registro de treinos por perfil, em localStorage (provisório até o backend).
// Chave: dojoActivities_<userId> → array de { date, sport, durationMin, note }.

const keyFor = (userId) => `dojoActivities_${userId}`;

// Chave de dia no fuso local (YYYY-MM-DD), para a sequência casar com o "hoje"
// que o usuário enxerga no aparelho.
export const dayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const readActivities = (userId) => {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || '[]');
  } catch {
    return [];
  }
};

// Fração aproximada de uso do localStorage (0..1+). O limite típico de um
// navegador é ~5 MB por origem; usamos isso como base de referência.
export const storageUsageRatio = () => {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      total += k.length + v.length;
    }
    return total / (5 * 1024 * 1024);
  } catch {
    return 0;
  }
};

// Grava um treino. Retorna a lista atualizada (ou null se o armazenamento encheu).
// Campos novos (local, mood, positions, partner, rolls, submissions, caught)
// são todos opcionais e salvam null quando vazios.
export const addActivity = (
  userId,
  {
    sport,
    durationMin,
    distanceKm,
    note,
    photo,
    local,
    comment,
    mood,
    positions,
    partner,
    rolls,
    submissions,
    caught
  } = {}
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
  const entry = {
    date: new Date().toISOString(),
    sport: sport || null,
    durationMin: durationMin ? Number(durationMin) : null,
    distanceKm: toFloat(distanceKm),
    note: note ? String(note).slice(0, 240) : null,
    photo: photo || null,
    local: local ? String(local).slice(0, 80) : null,
    comment: comment ? String(comment).slice(0, 240) : null,
    mood: mood || null,
    positions: Array.isArray(positions) && positions.length ? positions.slice(0, 20) : null,
    partner: partner && partner.name ? { name: String(partner.name), belt: partner.belt || null } : null,
    rolls: toInt(rolls),
    submissions: toInt(submissions),
    caught: toInt(caught)
  };
  const list = [entry, ...readActivities(userId)];
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(list));
    return list;
  } catch {
    // localStorage cheio ou indisponível.
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
// Alimenta a tira de frequência da Home.
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
// Usado pra agregar visualmente múltiplos registros do mesmo dia.
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
