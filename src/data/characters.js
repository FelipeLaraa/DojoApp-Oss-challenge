// Personagens fictícios do dojo — originais, para testes e demonstração.
// Estrutura pensada para crescer: no futuro cada um ganha experiências,
// expertise e histórico próprios.
//
// NOTA (Etapa 1 Supabase, 10/2026): a entrada rápida por personagem saiu
// do Login — agora só autenticação real por e-mail/senha. Estes personagens
// seguem ATIVOS como amigos fictícios do feed, perfis públicos (/athlete/:id)
// e demonstração visual, até que friendships reais sejam criadas no banco
// (próxima etapa). Felipe pode re-expor como "modo demo" se quiser.
//
// month: array de 30 booleanos, índice 0 = 30 dias atrás, índice 29 = hoje.
// milestone: { days, hitAt } marco de sequência mais recente (ISO string).
//   Marcos válidos: 7, 14, 30, 50, 100, 365.

const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
};

const hoursAgoISO = (h) => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

// Gera um dataURL SVG com gradiente vertical + emoji grande centralizado.
// Serve como foto "fake" do último treino enquanto não há backend.
const gradientPhoto = (from, to, emoji) => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 700'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/>` +
    `<stop offset='1' stop-color='${to}'/>` +
    `</linearGradient></defs>` +
    `<rect width='400' height='700' fill='url(%23g)'/>` +
    `<text x='200' y='380' font-size='220' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, '%23')}`;
};

export const characters = [
  {
    id: 'felipe',
    username: 'felipe',
    mainSport: 'BJJ',
    name: 'Felipe',
    role: 'veteran',
    roleLabel: 'O Veterano',
    belt: 'Preta',
    frame: 'black',
    years: 18,
    modality: 'BJJ',
    classesAttended: 2140,
    weight: 84,
    height: 180,
    bio: 'O mestre do dojo. Calmo porque não precisa provar nada.',
    emblem: 'grapple',
    streak: 42,
    week: [true, true, true, true, true, true, true],
    month: [
      true, true, true, true, true, true, true,
      true, true, true, true, true, true, true,
      true, true, true, true, true, true, true,
      true, true, true, true, true, true, true, true, true
    ],
    milestone: { days: 30, hitAt: daysAgoISO(12) },
    reactions: { Fogo: 12, 'Força': 5, Cutucar: 2 },
    activity: { headline: 'Determinado', detail: '4 dias na semana com check-in' }
  },
  {
    id: 'thiago',
    username: 'thiago',
    mainSport: 'Wrestling',
    name: 'Thiago',
    role: 'prodigy',
    roleLabel: 'O Prodígio',
    belt: 'Roxa',
    frame: 'coral',
    years: 4,
    modality: 'BJJ',
    classesAttended: 460,
    weight: 72,
    height: 176,
    bio: 'Jovem talento subindo rápido. Vence no instinto.',
    emblem: 'grapple',
    streak: 12,
    week: [false, true, true, false, true, true, false],
    // ~16/30 — densidade média
    month: [
      false, true, true, false, true, true, false,
      true, false, true, false, true, true, false,
      true, false, true, true, false, true, true,
      false, true, true, false, true, true, false, true, true
    ],
    milestone: { days: 7, hitAt: daysAgoISO(5) },
    reactions: { Fogo: 7, 'Força': 3, Cutucar: 1 },
    activity: { headline: 'Eclético', detail: '3 modalidades diferentes este mês' },
    lastPhoto: { url: gradientPhoto('#ff7a59', '#f4502f', '🥋'), postedAt: hoursAgoISO(24) }
  },
  {
    id: 'nicole',
    username: 'nicole',
    mainSport: 'Corrida',
    name: 'Nicole',
    role: 'strategist',
    roleLabel: 'A Estrategista',
    belt: 'Marrom',
    frame: 'white',
    years: 9,
    modality: 'BJJ',
    classesAttended: 1120,
    weight: 63,
    height: 168,
    bio: 'A mente técnica. Não é a mais forte, é a que lê o jogo.',
    emblem: 'run',
    streak: 23,
    week: [true, true, false, true, true, true, true],
    // ~24/30 — densidade alta, bate com streak de 23
    month: [
      true, true, false, true, true, true, true,
      false, true, true, true, true, true, true,
      true, true, true, true, true, false, true,
      true, true, true, true, true, true, true, true, true
    ],
    milestone: { days: 14, hitAt: daysAgoISO(9) },
    reactions: { Fogo: 9, 'Força': 4, Cutucar: 0 },
    activity: { headline: '50 km', detail: 'percorridos este mês' },
    lastPhoto: { url: gradientPhoto('#d4af37', '#8b6f1f', '🏃'), postedAt: hoursAgoISO(3) }
  },
  {
    id: 'ciclano',
    username: 'ciclano',
    mainSport: 'Musculação',
    name: 'Ciclano',
    role: 'beginner',
    roleLabel: 'O Iniciante',
    belt: 'Branca',
    frame: 'black',
    years: 1,
    modality: 'BJJ',
    classesAttended: 38,
    weight: 78,
    height: 175,
    bio: 'Começando do zero, com garra e fome de evoluir.',
    emblem: 'lift',
    streak: 0,
    week: [false, true, false, false, false, false, false],
    // ~2/30 — densidade baixa (sumido)
    month: [
      false, true, false, false, false, false, false,
      false, false, true, false, false, false, false,
      false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false, false
    ],
    milestone: null,
    reactions: { Fogo: 1, 'Força': 0, Cutucar: 3 },
    activity: { headline: 'Inativo', detail: 'sem treinos recentes', inactive: true },
    lastPhoto: { url: gradientPhoto('#3a3a3a', '#1a1a1a', '🏋'), postedAt: daysAgoISO(5) }
  }
];
