# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 15/10/2026 (revisado contra o código). Leia junto com o CLAUDE.md.

## Resumo em uma linha

O DojoApp pivotou para um hub social de atividade física (B2C, estilo
Gym Rats + Strava). Várias funções JÁ salvam e funcionam de verdade — não é mais
protótipo visual.

## O que JÁ funciona (testado)

Salvamento real — este é o ponto que costuma ser mal entendido:
- O perfil SALVA de verdade. Nome, @usuário, bio, modalidade, peso, altura,
  faixa, moldura e foto são gravados e persistem ao recarregar a página.
- A persistência é por perfil: cada personagem guarda suas próprias coisas na
  chave localStorage `dojoProfile_<id>`. Trocar de perfil não apaga nada.
- O botão "Salvar Alterações" NÃO é mais teatro. Ele chama `updateUser`, que
  grava em `dojoUser` (sessão) e em `dojoProfile_<id>` (memória permanente).

Foto de perfil:
- "Trocar foto" lê uma imagem da galeria do aparelho e mostra dentro da moldura
  escudo. Salva e persiste.

Login:
- Entrada rápida com 4 personagens fictícios (Felipe, Thiago, Nicole, Ciclano),
  definidos em `src/data/characters.js`. Clicar entra como aquele personagem,
  carregando o perfil salvo dele se já tiver sido editado.

Hub social (o coração do app):
- Home é um feed social (sem posts, sem curtidas): seu resumo + "Precisa de um
  empurrão" (amigos inativos) + feed de atividade dos amigos.
- 3 reações de 1 toque em cada card: Fogo, Força, Cutucar. Cada toque envia a
  reação ao amigo.
- Enviar reação/incentivo GRAVA uma notificação no perfil do amigo
  (`dojoNotifications_<id>`). O ciclo é real entre perfis.
- Sininho de notificações no topo da Home, com badge de não lidas. Abre painel,
  marca como visto.
- Quem recebe pode responder na hora: "Devolver fogo" e "Responder" (mensagem).
  A resposta volta pro sininho de quem começou. Loop social fechado nos 2 sentidos.
- Aba Amigos: feed + enviar incentivo (item + mensagem) + notificações recebidas.
- Perfil público do atleta (`/athlete/:id`): clicar num amigo abre o perfil dele
  (status, bio, estatísticas), somente leitura.

Registrar treino (`/register`, `src/pages/RegisterActivity.jsx`) — REAL:
- Botão de 1 toque "Treinei hoje" grava o treino em `dojoActivities_<id>`
  (data, modalidade, duração e nota opcionais; `src/lib/activity.js`).
- Detalhes opcionais: modalidade, duração (min) e nota (140 chars).
- Dali saem a SEQUÊNCIA (streak, dias seguidos; segue viva até o fim do dia
  seguinte) e a TIRA DE FREQUÊNCIA dos últimos 7 dias — ambas reais para o
  usuário logado, mostradas na Home e no escudo (hit).
- Se o localStorage estiver cheio, mostra toast de erro em vez de falhar calado.
- Foto do treino é placeholder ("em breve").

Ranking (`/ranking`) — só amigos, ordenado pela frequência semanal (empate: maior
sequência). Seus dados são reais; os dos personagens vêm fixos de characters.js.

Limite de reações: por amigo, por dia — Fogo 1, Força 1, Cutucar 3
(`src/lib/reactions.js`, chave `dojoReactSent_<id>`). O contador exibido soma a
base fixa do personagem + incrementos locais (`dojoReactionDeltas`) — demo.

Escudo do perfil (`ShieldProfile`): painel de personalização, selo de sequência
(hit) e emblemas maiores, com a foto do perfil dentro.

Molduras temáticas por esporte: Luta, Levantamento, Corrida, Natação — cada uma
com cor própria e um emblema (SVG) no canto. (O refino visual fica pro agente
designer.)

Navegação: lateral no desktop, inferior no mobile.

Build: `npm run build` passa limpo. Rode sempre antes de commitar.

## O que é FIXO/placeholder (ainda não é dado real)

- Status de atividade dos amigos (50 km, 4 dias, Inativo), sequência e semana
  dos amigos — fixos em characters.js (só os SEUS dados são reais).
- Tempos no feed ("há 3 h") — fixos (mapa `recency` na StudentHome).
- Estatísticas numéricas do perfil (47 aulas, #12 ranking) — fixas em Profile.jsx;
  a tela do atleta (`/athlete/:id`) mostra os valores fixos do personagem.
- Barra "20/60 aulas" no resumo da Home — valores padrão, resquício do app-academia.
- Foto do treino e contadores de reação compartilhados — demo/local.
- Telas legadas do app-academia ainda no código e na navegação: Agenda, Check-in,
  TeacherHome, AcademyHome, TeacherChecklist (não fazem parte do foco social).

O botão "Registrar" da Home JÁ não é placeholder: leva a `/register`.

## Arquitetura de dados (hoje)

Sem backend. Tudo em localStorage:
- `dojoUser` / `dojoUserType` — sessão atual.
- `dojoProfile_<id>` — memória permanente de cada perfil (sobrevive a logout).
- `dojoNotifications_<id>` — notificações recebidas por perfil.
- `dojoNotifSeen_<id>` — timestamp do último visto (badge de não lidas).
- `dojoActivities_<id>` — treinos registrados (base da sequência e da semana).
- `dojoReactSent_<id>` — reações enviadas hoje (limite diário por amigo).
- `dojoReactionDeltas` — incrementos locais do contador de reações (demo).

Limite conhecido: localStorage é por navegador/aparelho. Multi-aparelho e login
real só com backend (Supabase), que é um passo futuro.

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026)

A Home ganhou peças importantes (streak, tira de frequência, contador de
reações com limite, tela de registro), mas ainda está simples. Sugestões, por impacto × esforço:

A. REMOVER / SUBSTITUIR a "20/60 aulas · 33%" do resumo
   É resquício do app-academia antigo. Hoje confunde — "aulas" não faz sentido
   num hub genérico. Opções: substituir por "meta da semana" (ex: 4 treinos,
   1/4 ✓) OU remover até existir meta real.

B. "Treinou hoje?" em destaque no resumo
   Antes do treino de hoje: botão grande "Treinei hoje" direto no resumo.
   Depois do treino: "✓ Treino de hoje · há Xh · Natação" como memória.
   Pequeno, muda MUITO a sensação de uso diário. (Hoje o resumo tem só o botão
   "Registrar", que abre /register; o estado "já treinou hoje" só aparece lá.)

C. Selo "✓ hoje" nos amigos que treinaram no dia
   Prova social forte. Olhar na Home e ver quem já se mexeu puxa a sua vez.

D. Marcos de sequência celebrados
   7 / 14 / 30 / 100 dias ganham badge visual (brilho, confete, cor especial)
   em vez de só mudar o número do hit. Hoje 1 e 42 têm "o mesmo peso visual".

E. "Último treino" no resumo
   Linha curta: "último: há 2h · Natação · 45 min". Transforma o registro em
   memória viva, não só número que subiu.

F. Hierarquia no feed
   Quem bateu marco hoje aparece no topo com destaque. Quem está em alta
   (streak subindo) ganha ênfase. Hoje tudo tem o mesmo peso.

G. Perfil público do atleta (/athlete/:id) ganha a tira de frequência
   Já aparece na Home. No Ranking aparece a contagem semanal (NXx), não a tira.
   Falta o perfil do atleta (hoje só status, bio e estatísticas fixas).

### Médio prazo

H. Sistema de metas semanais/mensais
   "Sua meta: 4 treinos esta semana · 1/4 ✓". Alimenta uma barra de
   progressão REAL (substitui a de "aulas" chumbada). Combustível do motor
   Duolingo.

I. Ideia guardada: moldura reage à ausência
   Moldura esfria/apaga quando o usuário fica tempo sem treinar e esquenta ao
   voltar. Liga visualmente com o streak. Conversamos sobre isso em 13/10;
   encaixa depois do loop registro+streak estar bem assentado.

J. Agente DESIGNER (contestador criativo, cara premium)
   Já previsto no CLAUDE.md. Com a Home esticada, é a hora dele passar o olho
   crítico (cores, tipografia, hierarquia visual, conceito). Mandato de
   discordar; não é "fazer bonito", é desafiar escolhas.

### Longo prazo

K. Backend (Supabase) — destrava quase tudo que hoje é "demo"
   - Login real multi-aparelho (hoje perde ao trocar de celular)
   - Foto do treino (hoje é placeholder "em breve")
   - Contador de reações compartilhado de verdade (hoje é local)
   - Dados reais de amigos (hoje são fixos em characters.js)
   - Entrada dos agentes code-reviewer e security-auditor
   É um salto grande. Não é pra amanhã, mas é o próximo horizonte real.

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento, que está correto.
