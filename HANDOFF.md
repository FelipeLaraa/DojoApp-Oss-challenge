# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 21/11/2026. Leia junto com o CLAUDE.md.

## Resumo em uma linha

O DojoApp pivotou para um hub social de atividade física (B2C, estilo
Gym Rats + Strava). Várias funções JÁ salvam e funcionam de verdade — não é mais
protótipo visual.

## O que JÁ funciona (conferido no código)

Backend Supabase (Auth, Postgres com RLS, Storage) — não é mais só localStorage:
- Login/cadastro real por e-mail e senha (`AuthContext`). A entrada rápida com
  personagens saiu do Login. Sessão persiste; multi-aparelho funciona pro que
  está no banco.
- Perfil SALVA no banco (tabela `profiles`): nome, @usuário, bio, modalidade,
  peso, altura, faixa, moldura, próximo treino. Foto vai pro bucket
  `profile-photos`. `updateUser` faz update real.
- Molduras temáticas por esporte (Luta, Levantamento, Corrida, Natação) com
  emblema SVG.
- Registrar atividade (`/register`): modalidade, duração/distância, comentário,
  humor, foto (comprimida, bucket `training-photos`, expira em 60 dias),
  modal de confirmação. Grava em `activities`.
- Dados reais derivados dos treinos (`useActivities`): sequência, tira da
  semana, "treinou hoje", heatmap de 6 meses com 3 tons e DaySheet, histórico
  mensal (`/history/:yyyyMM`), marcos de sequência.
- Migração única de treinos antigos do localStorage pro banco no login.
- PWA: manifest + service worker (`public/sw.js`).
- Navegação: lateral no desktop, inferior no mobile (Home, Treinar, Ranking,
  Amigos, Perfil).

Build: `npm run build` (usa `tools/generate-llms.js || true`, pasta que não
existe no repo; o `|| true` segura). Rode sempre antes de commitar.

## O que é FIXO/local (ainda não é dado real)

Amigos e social ainda são fictícios/locais — este é o próximo gargalo:
- Amigos (feed, stories, ranking, `/athlete/:id`, MonthHistory de atleta) vêm
  dos 4 personagens de `src/data/characters.js` (Felipe, Thiago, Nicole,
  Ciclano) com ~180 dias de histórico sintético. Tabelas `friendships` e
  `reactions` existem no schema, mas o app não as usa.
- Reações (Fogo/Força/Cutucar), contadores e limite diário: localStorage
  (`dojoReactionDeltas`, `dojoReactSent_<id>`).
- Notificações: `NotificationBell`, `NotificationPanel` e `Friends.jsx` ainda
  leem/gravam `dojoNotifications_<id>` e `dojoNotifSeen_<id>` no localStorage.
  `lib/notifications.js` e o hook `useNotifications` (Supabase) já existem,
  mas nenhuma tela os consome.
- Stories vistos: localStorage.
- Telas herdadas do app-academia (`TeacherHome`, `AcademyHome`,
  `TeacherChecklist`) ainda têm rota; não fazem parte do produto atual.
- Barra de progresso de faixa e estatísticas do perfil (aulas, ranking):
  valores padrão.

## Arquitetura de dados (hoje)

- Supabase: `profiles`, `activities`, `notifications` (lib pronta, UI não
  ligada), `friendships`, `reactions`, `story_views` (estas três só no schema).
  Buckets `training-photos` e `profile-photos`. SQL em `supabase/schema.sql` e
  `supabase/migrations/001..003` (rodar no SQL Editor, são idempotentes).
- Env: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (ver `.env.example`).
  Sem elas o app lança erro ao iniciar.
- O cliente Supabase é importado via esm.sh (`src/lib/supabase.js`), não está
  no `package.json`.
- localStorage restante: notificações, reações, stories vistos, perfis dos
  personagens (`dojoProfile_<id>`).

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026; A já feita, demais itens não conferidos um a um)

A Home ganhou peças importantes (streak, tira de frequência, contador de
reações com limite), mas ainda está simples. Sugestões, por impacto × esforço:

A. REMOVER / SUBSTITUIR a "20/60 aulas · 33%" do resumo
   (FEITO: o texto não existe mais em src/components/home nem WelcomeMessage)
   É resquício do app-academia antigo. Hoje confunde — "aulas" não faz sentido
   num hub genérico. Opções: substituir por "meta da semana" (ex: 4 treinos,
   1/4 ✓) OU remover até existir meta real.

B. "Treinou hoje?" em destaque no resumo
   Antes do treino de hoje: botão grande "Treinei hoje" direto no resumo.
   Depois do treino: "✓ Treino de hoje · há Xh · Natação" como memória.
   Pequeno, muda MUITO a sensação de uso diário.

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

J. Agente DESIGNER (contestador criativo, cara premium)
   Já previsto no CLAUDE.md. Com a Home esticada, é a hora dele passar o olho
   crítico (cores, tipografia, hierarquia visual, conceito). Mandato de
   discordar; não é "fazer bonito", é desafiar escolhas.

### Longo prazo

K. Backend (Supabase) — PARCIALMENTE FEITO
   Já no banco: login real, perfil, treinos, foto de treino/perfil.
   Falta (este é o próximo marco):
   - Amigos reais via `friendships` (hoje fixos em characters.js)
   - Notificações no Supabase (lib pronta, UI ainda em localStorage)
   - Reações compartilhadas via `reactions` + limite diário no servidor
   - Entrada dos agentes code-reviewer e security-auditor (já há senhas/dados)

## Rota pra virar app de celular (sem reescrever)

O app já foi construído mobile-first (viewport 375px, nav flutuante, touch
targets grandes). O trabalho pesado já está feito. Rota recomendada, do
mais fácil pro mais trabalhoso:

1. **PWA** (JÁ FEITO: manifest + `sw.js`; grátis, 1-2h). Adicionar manifest + service worker. O usuário
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
próprio bolso. Perfil e treinos agora vêm do Supabase e acompanham a conta em qualquer
aparelho. Só o que ainda é localStorage (notificações, reações; K acima)
começa do zero ao instalar em outro aparelho.

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento de perfil e treinos, que está correto.
O app exige as env vars do Supabase para iniciar.
