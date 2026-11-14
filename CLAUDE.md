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
Stack: React 18 + Vite 4, Tailwind, react-router, framer-motion, lucide-react.
Backend: Supabase (auth e-mail/senha, Postgres com RLS, Storage). SDK importado
via esm.sh em src/lib/supabase.js (não está no package.json); precisa de
VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. SQL em supabase/schema.sql e
supabase/migrations/ (001 activities, 002 next_workout, 003 expiração de foto).
PWA básico: public/manifest.webmanifest + sw.js.
Ainda NÃO existe: amigos reais (friendships/reactions estão no schema, mas o
front não usa), testes automatizados, agentes de review.

Telas funcionando:
- Login: cadastro/entrada reais por e-mail e senha (Supabase). A entrada rápida
  com personagens saiu do Login.
- Home (/student, "Seu dia"): TodaySection com escudo, tira da semana (stories),
  sequência, chip de "próximo treino" (salva em profiles.next_workout) e sininho.
  Dropdown do título leva à aba Amigos.
- Treinar (/register): REGISTRAR ATIVIDADE FUNCIONA — modalidade, duração,
  distância, humor, comentário e foto (comprimida), com modal de confirmação.
  Grava em `activities` (Supabase); foto no bucket training-photos, expira em 60
  dias. Migração única de treinos antigos do localStorage no login.
- Perfil: foto (bucket profile-photos), @usuário, bio (150), modalidade, faixa
  (só modalidades de luta), molduras/emblemas por esporte, heatmap anual
  (YearHeatmap, 3 tons, DaySheet) e histórico mensal (/history/:yyyyMM). Salva
  em `profiles`.
- Ranking: período (semana/mês), com o usuário real + personagens.
- Amigos: feed, incentivo (item + mensagem) e perfil público (/athlete/:id,
  com heatmap) — mas os amigos ainda são os 4 personagens fictícios de
  src/data/characters.js (Felipe, Thiago, Nicole, Ciclano), com ~180 dias de
  histórico sintético.
- Notificações: sininho com badge, responder/devolver fogo. Ainda lê/grava em
  localStorage (`dojoNotifications_<id>`); src/lib/notifications.js e
  useNotifications já existem no Supabase mas nenhuma tela os usa.
- Reações (Fogo/Força/Cutucar): limites diários e contadores em localStorage.
- Navegação: BottomNav (Home, Treinar, Ranking, Amigos, Perfil); lateral no
  desktop. Rotas /teacher, /academy e /teacher-checklist são resquício do app
  de academia, sem link na navegação.

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
- A criar (backend já entrou): code-reviewer e security-auditor (ver repo
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

1. Amigos reais — usar friendships/reactions/notifications do Supabase no lugar
   de characters.js e localStorage (Friends, Ranking, FriendsFeed, sininho,
   AthleteProfile).
2. Agente designer — cara premium depois do núcleo pronto.
3. Revisores (code-reviewer e security-auditor) — agora obrigatórios: já há
   login e dados reais.

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
