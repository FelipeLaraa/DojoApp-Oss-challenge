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
via esm.sh em src/lib/supabase.js (não está no package.json). Env em `.env`
(modelo em `.env.example`). SQL em supabase/schema.sql + supabase/migrations/.
PWA instalável (public/manifest.webmanifest + sw.js, cache `dojo-v2`).

Real (Supabase): login/cadastro, perfil (tabela profiles + bucket profile-photos),
treinos (tabela activities + bucket training-photos, foto expira em 60 dias).
AINDA localStorage/fixo: amigos (personagens de src/data/characters.js, sem
friendships reais), incentivos/reações enviados, sino de notificações, limite
diário de reações, stories vistos.

Telas funcionando:
- Login: e-mail/senha real (Entrar / Criar conta). Entrada rápida por
  personagem foi removida; os 4 personagens (Felipe, Thiago, Nicole, Ciclano)
  seguem como amigos fictícios no feed, ranking e /athlete/:id.
- Home (/student): sino de notificações, atalho de navegação, "Hoje"
  (TodaySection), próximo treino, stories da semana, feed dos amigos,
  mini-ranking, card de marco de sequência. Reações Fogo/Força/Cutucar.
- Registrar atividade (/register): modalidade, duração, km, mood, comentário,
  foto (câmera/galeria, comprimida), modal de confirmação, sequência e marco
  semanal. Grava em activities e alimenta streak, heatmap e estatísticas.
- Perfil: visão/edição separadas, foto, bio, modalidade, escudo (moldura +
  emblema), estatísticas reais, YearHeatmap (6 meses, 3 tons, DaySheet),
  histórico mensal (/history/:yyyyMM).
- Amigos: "Incentivar amigos" (Precisa de um empurrão / Em alta, mensagens
  prontas, envio com desfazer), ranking de amigos, notificações.
- Ranking: toggle de período, score por mês.
- Perfil público (/athlete/:id): hero, heatmap de 6 meses, somente leitura.
- Navegação: lateral no desktop, inferior no mobile.
- Rotas legadas de academia (/teacher, /academy, /teacher-checklist) ainda
  existem no código, sem uso no foco B2C atual.

Dados ainda fixos: status e histórico dos personagens (mock sintético em
characters.js); aba Pro "em breve" no perfil público.

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
  addyosmani/agent-skills). O security é obrigatório: há senhas e dados reais.

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

1. Amigos reais (tabela friendships) — troca os personagens fictícios.
2. Ligar notificações/reações ao Supabase na UI (lib e hook já existem:
   src/lib/notifications.js, src/hooks/useNotifications.js; sino e Friends
   ainda leem localStorage).
3. Agente designer — cara premium depois do núcleo pronto.
4. Revisores (code-reviewer e security-auditor) — já há auth e dados reais.

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
