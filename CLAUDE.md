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

## Estado real do código

Base gerada por vibe coding (Hostinger Horizons), reconstruída peça a peça.
Stack: React 18 + Vite 4, Tailwind, react-router, framer-motion, lucide-react.
Persistência: localStorage, com MEMÓRIA POR PERFIL (chave dojoProfile_<id>) e
treinos por perfil (chave dojoActivities_<id>, em src/lib/activity.js).
PWA instalável (manifest + service worker em public/, registrado em main.jsx).
NÃO existe ainda: backend, banco de dados, autenticação real.

Telas funcionando:
- Login: entrada rápida com 4 personagens fictícios (Felipe, Thiago, Nicole,
  Ciclano) em src/data/characters.js. Cada um tem faixa, moldura, modalidade,
  bio e status de atividade.
- Perfil: foto da galeria, @usuário, biografia (150 chars), modalidade principal,
  molduras temáticas por esporte (Luta/Levantamento/Corrida/Natação) com emblema.
  Ordem: foto, informações/bio, molduras, progresso, estatísticas, salvar.
- Treinar (/register): REGISTRAR ATIVIDADE funciona — modalidade, duração,
  humor, comentário e foto (comprimida). Grava em dojoActivities_<id> e calcula
  sequência (streak), tira de frequência da semana e "treinou hoje" de verdade.
- Home ("Seu dia"): stories da semana, escudo com sequência, botão "Treinei hoje"
  (leva ao /register) e resumo (sequência, semana, último/hoje) — tudo real.
  Dropdown de atalho leva à aba Amigos. Sininho de notificações com badge,
  filtro Novas/Todas, responder/devolver fogo.
- Amigos: stories dos amigos, marco de sequência, mini-ranking da semana,
  lista de amigos, enviar incentivo (frases prontas ou mensagem própria),
  perfil público do atleta (/athlete/:id, somente leitura).
- Ranking: só amigos, por frequência semanal (empate: maior sequência). Os
  dados do usuário logado são reais; os dos amigos são fixos.
- Navegação: barra inferior flutuante (Home, Agenda, Treinar, Ranking, Amigos,
  Perfil). Telas legadas de academia (Agenda, Professor, Academia) ainda existem.

Dados reais (vêm do "Registrar"): sequência, semana, "treinou hoje", tempos.
Ainda fixos: dados dos amigos (streak, semana, mês, status em characters.js) e
contadores de reação; no Perfil, as estatísticas (47 aulas, #12) e a barra de
progresso de faixa (20/60).

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

- Renan Nagami (.claude/agents/renan-nagami.md): desenvolvedor. Técnico,
  analítico, poucas palavras, didático. Para antes de corrigir erros e pergunta.
- Nicole (.claude/agents/nicole.md): designer. Contestadora criativa, opiniosa,
  mandato de discordar; cuida de hierarquia, respiro e peso visual.
- A criar quando entrar backend: code-reviewer e security-auditor (ver repo
  addyosmani/agent-skills). O security vira obrigatório com dados/senhas.

## Próximos passos

1. Enriquecer a Home e tornar reais os restos fixos (metas semanais, estatísticas
   e progresso do Perfil) — detalhes no HANDOFF.md.
2. Refino visual com a Nicole (designer) em cima do núcleo pronto.
3. Backend (Supabase) — login real, dados multi-aparelho; aí entram os revisores.
(Registrar atividade e PWA já estão feitos.)

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
