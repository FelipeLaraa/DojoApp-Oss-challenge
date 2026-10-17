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
PWA instalável: public/manifest.webmanifest + service worker (public/sw.js,
cache-first), registrado em src/main.jsx.
Persistência: localStorage, com MEMÓRIA POR PERFIL (chave dojoProfile_<id>) e
treinos por perfil (dojoActivities_<id>, em src/lib/activity.js).
NÃO existe ainda: backend, banco de dados, autenticação real.

Telas funcionando:
- Login: entrada rápida com 4 personagens fictícios (Felipe, Thiago, Nicole,
  Ciclano) em src/data/characters.js. Cada um tem faixa, moldura, modalidade,
  bio, sequência, calendário do mês e status de atividade (dados fixos).
- Perfil: foto da galeria, @usuário, biografia (150 chars), modalidade principal,
  molduras temáticas por esporte (Luta/Levantamento/Corrida/Natação) com emblema.
  Ordem: foto, informações/bio, molduras, progresso, estatísticas, salvar.
- Home ("Seu dia", /student): stories da semana, escudo com sequência, botão
  "Treinei hoje" (leva ao Treinar) e resumo Sequência/Semana/Último — tudo REAL,
  calculado dos treinos registrados. Dropdown no topo é atalho (Seu dia / Feed
  dos amigos). Sininho de notificações com badge + responder/devolver.
- Treinar (/register): REGISTRAR ATIVIDADE funciona. Modalidade, duração, humor,
  comentário e foto (comprimida) são gravados; alimenta sequência, semana e Home.
- Ranking (/ranking): ranking dos amigos por treinos na semana e sequência; a
  linha do próprio usuário usa dados reais, os amigos usam dados fixos.
- Amigos (/friends): feed com stories, marco de sequência e ranking da semana;
  enviar incentivo (mensagens prontas ou própria) e notificações recebidas;
  perfil público do atleta (/athlete/:id) com hero e tira da semana.
- Agenda (/schedule), professor e academia (/teacher, /academy,
  /teacher-checklist): resquício do app-academia, conteúdo todo fixo (mock).
- Navegação: barra inferior (Home, Agenda, Treinar, Ranking, Amigos, Perfil).

Ainda fixo/placeholder: status e sequência dos amigos (characters.js),
estatísticas e progresso de faixa do Perfil (47 aulas, #12, 20/60), contador de
reações (demonstração local), Agenda e telas de professor/academia.

Observação: o script `build` chama tools/generate-llms.js, que não existe no
repo; o `|| true` esconde a falha e o build do Vite passa normalmente.

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
- Nicole (.claude/agents/nicole.md): DESIGNER (contestadora criativa, cara
  premium — cores, tipografia, conceito). Mandato de discordar.
- A criar quando entrar backend: code-reviewer e security-auditor (ver repo
  addyosmani/agent-skills). O security vira obrigatório com dados/senhas.

## Próximos passos

1. (feito) Registrar atividade — sequência, semana e Home já são reais.
2. Tornar o resto real: meta semanal no lugar de "aulas", estatísticas do Perfil
   a partir dos treinos, tira de frequência no perfil público.
3. Designer: a Nicole (.claude/agents/nicole.md) já cuida do visual; seguir
   refinando.
4. Backend (Supabase) — login real, dados multi-aparelho; aí entram os revisores.

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
