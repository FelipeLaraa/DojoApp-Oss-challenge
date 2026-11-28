# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 28/11/2026 (última revisão do código: 30/10/2026). Leia junto com o CLAUDE.md.

## Resumo em uma linha

O DojoApp pivotou para um hub social de atividade física (B2C, estilo
Gym Rats + Strava). Várias funções JÁ salvam e funcionam de verdade — não é mais
protótipo visual.

## O que JÁ funciona

Backend Supabase (desde 26/10/2026):
- Login real por e-mail/senha (Entrar / Criar conta), sessão persistida.
  A entrada rápida por personagem saiu do Login.
- Perfil SALVA de verdade na tabela `profiles` (nome, @usuário, bio,
  modalidade, peso, altura, faixa, moldura, emblema, próximo treino).
  `updateUser` (AuthContext) faz update real e recarrega o perfil.
- Foto de perfil vai pro bucket `profile-photos`.
- Rotas protegidas: sem sessão, volta pro Login.

Registrar atividade (`/register`) — o marco combinado, FEITO:
- Modalidade, duração, km (Corrida/Natação/Musculação), mood, comentário e
  foto (câmera ou galeria, comprimida no cliente), com modal de confirmação.
- Grava na tabela `activities` (RLS: só o dono escreve) e fotos no bucket
  `training-photos`. Foto expira em 60 dias (migration 003); metadados ficam.
- Migração one-shot dos treinos antigos do localStorage pro Supabase no login.
- `useActivities` refaz a leitura ao registrar treino e ao voltar à aba.

O que agora é REAL por causa disso: sequência (streak), "treinou hoje",
tira/stories da semana, estatísticas do perfil, heatmap anual (6 meses,
3 tons, DaySheet), histórico mensal (`/history/:yyyyMM`), marco semanal no
Registrar.

Hub social:
- Home: sino, "Hoje", próximo treino, stories da semana (tocar abre foto em
  tela cheia), feed dos amigos, mini-ranking, card de marco.
- Reações de 1 toque (Fogo/Força/Cutucar) com limite diário por amigo.
- Amigos: "Incentivar amigos" compacto (Precisa de um empurrão / Em alta,
  mensagens prontas, envio com desfazer), ranking de amigos, notificações.
- Ranking com toggle de período e score por mês.
- Perfil público (`/athlete/:id`): hero, heatmap de 6 meses, somente leitura.
- Escudo (moldura + emblema) por esporte: Luta, Levantamento, Corrida, Natação.

PWA: manifest + service worker (`dojo-v2`), instalável no celular.

Navegação: lateral no desktop, inferior no mobile.

Build: `npm run build` (script chama `tools/generate-llms.js || true`; a pasta
`tools/` não existe, o `|| true` esconde isso). Rode antes de commitar.

## O que ainda é FIXO / localStorage / placeholder

- AMIGOS são os 4 personagens de `src/data/characters.js` (dados e ~180 dias
  de histórico sintéticos). Não existe friendship real; a tabela `friendships`
  está no schema mas sem uso na UI.
- Incentivos enviados na aba Amigos e respostas no painel GRAVAM em
  localStorage (`dojoNotifications_<id>`) — só aparecem no mesmo navegador.
- O sino (`NotificationBell`) lê localStorage. `src/lib/notifications.js`
  (Supabase) e `useNotifications` existem, mas nenhuma tela os usa ainda.
- Contador e limite diário de reações: localStorage (`reactions.js`).
  Tabela `reactions` do schema sem uso.
- Stories vistos: localStorage. Tabela `story_views` sem uso.
- Aba "Pro · competidor" no perfil público: teaser "em breve".
- Telas legadas de academia (`/teacher`, `/academy`, `/teacher-checklist`):
  ainda roteadas, fora do foco atual.

## Arquitetura de dados (hoje)

Supabase (SDK via esm.sh, env em `.env` — ver `.env.example`):
- Tabelas em uso: `profiles`, `activities`.
- Tabelas no schema SEM uso na UI: `friendships`, `reactions`, `notifications`
  (só a lib), `story_views`.
- Buckets: `training-photos`, `profile-photos`.
- SQL: `supabase/schema.sql` + `supabase/migrations/001..003` (rodar no SQL
  Editor; idempotentes).

localStorage (resto): `dojoNotifications_<id>`, `dojoNotifSeen_<id>`,
`dojoReactionDeltas`, `dojoReactSent_<id>`, stories vistos, e
`dojoProfile_<id>` (só lido pra personagens fictícios).

## Próximos passos

### Curto prazo

1. Amigos reais: usar `friendships`, trocar os personagens fictícios (dar
   convite/adicionar por @usuário). Destrava feed, ranking e perfil público
   com dados de verdade.
2. Notificações e reações no Supabase: ligar sino e Friends a
   `notifications.js`/`useNotifications`; mover contador e limite diário de
   reações pra tabela `reactions`.
3. Revisores: criar code-reviewer e security-auditor (já há senha, RLS e
   storage).

### Do plano de enriquecer a Home (13/10/2026) — status

Já feito: A ("aulas 20/60" removido da Home), streak, tira/stories da semana, "Hoje", marco de sequência
(card), mini-ranking, heatmap, perfil público com histórico (G).
Ainda abertos: D (celebração visual por marco 7/14/30/100), F (hierarquia no feed),
H (metas semanais/mensais).

### Médio prazo

- Moldura reage à ausência (esfria sem treinar, esquenta ao voltar).
- Agente DESIGNER (contestador criativo, cara premium) — já previsto no
  CLAUDE.md.
- Agendar `delete_expired_photos()` (pg_cron) se ainda não estiver ativo.

### Longo prazo

- Check-in em academias (estilo Wellhub), depois do social sólido.
- Capacitor/loja quando o backend estiver estável (ver rota abaixo).

## Rota pra virar app de celular (sem reescrever)

O app já foi construído mobile-first (viewport 375px, nav flutuante, touch
targets grandes). O trabalho pesado já está feito. Rota recomendada, do
mais fácil pro mais trabalhoso:

1. **PWA** (grátis, 1-2h). Adicionar manifest + service worker. O usuário
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

O PWA JÁ está feito (manifest + service worker `dojo-v2`). Com o Supabase, os
dados de perfil e treinos acompanham a conta entre aparelhos; o que ainda
é localStorage (notificações, reações) continua por aparelho.

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento, que está correto.
