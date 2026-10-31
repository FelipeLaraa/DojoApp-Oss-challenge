# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 31/10/2026. Leia junto com o CLAUDE.md.

## Resumo em uma linha

O DojoApp é um hub social de atividade física (B2C, estilo Gym Rats + Strava),
agora com backend Supabase: login real, perfil e treinos persistem na nuvem.
Amigos, notificações e reações ainda são locais/fictícios.

## O que JÁ funciona (Supabase)

- Login/cadastro reais por e-mail e senha (nome + @usuário). Sessão persistida.
- Perfil SALVA de verdade na tabela `profiles` (nome, @usuário, bio, modalidade,
  peso, altura, faixa, moldura, emblema, foto no bucket `profile-photos`).
  `updateUser` (AuthContext) faz o update e recarrega.
- Registrar atividade (`/register`): esporte, duração, distância, humor,
  comentário, foto (comprimida) e modal de confirmação. Grava em `activities`
  (foto no bucket `training-photos`, expira em 60 dias; metadados ficam).
- Sequência (streak), semana, "treinou hoje", marcos, heatmap anual
  (3 tons + folha do dia), histórico mensal (`/history/:yyyyMM`) — tudo
  calculado dos treinos reais via `useActivities`.
- "Próximo treino" (chip na Home) salvo em `profiles.next_workout`.
- Migração única dos treinos antigos do localStorage pro Supabase no login.
- Molduras temáticas por esporte (Luta, Levantamento, Corrida, Natação).
- PWA básico (manifest + service worker).
- Navegação: lateral no desktop, inferior no mobile.

Build: `npm run build` (roda `tools/generate-llms.js` se existir e depois o
Vite). Rode antes de commitar.

## O que AINDA é local/fixo

- Amigos = 4 personagens fictícios de `src/data/characters.js` (Felipe, Thiago,
  Nicole, Ciclano), com histórico sintético de ~180 dias. A tabela `friendships`
  existe no schema, mas o front não usa. Feed, ranking, Stories e `/athlete/:id`
  leem desses personagens (mesclados com `dojoProfile_<id>` do localStorage).
- Notificações da UI (sininho, painel, aba Amigos) e respostas: localStorage
  (`dojoNotifications_<id>`, `dojoNotifSeen_<id>`). `src/lib/notifications.js` e
  `useNotifications` já existem no Supabase, mas NÃO estão ligados à UI.
- Reações (Fogo/Força/Cutucar): contadores e limite diário em localStorage
  (`dojoReactionDeltas`, `dojoReactSent_<id>`). Tabela `reactions` sem uso no front.
- Stories vistos: localStorage.
- Telas do app-academia antigo (`/teacher`, `/academy`, `/teacher-checklist`)
  continuam roteadas, fora do foco.
- Migrations SQL (`supabase/migrations/001–003`) são rodadas à mão no SQL Editor.

## Arquitetura de dados (hoje)

Supabase (env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`): tabelas `profiles`,
`activities`, `friendships`, `reactions`, `notifications`, `story_views`;
buckets `profile-photos` e `training-photos`; RLS no banco.
localStorage só para o que ainda é demo (ver lista acima).

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026)

A Home ganhou peças importantes (streak, tira de frequência, contador de
reações com limite), mas ainda está simples. Sugestões, por impacto × esforço:

(Nota 31/10: B, E e parte de D já existem — "Treinou hoje", marcos, último
treino; G também — o perfil público já tem heatmap de 6 meses. Revise os
demais antes de começar.)

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

K. Backend (Supabase) — PARCIALMENTE FEITO. Já: login real multi-aparelho,
   perfil, treinos e foto do treino. Falta:
   - Amigos reais (friendships) no lugar de characters.js
   - Notificações e contador/limite de reações no banco
   - Entrada dos agentes code-reviewer e security-auditor (já há senhas)

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
próprio bolso. (O PWA básico já existe: manifest + sw.js.) Perfil e treinos
agora ficam no Supabase e acompanham o login; o que segue em localStorage
(notificações, reações) ainda começa do zero em cada aparelho.

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev` (precisa do `.env` com as chaves do Supabase). Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente perfil e treinos, que salvam no Supabase.
