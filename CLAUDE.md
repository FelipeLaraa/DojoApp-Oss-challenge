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
Persistência: localStorage, com MEMÓRIA POR PERFIL (chave dojoProfile_<id>).
NÃO existe ainda: backend, banco de dados, autenticação real.

Telas funcionando:
- Login: entrada rápida com 4 personagens fictícios (Felipe, Thiago, Nicole,
  Ciclano) em src/data/characters.js. Cada um tem faixa, moldura, modalidade,
  bio e status de atividade.
- Perfil: foto da galeria, @usuário, biografia (150 chars), modalidade principal,
  molduras temáticas por esporte (Luta/Levantamento/Corrida/Natação) com emblema.
  Ordem: foto, informações/bio, molduras, progresso, estatísticas, salvar.
- Amigos: feed dos amigos com status, enviar incentivo (item + mensagem), perfil
  público do atleta (/athlete/:id), notificações recebidas.
- Home (feed social): seu resumo (sequência real + tira de frequência de 7 dias)
  + botão Registrar, "Precisa de um empurrão" (inativos), feed de atividade dos
  amigos. 3 reações de 1 toque (Fogo/Força/Cutucar) com limite diário por amigo.
  Sininho de notificações com badge + responder/devolver.
- Registrar treino (/register): 1 toque grava o treino (detalhes opcionais) em
  localStorage e alimenta sequência e frequência. Foto do treino: placeholder.
- Ranking (/ranking): só amigos, por frequência semanal (empate: sequência).
- Navegação: lateral no desktop, inferior no mobile. Aba Amigos incluída.

Já reais (para o usuário logado): treinos registrados, sequência, semana.
Ainda fixos: status e dados dos amigos (characters.js), tempos ("há 3 h"),
estatísticas do perfil (47 aulas, #12), barra "20/60 aulas". Telas legadas do
app-academia (Agenda, Check-in, Teacher/Academy) seguem no código.

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
- A criar quando as telas-núcleo estiverem de pé: agente DESIGNER (contestador
  criativo, cara premium — cores, tipografia, conceito). Mandato de discordar.
- A criar quando entrar backend: code-reviewer e security-auditor (ver repo
  addyosmani/agent-skills). O security vira obrigatório com dados/senhas.

## Próximos passos

1. Enriquecer a Home (detalhes em HANDOFF.md): trocar "aulas" por meta semanal,
   "Treinei hoje" no resumo, selo "✓ hoje", marcos de sequência. (Registrar
   atividade já existe.)
2. Agente designer — cara premium depois do núcleo pronto.
3. Backend (Supabase) — login real, dados multi-aparelho; aí entram os revisores.

## Pendências anotadas

- Decisão de marca (DojoApp vs Oss Challenge vs outro) — resolver perto de
  compartilhar, com pesquisa de nome/domínio/loja livre.
- Limpar ferramentas extras do Node (Visual Studio Build Tools, Python) do
  computador do Felipe no fim do projeto.
