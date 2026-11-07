# DojoApp — Manual do Projeto

Lido automaticamente por qualquer sessão que abrir o projeto. Dá o contexto e as
regras de trabalho. Leia antes de agir.

## O que é o DojoApp (visão atual)

Hub social de atividade física, B2C, estilo Gym Rats + Strava. Nasceu como app de
academia de artes marciais (BJJ/Wrestling), mas pivotou para conectar amigos e
suas atividades — com expansão para qualquer modalidade (corrida, musculação,
natação, etc.).

Princípio central: NÃO competir com Instagram. Nada de posts, fotos editadas,
curtidas ou palco. O feed é de atividade automática (nasce do treino) + incentivo
entre amigos (accountability do grupo). O valor é cobrança e apoio, não vaidade.

Futuro possível: juntar o lado social (amigo-pra-amigo) com check-in em academias
(estilo Wellhub). O foco ATUAL é o B2C social.

## Design do DojoApp (contexto pra Nicole)

A Nicole (plugin) traz o julgamento geral. Aqui fica só o específico do Dojo:

- **Toda entrada entrega recompensa visual.** Ansiedade boa de registrar o próximo treino — micro-animação, selo, moldura mudando de cor, sequência subindo. Registro sem recompensa visual é tela não terminada.
- **Peso das referências:** Strava (a mais pesada, uso diário) > Gym Rats (competitivo, hierarquia simples) > Instagram (SIM pra formato de UI familiar; NÃO pro tom) > Duolingo (baixo, só no motor de hábito).
- **Teste de cheiro antes de desenhar:** "isso serve pro cara provar o hábito dele ou pro cara aparecer?". Se é aparecer, corta.
- **Reações são incentivo, não métrica:** Fogo / Força / Cutucar entre amigos próximos — nunca curtida-vaidade.

## Estado real do código

Base gerada por vibe coding (Hostinger Horizons), reconstruída peça a peça.
Stack: React 18 + Vite 4, Tailwind, react-router, framer-motion, lucide-react,
Supabase (Auth + Postgres + Storage; SDK importado via esm.sh em
src/lib/supabase.js, sem pacote npm; exige VITE_SUPABASE_URL e
VITE_SUPABASE_ANON_KEY — ver .env.example).
Schema e migrações SQL em supabase/ (schema.sql + migrations/001–003, rodadas
manualmente pelo Felipe no SQL Editor).

Já no Supabase (real, multi-aparelho): login por e-mail/senha (AuthContext),
perfil (tabela profiles, foto no bucket profile-photos), atividades registradas
(tabela activities, foto de treino no bucket training-photos com expiração de
60 dias). Treinos antigos do localStorage migram sozinhos no login
(activityMigration.js).

AINDA em localStorage/fixo: notificações da UI (sininho e painel leem/gravam
dojoNotifications_<id>; src/lib/notifications.js e useNotifications.js já
existem no Supabase mas NENHUM componente os usa ainda), contador e limite
diário de reações (reactions.js), "stories vistos". Amigos são os 4 personagens
fictícios de src/data/characters.js (Felipe, Thiago, Nicole, Ciclano, com ~180
dias de histórico sintético); a tabela friendships existe no schema mas o app
não a usa.

Telas funcionando:
- Login: cadastro e entrada reais (e-mail, senha, nome, @usuário). A entrada
  rápida por personagem foi removida.
- Home (/student): Seu dia — escudo, streak, chip de próximo treino, botão
  Treinar, resumo do dia, stories da semana, sininho de notificações.
- Registrar atividade (/register): modalidade, duração, distância, humor,
  comentário e foto (comprimida), com modal de confirmação. Alimenta streak,
  tira da semana e heatmap.
- Histórico: heatmap anual (3 tons, DaySheet) e histórico mensal navegável
  (/history/:yyyyMM).
- Amigos (/friends): feed, stories, enviar incentivo (item + mensagem, lista
  compacta), 3 reações de 1 toque (Fogo/Força/Cutucar, com limite diário),
  cards de marco de sequência.
- Ranking (/ranking): amigos + você, calculado a partir das atividades.
- Perfil: foto, @usuário, bio (150 chars), modalidade, molduras temáticas
  por esporte com emblema, estatísticas, salvar (grava no Supabase).
- Perfil público (/athlete/:id): somente leitura, com heatmap de 6 meses.
- Navegação: lateral no desktop, inferior no mobile (aba Treinar leva a /register).
- Rotas /teacher, /academy e /teacher-checklist são resquício do app-academia
  antigo, ainda no código.

## Modo de trabalho (combinado com o Felipe)

- Correção técnica sem escolha de rumo: FAÇA e explique depois, curto e didático.
- Decisão de rumo (arquitetura, o que construir, trade-off): PARE e pergunte antes.
- O Felipe é o dono do produto, não programador. Explique direto e didático, com
  poucas palavras. Sem floreio, sem puxar saco, sem repetição. Dinamismo.
- Código em inglês (variáveis, funções, commits). Comunicação em português.
  Interface do app em português.
- Commits pequenos e frequentes (uma mudança lógica = um commit). Rode
  `npm run build` antes de commitar pra validar. Sem testes automatizados agora.
- Mudanças incrementais e verificáveis. Nada de reconstruir tudo por uma tela.

## Indicador visual do modo caveman

Quando o modo caveman (skill `caveman`) estiver ativo, o agente começa cada
resposta com um 🪨 em uma linha isolada no topo. Em modo normal, nada. Serve
como "LED" pro Felipe saber visualmente, sem precisar perguntar.

Isso vale como marcador funcional (não decorativo), uma única linha, sem texto
junto — não é um prefixo tipo "Caveman:" (que a skill proíbe), apenas um
indicador discreto no topo. Fora dessa linha, todas as regras da skill valem
como escritas.

## Agentes

- Renan Nagami (.claude/agents/renan-nagami.md): dev + craftsman. Executa
  código com craft visual embutido (hierarquia, respiro, micro-anim, cor
  própria). Para antes de corrigir erro arquitetural; corrige direto erro
  pequeno local; propõe refino de craft só quando tem ganho real, nunca por
  regra. Em tela nova/refeita, chama Nicole pra walkthrough-persona antes de
  commitar.
- Nicole (plugin nicole:nicole): contestadora de produto/UX. Mandato de
  discordar com alternativa pronta. Skills: `nicole:walkthrough-persona` pra
  revisão por persona (Rafael, 36, BJJ roxa, 3-4x/sem) e `nicole:direcao-video`
  pra direção de vídeo curto.
- Alex PM (.claude/agents/alex-pm.md): PM sênior. Opportunity Assessment
  formal pra decisões de produto, veredito Build / Explore / Defer / Kill.
- A criar (o backend Supabase já entrou): code-reviewer e security-auditor (ver repo
  addyosmani/agent-skills). O security vira obrigatório com dados/senhas.

## Fluxo Nicole 2 passos (telas visuais)

Quando a tarefa produz tela/componente visível ao usuário:
1. Primeiro corte do código, com craft embutido.
2. Antes do commit, Nicole revisa com `nicole:walkthrough-persona`.
3. Aplica o que faz sentido do walkthrough. Discorda com argumento quando for
   o caso.
4. Commita.

Pra correção pequena/técnica (bug óbvio, typo, 1 linha), pula Nicole. Ela
entra quando o resultado é visual.

## Próximos passos

1. Migrar notificações e reações para o Supabase (o lib/hook já existem;
   falta ligar sininho/painel/Friends) — hoje o ciclo social só funciona
   no mesmo navegador.
2. Amizades reais (tabela friendships) no lugar dos personagens fictícios.
3. Agente designer — cara premium depois do núcleo pronto.
4. Revisores (code-reviewer e security-auditor) — o backend já existe.

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Remover do código as telas do app-academia antigo (/teacher, /academy, /teacher-checklist) se o pivô for definitivo.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
