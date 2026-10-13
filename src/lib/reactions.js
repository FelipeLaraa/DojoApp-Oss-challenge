// Contador de reações (demonstração, até o backend).
// Base fixa vem do personagem (character.reactions); os incrementos do usuário
// ficam em localStorage e somam por cima. Compartilhado de verdade só com backend.

const KEY = 'dojoReactionDeltas';
const EMPTY = { Fogo: 0, 'Força': 0, Cutucar: 0 };

// Limite de reações por amigo, por dia (reseta todo dia).
export const LIMITS = { Fogo: 1, 'Força': 1, Cutucar: 3 };

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const sentKey = (userId) => `dojoReactSent_${userId}`;

// Quantas reações de cada tipo o usuário já mandou para esse amigo HOJE.
export const sentToday = (userId, friendId) => {
  if (!userId || !friendId) return { ...EMPTY };
  try {
    const store = JSON.parse(localStorage.getItem(sentKey(userId)) || '{}');
    const day = store[todayKey()] || {};
    return { ...EMPTY, ...(day[friendId] || {}) };
  } catch {
    return { ...EMPTY };
  }
};

export const canReact = (userId, friendId, type) =>
  (sentToday(userId, friendId)[type] || 0) < (LIMITS[type] || 0);

// Registra uma reação enviada hoje (guarda só o dia atual para não crescer).
export const recordSent = (userId, friendId, type) => {
  if (!userId || !friendId || !type) return;
  try {
    const today = todayKey();
    const store = JSON.parse(localStorage.getItem(sentKey(userId)) || '{}');
    const day = { ...(store[today] || {}) };
    day[friendId] = { ...(day[friendId] || {}) };
    day[friendId][type] = (day[friendId][type] || 0) + 1;
    localStorage.setItem(sentKey(userId), JSON.stringify({ [today]: day }));
  } catch {
    // Armazenamento indisponível: sem controle de limite.
  }
};

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

// Total exibido = base do personagem + incrementos locais.
export const reactionCounts = (character) => {
  const base = character?.reactions || EMPTY;
  const delta = (character?.id && readAll()[character.id]) || {};
  return {
    Fogo: (base.Fogo || 0) + (delta.Fogo || 0),
    'Força': (base['Força'] || 0) + (delta['Força'] || 0),
    Cutucar: (base.Cutucar || 0) + (delta.Cutucar || 0)
  };
};

// Soma 1 na reação daquele amigo e persiste.
export const bumpReaction = (friendId, type) => {
  if (!friendId || !type) return;
  try {
    const all = readAll();
    all[friendId] = all[friendId] || {};
    all[friendId][type] = (all[friendId][type] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Armazenamento indisponível: contador segue só com a base.
  }
};
