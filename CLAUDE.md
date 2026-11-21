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
Supabase (cliente importado via esm.sh em src/lib/supabase.js, não está no
package.json). PWA instalável (manifest + sw.js).
Backend: Supabase (Auth e-mail/senha, Postgres com RLS, Storage). SQL em
supabase/schema.sql e supabase/migrations/ (001 activities, 002 next_workout,
003 expiração de foto). Env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.

REAL (Supabase):
- Login/cadastro por e-mail e senha (AuthContext); sessão persistida.
- Perfil (tabela profiles): nome, @usuário, bio, modalidade, faixa, moldura,
  foto (bucket profile-photos), próximo treino.
- Registrar atividade (/register): modalidade, duração/distância, comentário,
  humor, foto (comprimida, expira em 60 dias), modal de confirmação. Grava em
  activities. Sequência, semana e "treinou hoje" derivam disso (useActivities).
- Home "Seu dia" (TodaySection): resumo, histórico em heatmap (6 meses, 3 tons,
  DaySheet), histórico mensal (/history/:yyyyMM). Migração única de treinos
  antigos do localStorage pro banco no login.

AINDA FIXO/LOCAL (personagens fictícios em src/data/characters.js + localStorage):
- Amigos: feed, stories, ranking, perfil público (/athlete/:id) usam os 4
  personagens (Felipe, Thiago, Nicole, Ciclano) com histórico sintético. Tabelas
  friendships/reactions existem no schema mas o app ainda não as usa.
- Reações (Fogo/Força/Cutucar) e limite diário: localStorage (lib/reactions.js).
- Notificações: sininho, painel e aba Amigos ainda leem/gravam localStorage
  (dojoNotifications_<id>). lib/notifications.js + hook useNotifications já
  existem no Supabase, mas nenhuma tela os usa ainda.
- Telas herdadas do app-academia (TeacherHome, AcademyHome, TeacherChecklist):
  rotas existem, sem uso na navegação principal.
- Barra de progresso de faixa e estatísticas do perfil (aulas, ranking): valores padrão.

Navegação: lateral no desktop, inferior no mobile (Home, Treinar, Ranking,
Amigos, Perfil).

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
- A criar (backend já existe): code-reviewer e security-auditor (ver repo
  addyosmani/agent-skills). O security é obrigatório com dados/senhas.

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

1. Amigos reais — trocar characters.js por friendships no Supabase (feed,
   perfil público, ranking, stories).
2. Notificações e reações no Supabase — ligar sininho/painel/Amigos a
   lib/notifications.js e à tabela reactions (limite diário hoje é local).
3. Agente designer — cara premium depois do núcleo pronto.
4. Revisores (code-reviewer, security-auditor) — backend e senhas já existem,
   então entram agora (RLS, buckets, env vars).

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
