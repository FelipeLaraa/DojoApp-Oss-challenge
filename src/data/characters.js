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
// HISTÓRICO MOCK (10/2026): cada personagem agora tem `activities` com ~180
// dias de treinos sintéticos. Permite usar o mesmo YearHeatmap (6 meses, 3
// tons, DaySheet) do perfil próprio nos perfis públicos — paridade visual.
// `month` fica derivado dos últimos 30 dias de activities (compat com código
// que ainda consome o shape antigo: Friends/Ranking/MilestoneCard).
//
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

// PRNG seedado (Mulberry32) — garante que o mock é determinístico por
// personagem, mas varia entre eles.
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const MOODS = ['exausto', 'sofreu', 'em alta', 'leve', 'técnico'];

// Gera activities sintéticas pros últimos `days` dias.
// pattern: { frequency: 0..1, sports: [...], durationRange: [min,max],
//            distanceRange?: [min,max], doubleChance: 0..1, seed }
const synthActivities = ({
  id,
  days = 180,
  frequency,
  sports,
  durationRange,
  distanceRange,
  doubleChance = 0,
  seed
}) => {
  const rand = mulberry32(seed);
  const out = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    if (rand() > frequency) continue;

    const makeSession = (hour, min) => {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(hour, min, 0, 0);
      const sport = sports[Math.floor(rand() * sports.length)];
      const [dMin, dMax] = durationRange;
      const durationMin = Math.round(dMin + rand() * (dMax - dMin));
      const activity = {
        id: `${id}-${d.getTime()}`,
        date: d.toISOString(),
        sport,
        durationMin,
        distanceKm: null,
        mood: rand() < 0.35 ? MOODS[Math.floor(rand() * MOODS.length)] : null,
        comment: null,
        photo: null
      };
      if (distanceRange && (sport === 'Corrida' || sport === 'Natação')) {
        const [kmMin, kmMax] = distanceRange;
        activity.distanceKm = +(kmMin + rand() * (kmMax - kmMin)).toFixed(1);
      }
      return activity;
    };

    // Horário "típico" varia por personagem via seed. Manhã 6-8, meio-dia
    // 12-13, noite 18-21.
    const slot = rand();
    let hour;
    if (slot < 0.4) hour = 6 + Math.floor(rand() * 3);
    else if (slot < 0.55) hour = 12 + Math.floor(rand() * 2);
    else hour = 18 + Math.floor(rand() * 4);
    const minute = Math.floor(rand() * 60);
    out.push(makeSession(hour, minute));

    // Dia duplo
    if (rand() < doubleChance) {
      const h2 = hour < 12 ? 18 + Math.floor(rand() * 3) : 6 + Math.floor(rand() * 3);
      out.push(makeSession(h2, Math.floor(rand() * 60)));
    }
  }

  // Mais recente primeiro (compat com readActivities)
  return out.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Deriva month[30] dos últimos 30 dias de activities — mantém API antiga.
const monthFromActivities = (activities) => {
  const now = new Date();
  const bucket = new Set();
  activities.forEach((a) => {
    const d = new Date(a.date);
    const diff = Math.floor((now - d) / (24 * 3600 * 1000));
    if (diff >= 0 && diff < 30) bucket.add(29 - diff);
  });
  return Array.from({ length: 30 }, (_, i) => bucket.has(i));
};

// Deriva week[7] — mesmo princípio.
const weekFromActivities = (activities) => {
  const now = new Date();
  const bucket = new Set();
  activities.forEach((a) => {
    const d = new Date(a.date);
    const diff = Math.floor((now - d) / (24 * 3600 * 1000));
    if (diff >= 0 && diff < 7) bucket.add(6 - diff);
  });
  return Array.from({ length: 7 }, (_, i) => bucket.has(i));
};

// Felipe: veterano consistente (~5x/sem BJJ, dias duplos ocasionais)
const felipeActivities = synthActivities({
  id: 'felipe',
  frequency: 0.72,
  sports: ['BJJ', 'Wrestling', 'Musculação'],
  durationRange: [60, 110],
  doubleChance: 0.12,
  seed: 101
});

// Thiago: powerlifter 4-5x/sem com duplos esporádicos
const thiagoActivities = synthActivities({
  id: 'thiago',
  frequency: 0.65,
  sports: ['Musculação', 'Wrestling', 'BJJ'],
  durationRange: [50, 100],
  doubleChance: 0.18,
  seed: 202
});

// Nicole: corredora 3x/sem consistente
const nicoleActivities = synthActivities({
  id: 'nicole',
  frequency: 0.55,
  sports: ['Corrida', 'Musculação', 'BJJ'],
  durationRange: [35, 75],
  distanceRange: [4, 12],
  doubleChance: 0.05,
  seed: 303
});

// Ciclano: 2-3x/sem irregular, com furos de semanas
const ciclanoActivities = synthActivities({
  id: 'ciclano',
  frequency: 0.3,
  sports: ['Musculação', 'BJJ'],
  durationRange: [40, 80],
  doubleChance: 0.02,
  seed: 404
});

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
    activities: felipeActivities,
    week: weekFromActivities(felipeActivities),
    month: monthFromActivities(felipeActivities),
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
    activities: thiagoActivities,
    week: weekFromActivities(thiagoActivities),
    month: monthFromActivities(thiagoActivities),
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
    activities: nicoleActivities,
    week: weekFromActivities(nicoleActivities),
    month: monthFromActivities(nicoleActivities),
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
    activities: ciclanoActivities,
    week: weekFromActivities(ciclanoActivities),
    month: monthFromActivities(ciclanoActivities),
    milestone: null,
    reactions: { Fogo: 1, 'Força': 0, Cutucar: 3 },
    activity: { headline: 'Inativo', detail: 'sem treinos recentes', inactive: true },
    lastPhoto: { url: gradientPhoto('#3a3a3a', '#1a1a1a', '🏋'), postedAt: daysAgoISO(5) }
  }
];
