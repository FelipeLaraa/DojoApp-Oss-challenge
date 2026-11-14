# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: 2026-11-14 (conferido contra o código). Leia junto com o CLAUDE.md.

## Resumo em uma linha

O DojoApp é um hub social de atividade física (B2C, estilo Gym Rats + Strava).
O app já tem login real e registro de treino salvos no Supabase. O que falta é
o lado social real: os amigos ainda são fictícios.

## O que JÁ funciona (conferido no código)

Backend Supabase:
- Login e cadastro reais por e-mail/senha (AuthContext). Sessão persistida.
  Rotas protegidas. A entrada rápida por personagem saiu do Login.
- Perfil salva em `public.profiles` (nome, @usuário, bio, modalidade, faixa,
  peso, altura, moldura, emblema, foto, próximo treino). `updateUser` faz
  update real.
- Foto de perfil vai pro bucket `profile-photos`.

Registrar atividade (/register) — antes era o "próximo marco", agora existe:
- Modalidade, duração, distância, humor, comentário e foto, com modal de
  confirmação. Grava em `activities`. Foto comprimida, bucket `training-photos`,
  expira em 60 dias (metadados do treino ficam).
- `useActivities` refaz a busca ao gravar e ao voltar pra aba.
- Migração única localStorage -> Supabase dos treinos antigos, no login.
- Isso tornou REAIS, para o usuário logado: sequência, tira da semana, heatmap
  anual (Perfil), histórico mensal (/history/:yyyyMM), "treinou hoje" e a
  posição dele no Ranking.

Home (/student, "Seu dia"): escudo, stories da semana, sequência, chip de
próximo treino (salvo no perfil) e sininho.

Molduras temáticas (Luta, Levantamento, Corrida, Natação) com emblema.
Navegação: Home, Treinar, Ranking, Amigos, Perfil (inferior no mobile, lateral
no desktop). PWA básico (manifest + service worker em public/).

Build: `npm run build` (o script chama tools/generate-llms.js, que não existe
no repo; o `|| true` ignora). Rode antes de commitar.

## O que ainda é FIXO/localStorage (não é dado real)

- Amigos = 4 personagens fictícios em `src/data/characters.js` (status, tempos
  do feed, ~180 dias de histórico sintético, fotos geradas). Feed, Ranking,
  stories de amigos e /athlete/:id usam isso.
- Notificações: sininho e Friends ainda usam `dojoNotifications_<id>` no
  localStorage. `src/lib/notifications.js` e `useNotifications` (Supabase)
  existem mas NENHUMA tela os usa ainda.
- Reações: contadores e limites diários em localStorage (`dojoReactionDeltas`,
  `dojoReactSent_<id>`). Não são compartilhados entre aparelhos.
- Tabelas `friendships`, `reactions` e `story_views` existem no schema.sql,
  sem uso no front.
- Telas /teacher, /academy e /teacher-checklist: resquício, fora da navegação.
- Projeto Supabase: SQL precisa ser rodado manualmente no SQL Editor
  (schema.sql, depois migrations/001–003). Env: VITE_SUPABASE_URL e
  VITE_SUPABASE_ANON_KEY. O SDK vem de esm.sh, não do npm.

## Arquitetura de dados (hoje)

Supabase: `profiles`, `activities`, buckets `training-photos` e
`profile-photos`, com RLS. Ainda no localStorage: notificações dos amigos
fictícios, contadores de reação, "visto" de stories e do sininho.

## Próximos passos

### Curto prazo — enriquecer a Home (o Felipe pediu, 13/10/2026)

A Home ganhou peças importantes (streak, tira de frequência, contador de
reações com limite), mas ainda está simples. Sugestões, por impacto × esforço:

A. REMOVER / SUBSTITUIR a "20/60 aulas · 33%" do resumo
   É resquício do app-academia antigo. Hoje confunde — "aulas" não faz sentido
   num hub genérico. Opções: substituir por "meta da semana" (ex: 4 treinos,
   1/4 ✓) OU remover até existir meta real.

B. "Treinou hoje?" em destaque no resumo (registro já existe; verificar o que a Home já mostra)
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

K. Backend (Supabase) — PARCIALMENTE FEITO (nov/2026)
   Já feito: login real, perfil, treinos e fotos no banco.
   Falta: amigos reais (friendships), reações e notificações compartilhadas
   (trocar localStorage/characters.js pelas tabelas que já existem),
   entrada dos agentes code-reviewer e security-auditor (agora obrigatórios).

## Rota pra virar app de celular (sem reescrever)

O app já foi construído mobile-first (viewport 375px, nav flutuante, touch
targets grandes). O trabalho pesado já está feito. Rota recomendada, do
mais fácil pro mais trabalhoso:

1. **PWA** (grátis; manifest e service worker JÁ existem em public/ — falta validar a instalação no celular). O usuário
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
próprio bolso. Treinos e perfil agora vivem no Supabase e acompanham o login
entre aparelhos; notificações e reações (localStorage) ainda não.

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento, que está correto.
