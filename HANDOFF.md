# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 17/10/2026. Leia junto com o CLAUDE.md.

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

Registrar atividade (tela "Treinar", /register) — funciona de verdade:
- Grava o treino em `dojoActivities_<id>`: modalidade, duração, humor,
  comentário e foto (comprimida no aparelho). Só a modalidade é obrigatória.
- Alimenta tudo que é do usuário na Home: sequência (streak), tira/stories da
  semana, "Treinei hoje" (multi-sessão no mesmo dia soma o tempo) e "Último".
- Avisa quando o localStorage está quase cheio (fotos pesam).

Home ("Seu dia"): stories da semana, escudo com sequência, CTA "Treinei hoje" e
resumo Sequência/Semana/Último — dados reais do usuário. Dropdown do topo é
atalho (Seu dia / Feed dos amigos). Sininho de notificações com badge.

Ranking (/ranking): lista os amigos por treinos na semana e sequência. A linha
do próprio usuário é real; a dos amigos vem de characters.js (fixa).

Hub social:
- Aba Amigos: stories dos amigos, card de marco de sequência, ranking da semana
  e enviar incentivo (mensagens prontas ou própria). Os cards antigos de reação
  (Fogo/Força/Cutucar) saíram do feed.
- Enviar incentivo GRAVA uma notificação no perfil do amigo
  (`dojoNotifications_<id>`). O ciclo é real entre perfis.
- Sininho com painel (novas/todas), badge de não lidas, marca como visto.
- Quem recebe pode responder na hora ("Devolver fogo" e "Responder"). A resposta
  volta pro sininho de quem começou. Loop social fechado nos 2 sentidos.
- Perfil público do atleta (`/athlete/:id`): hero, tira da semana e estatísticas
  do mês (somente leitura; dados do amigo são fixos).

PWA: o app é instalável (manifest + service worker cache-first em public/).
Registrado em src/main.jsx. localStorage continua por aparelho.

Molduras temáticas por esporte: Luta, Levantamento, Corrida, Natação — cada uma
com cor própria e um emblema (SVG) no canto. (São pequenas de propósito; o
refino visual fica pro agente designer.)

Navegação: barra inferior (Home, Agenda, Treinar, Ranking, Amigos, Perfil).

Build: `npm run build` passa limpo. Rode sempre antes de commitar. (O script
chama tools/generate-llms.js, que não existe; o `|| true` esconde isso.)

## O que é FIXO/placeholder (ainda não é dado real)

- Status, sequência e calendário do mês dos AMIGOS (50 km, 4 dias, Inativo...) —
  fixos em characters.js. Só os dados do próprio usuário vêm dos treinos.
- Estatísticas numéricas do Perfil (47 aulas, 4.8, #12 ranking) — fixas.
- Barra de progresso de faixa ("20/60 aulas") — valores padrão, resquício do
  app-academia.
- Contador de reações — demonstração local (src/lib/reactions.js).
- Fotos dos stories dos amigos — imagens geradas em characters.js.
- Agenda, Home de professor e de academia — mock do app-academia antigo.
- Foto do treino só fica no aparelho (base64 no localStorage).

## Arquitetura de dados (hoje)

Sem backend. Tudo em localStorage:
- `dojoUser` / `dojoUserType` — sessão atual.
- `dojoProfile_<id>` — memória permanente de cada perfil (sobrevive a logout).
- `dojoActivities_<id>` — treinos registrados do perfil (src/lib/activity.js).
- `dojoNotifications_<id>` — notificações recebidas por perfil.
- `dojoNotifSeen_<id>` — timestamp do último visto (badge de não lidas).
- `dojoReactSent_<id>`, `dojoReactionDeltas` — limites/contadores de reações.

Limite conhecido: localStorage é por navegador/aparelho. Multi-aparelho e login
real só com backend (Supabase), que é um passo futuro.

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026)

A Home ganhou peças importantes (streak, stories da semana, "Treinei hoje",
"Último"). Situação das sugestões abaixo em 17/10/2026 (feito / pendente):

A. (feito na Home; pendente no Perfil) REMOVER / SUBSTITUIR a "20/60 aulas · 33%"
   É resquício do app-academia antigo. Hoje confunde — "aulas" não faz sentido
   num hub genérico. Opções: substituir por "meta da semana" (ex: 4 treinos,
   1/4 ✓) OU remover até existir meta real.

B. (feito) "Treinou hoje?" em destaque no resumo
   Antes do treino de hoje: botão grande "Treinei hoje" direto no resumo.
   Depois do treino: "✓ Treino de hoje · há Xh · Natação" como memória.
   Pequeno, muda MUITO a sensação de uso diário.

C. (pendente) Selo "✓ hoje" nos amigos que treinaram no dia
   Prova social forte. Olhar na Home e ver quem já se mexeu puxa a sua vez.

D. (parcial: card de marco no feed de Amigos) Marcos de sequência celebrados
   7 / 14 / 30 / 100 dias ganham badge visual (brilho, confete, cor especial)
   em vez de só mudar o número do hit. Hoje 1 e 42 têm "o mesmo peso visual".

E. (feito, versão curta) "Último treino" no resumo
   Linha curta: "último: há 2h · Natação · 45 min". Transforma o registro em
   memória viva, não só número que subiu.

F. Hierarquia no feed
   Quem bateu marco hoje aparece no topo com destaque. Quem está em alta
   (streak subindo) ganha ênfase. Hoje tudo tem o mesmo peso.

G. (feito, tira da semana) Perfil público do atleta (/athlete/:id) ganha a tira de frequência
   Já aparece na Home e Ranking. Falta esse último lugar.

### Médio prazo

H. Sistema de metas semanais/mensais
   "Sua meta: 4 treinos esta semana · 1/4 ✓". Alimenta uma barra de
   progressão REAL (substitui a de "aulas" chumbada). Combustível do motor
   Duolingo.

I. Ideia guardada: moldura reage à ausência
   Moldura esfria/apaga quando o usuário fica tempo sem treinar e esquenta ao
   voltar. Liga visualmente com o streak. Conversamos sobre isso em 13/10;
   encaixa depois do loop registro+streak estar bem assentado.

J. (feito) Agente DESIGNER (Nicole, .claude/agents/nicole.md)
   (contestador criativo, cara premium). Já está em uso nas telas. Com a Home esticada, é a hora dele passar o olho
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

## Rota pra virar app de celular (sem reescrever)

O app já foi construído mobile-first (viewport 375px, nav flutuante, touch
targets grandes). O trabalho pesado já está feito. Rota recomendada, do
mais fácil pro mais trabalhoso:

1. **PWA** (FEITO em 16/10/2026: manifest + service worker; falta testar a
   instalação no celular) (grátis, 1-2h). Adicionar manifest + service worker. O usuário
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
