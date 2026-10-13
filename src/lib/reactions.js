// Contador de reações (demonstração, até o backend).
// Base fixa vem do personagem (character.reactions); os incrementos do usuário
// ficam em localStorage e somam por cima. Compartilhado de verdade só com backend.

const KEY = 'dojoReactionDeltas';
const EMPTY = { Fogo: 0, 'Força': 0, Cutucar: 0 };

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
