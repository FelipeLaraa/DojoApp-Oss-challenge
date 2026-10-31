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
Backend: Supabase (SDK `@supabase/supabase-js` importado via esm.sh em
src/lib/supabase.js; precisa de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
no `.env`). SQL em supabase/schema.sql + supabase/migrations/001–003 (rodados
à mão no SQL Editor). PWA básico (public/manifest.webmanifest + sw.js).

JÁ É REAL (Supabase): autenticação e-mail/senha, perfil (tabela profiles +
bucket profile-photos), treinos (tabela activities + bucket training-photos,
foto expira em 60 dias), próximo treino (profiles.next_workout), migração
única de treinos antigos do localStorage no login.

AINDA É LOCAL/FIXO: amigos (os 4 personagens de src/data/characters.js, com
~180 dias de histórico sintético) — não há amizades reais ainda (tabela
friendships existe, sem uso no front); notificações exibidas no sininho/painel
e na aba Amigos (localStorage `dojoNotifications_<id>`, mesmo com a lib
src/lib/notifications.js e o hook useNotifications prontos no Supabase, ainda
não ligados à UI); contador/limite diário de reações (localStorage); stories
vistos (localStorage).

Telas funcionando:
- Login: cadastro e entrada reais por e-mail/senha (nome, @usuário). A entrada
  rápida com personagens saiu.
- Home (/student, "Seu dia"): resumo com sequência (streak), semana, botão de
  treinar (abre a câmera), próximo treino, marcos, stories e feed dos amigos,
  ranking dos amigos, sininho de notificações.
- Registrar atividade (/register, aba "Treinar"): esporte, duração, distância,
  humor, comentário e foto (comprimida), com modal de confirmação. Grava no
  Supabase e alimenta streak, heatmap e Home.
- Perfil: foto, @usuário, bio (150 chars), modalidade, molduras temáticas por
  esporte com emblema, sequência/estatísticas reais, heatmap anual
  (3 tons + folha do dia) e histórico mensal (/history/:yyyyMM).
- Amigos: feed dos amigos (fictícios), incentivo compacto (item + mensagem),
  notificações, perfil público (/athlete/:id) com heatmap de 6 meses.
- Ranking: amigos + você, por mês/semana.
- Navegação: lateral no desktop, inferior no mobile.
- Restos do app-academia antigo ainda roteados: /teacher, /academy,
  /teacher-checklist/:classId (fora do foco B2C).

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
- A criar quando entrar backend: code-reviewer e security-auditor (ver repo
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

1. Amigos reais — friendships no Supabase, trocar os personagens fictícios por
   usuários reais (perfil público, feed, ranking).
2. Notificações e reações no Supabase — ligar a UI à lib/hook já prontos e
   mover o limite diário de reações pro banco.
3. Agente designer — cara premium depois do núcleo pronto.
4. Revisores (code-reviewer e security-auditor) — já há backend e senhas.

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
