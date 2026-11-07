# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 07/11/2026. Leia junto com o CLAUDE.md.

## Resumo em uma linha

O DojoApp pivotou para um hub social de atividade física (B2C, estilo
Gym Rats + Strava). Várias funções JÁ salvam e funcionam de verdade — não é mais
protótipo visual.

## O que JÁ funciona

Base real no Supabase (Auth + Postgres + Storage):
- Login real por e-mail/senha, com cadastro (nome, @usuário). A entrada rápida
  por personagem saiu do Login.
- O perfil SALVA de verdade na tabela `profiles` (nome, @usuário, bio,
  modalidade, peso, altura, faixa, moldura, emblema, próximo treino). Foto vai
  para o bucket `profile-photos`. Funciona em qualquer aparelho.
- Registrar atividade (`/register`): modalidade, duração, distância, humor,
  comentário e foto (comprimida), com modal de confirmação. Grava em
  `activities`; foto no bucket `training-photos`, expira em 60 dias (metadados
  do treino ficam). Treinos antigos de localStorage migram sozinhos no login.
- Isso tornou REAL: streak, tira/stories da semana, "treinou hoje", resumo do
  dia, heatmap anual (3 tons, DaySheet), histórico mensal (`/history/:yyyyMM`),
  próximo treino, ranking (você vs. amigos) e marcos de sequência.

Hub social:
- Home "Seu dia": escudo, streak, chip de próximo treino, botão Treinar,
  resumo, stories da semana, sininho.
- Aba Amigos: feed, stories (só quem tem story), enviar incentivo (item +
  mensagem, lista compacta), 3 reações (Fogo, Força, Cutucar) com limite diário
  por amigo.
- Perfil público (`/athlete/:id`): somente leitura, com heatmap de 6 meses.
- Molduras temáticas por esporte (Luta, Levantamento, Corrida, Natação).
- Navegação lateral (desktop) / inferior (mobile).

Build: `npm run build` (o script chama `tools/generate-llms.js || true`; a
pasta `tools/` não existe, então esse passo é ignorado). Rode antes de commitar.

## O que ainda é localStorage ou fixo

- Notificações na UI: sininho e painel (`NotificationBell`, `NotificationPanel`)
  ainda leem e gravam `dojoNotifications_<id>` / `dojoNotifSeen_<id>`. O lib
  `src/lib/notifications.js` e o hook `useNotifications` já existem no
  Supabase, mas nenhum componente os usa. Resultado: incentivo/reação/resposta
  só chega a outro perfil no MESMO navegador.
- Reações: contador (`dojoReactionDeltas`) e limite diário
  (`dojoReactSent_<id>`) em localStorage.
- Amigos = 4 personagens fictícios de `src/data/characters.js`, com ~180 dias
  de histórico sintético. A tabela `friendships` existe, mas o app não a usa.
  Quem se cadastra não aparece para os outros.
- Fotos/status dos amigos no feed e stories vêm do mock.
- Rotas do app-academia antigo (`/teacher`, `/academy`,
  `/teacher-checklist`) continuam no código.

## Arquitetura de dados (hoje)

- Supabase: `profiles`, `activities`, `friendships`, `reactions`,
  `notifications`, `story_views` (RLS ligada) + buckets `profile-photos` e
  `training-photos`. SQL em `supabase/schema.sql` e `supabase/migrations/`
  (001 activities, 002 next_workout, 003 expiração de foto). O Felipe roda as
  migrações à mão no SQL Editor; são idempotentes.
- SDK via esm.sh (`src/lib/supabase.js`); precisa de `.env` com
  `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (modelo em `.env.example`).
- localStorage só para o que sobrou da lista acima.

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026)

> Nota 07/11: B, C, E e G parecem já feitos (botão Treinar/"treinou hoje",
> stories dos amigos, tira/heatmap no perfil público). Confirmar com o Felipe
> antes de remover da lista.

A Home ganhou peças importantes (streak, tira de frequência, contador de
reações com limite), mas ainda está simples. Sugestões, por impacto × esforço:

A. REMOVER / SUBSTITUIR a "20/60 aulas · 33%" do resumo
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
   Feito: login real multi-aparelho, perfil, atividades e fotos de treino.
   Falta: notificações e reações no banco (lib pronto, UI não ligada),
   amizades reais (`friendships`) no lugar dos personagens, contador de
   reações compartilhado, e a entrada dos agentes code-reviewer e
   security-auditor (agora faz sentido: há login e dados reais).

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

O PWA é tão barato que vale fazer já que o Felipe quiser testar o app no
próprio bolso. Com o Supabase, perfil e treinos já acompanham o login em qualquer
aparelho; notificações e reações ainda são locais (K acima).

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento, que está correto.
