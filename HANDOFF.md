# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 2026-10-24 (código conferido até o commit 8b47001, de 16/10/2026). Leia junto com o CLAUDE.md.

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
- Home ("Seu dia", /student) é o resumo pessoal: stories da semana, escudo com
  sequência, botão "Treinei hoje" e resumo (sequência, semana, último/hoje).
  Um dropdown no topo leva à aba Amigos. Sem posts, sem curtidas.
- Aba Amigos: stories dos amigos, "Marco de hoje", ranking da semana, lista de
  amigos e envio de incentivo (frases prontas ou mensagem própria).
- Enviar incentivo GRAVA uma notificação no perfil do amigo
  (`dojoNotifications_<id>`). O ciclo é real entre perfis.
- Sininho de notificações (Home e Amigos), com badge de não lidas e painel com
  filtro Novas/Todas.
- Quem recebe pode responder na hora: "Devolver fogo" e "Responder" (mensagem).
  A resposta volta pro sininho de quem começou. Loop social fechado nos 2 sentidos.
- Perfil público do atleta (`/athlete/:id`): clicar num amigo abre o perfil dele
  (status, bio, estatísticas), somente leitura.

Molduras temáticas por esporte: Luta, Levantamento, Corrida, Natação — cada uma
com cor própria e um emblema (SVG) no canto. (São pequenas de propósito; o
refino visual fica pro agente designer.)

Registrar atividade (/register, aba "Treinar") — FEITO e real:
- Modalidade, duração, humor, comentário e foto do treino (comprimida em canvas,
  máx. 800 px). Grava em `dojoActivities_<id>` (src/lib/activity.js).
- Daí saem de verdade: sequência (streak), tira/stories da semana, "treinou
  hoje", várias sessões no mesmo dia agregadas, "há Xh" (src/lib/time.js).
- Aviso quando o localStorage está quase cheio (fotos pesam).
- Bloco "PRO · competidor" é só teaser ("em breve").

Ranking (/ranking): só amigos, por frequência semanal; os dados do usuário
logado vêm dos treinos registrados.

PWA: manifest, ícones SVG e service worker (cache-first) em `public/`; registrado
em `src/main.jsx`. O app já pode ser instalado na tela inicial do celular.

Navegação: barra inferior flutuante (Home, Agenda, Treinar, Ranking, Amigos,
Perfil). Telas legadas da era academia ainda existem (Agenda, Professor, Academia).

Build: `npm run build` passa limpo. Rode sempre antes de commitar.

## O que é FIXO/placeholder (ainda não é dado real)

- Dados dos AMIGOS (streak, semana, mês de 30 dias, status/"Último treino",
  marco) — fixos em characters.js. Só o usuário logado tem dados reais.
- Contadores de reação (src/lib/reactions.js) — o módulo existe mas nenhuma tela
  o usa mais (os cards de reação saíram do feed); pode ser removido ou reaproveitado.
- Estatísticas numéricas do Perfil (47 aulas, 20/60, 4.8, #12) — fixas.
- Barra de progresso de faixa ("aulas") — usa valores padrão.
- Perfil público do atleta: "semana atual" é derivada do `month` fixo.
- Foto do treino é salva só no aparelho (localStorage).

Home e Treinar já usam dados reais; o que falta virar real é o lado dos amigos
(depende de backend) e as estatísticas do Perfil.

## Arquitetura de dados (hoje)

Sem backend. Tudo em localStorage:
- `dojoUser` / `dojoUserType` — sessão atual.
- `dojoProfile_<id>` — memória permanente de cada perfil (sobrevive a logout).
- `dojoActivities_<id>` — treinos registrados (data, modalidade, duração, humor, foto...).
- `dojoReactSent_<id>` / `dojoReactionDeltas` — controle de reações (hoje sem uso na UI).
- `dojoNotifications_<id>` — notificações recebidas por perfil.
- `dojoNotifSeen_<id>` — timestamp do último visto (badge de não lidas).

Limite conhecido: localStorage é por navegador/aparelho. Multi-aparelho e login
real só com backend (Supabase), que é um passo futuro.

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026)

A Home já tem registro real, streak, stories da semana e "Treinei hoje"
(itens B e E abaixo estão em boa parte feitos), mas ainda pode crescer.
Sugestões, por impacto × esforço:

A. REMOVER / SUBSTITUIR a "20/60 aulas · 33%" do resumo
   É resquício do app-academia antigo. Hoje confunde — "aulas" não faz sentido
   num hub genérico. Opções: substituir por "meta da semana" (ex: 4 treinos,
   1/4 ✓) OU remover até existir meta real.

B. "Treinou hoje?" em destaque no resumo — FEITO (botão "Treinei hoje" no hero)
   Antes do treino de hoje: botão grande "Treinei hoje" direto no resumo.
   Depois do treino: "✓ Treino de hoje · há Xh · Natação" como memória.
   Pequeno, muda MUITO a sensação de uso diário.

C. Selo "✓ hoje" nos amigos que treinaram no dia
   Prova social forte. Olhar na Home e ver quem já se mexeu puxa a sua vez.

D. Marcos de sequência celebrados
   7 / 14 / 30 / 100 dias ganham badge visual (brilho, confete, cor especial)
   em vez de só mudar o número do hit. Hoje 1 e 42 têm "o mesmo peso visual".

E. "Último treino" no resumo — PARCIAL (coluna "Último/Hoje" mostra só o tempo)
   Linha curta: "último: há 2h · Natação · 45 min". Transforma o registro em
   memória viva, não só número que subiu.

F. Hierarquia no feed
   Quem bateu marco hoje aparece no topo com destaque. Quem está em alta
   (streak subindo) ganha ênfase. Hoje tudo tem o mesmo peso.

G. Perfil público do atleta (/athlete/:id) ganha a tira de frequência
   Já aparece na Home e Ranking. O perfil tem os stories da semana (dados
   fixos), mas ainda não a tira de frequência.

### Médio prazo

H. Sistema de metas semanais/mensais
   "Sua meta: 4 treinos esta semana · 1/4 ✓". Alimenta uma barra de
   progressão REAL (substitui a de "aulas" chumbada). Combustível do motor
   Duolingo.

I. Ideia guardada: moldura reage à ausência
   Moldura esfria/apaga quando o usuário fica tempo sem treinar e esquenta ao
   voltar. Liga visualmente com o streak. Conversamos sobre isso em 13/10;
   encaixa depois do loop registro+streak estar bem assentado.

J. Agente DESIGNER (contestador criativo, cara premium) — CRIADO: Nicole
   (.claude/agents/nicole.md). Já redesenhou notificações, Amigos e Treinar.
   Segue passando o olho crítico (cores, tipografia, hierarquia visual, conceito). Mandato de
   discordar; não é "fazer bonito", é desafiar escolhas.

### Longo prazo

K. Backend (Supabase) — destrava quase tudo que hoje é "demo"
   - Login real multi-aparelho (hoje perde ao trocar de celular)
   - Foto do treino (hoje é placeholder "em breve")
   - Contador de reações compartilhado de verdade (hoje é local)
   - Dados reais de amigos (hoje são fixos em characters.js)
   - Entrada dos agentes code-reviewer e security-auditor
   É um salto grande. Não é pra amanhã, mas é o próximo horizonte real.

## Rota pra virar app de celular (sem reescrever)

O app já foi construído mobile-first (viewport 375px, nav flutuante, touch
targets grandes). O trabalho pesado já está feito. Rota recomendada, do
mais fácil pro mais trabalhoso:

1. **PWA** (grátis, 1-2h) — JÁ FEITO em 16/10/2026 (manifest + service worker
   em `public/`). O usuário
   abre o app no navegador do celular → "Adicionar à tela inicial" → vira
   ícone com splash, abre fullscreen sem barra do navegador, funciona
   offline. Zero loja, zero custo. Limite: notificação push limitada no
   iOS (Android ok). PERFEITO pra testar com amigos agora e validar.

2. **Capacitor** (1-2 semanas, pra lançar sério). Embrulha o React atual
   num container nativo iOS/Android. Mesmo código, vira .apk/.ipa.
   Google Play: $25 uma vez. App Store: $99/ano + revisão manual + Mac
   obrigatório pra publicar iOS. Faz sentido quando o backend existir.

3. **React Native** (meses). Reescreve usando componentes nativos. Overkill
   enquanto não tiver milhares de usuários pedindo performance que PWA/
   Capacitor não dão. Hoje não vale.

O PWA é tão barato que vale fazer já que o Felipe quiser testar o app no
próprio bolso. Alerta importante: o localStorage é por aparelho, então
instalar o PWA no celular começa do zero (os dados do navegador do PC
não migram). Isso só se resolve com o Backend (K acima).

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento, que está correto.
