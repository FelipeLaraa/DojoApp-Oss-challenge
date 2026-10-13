# HANDOFF — DojoApp (estado atual)

> Este documento substitui o handoff original (que descrevia o app como "só
> frontend, nada funciona"). Aquele retrato está DESATUALIZADO. Abaixo, o que
> realmente funciona hoje, testado no navegador pelo Felipe.

Data: outubro/2026. Leia junto com o CLAUDE.md.

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

Molduras temáticas por esporte: Luta, Levantamento, Corrida, Natação — cada uma
com cor própria e um emblema (SVG) no canto. (São pequenas de propósito; o
refino visual fica pro agente designer.)

Navegação: lateral no desktop, inferior no mobile.

Build: `npm run build` passa limpo. Rode sempre antes de commitar.

## O que é FIXO/placeholder (ainda não é dado real)

- Status de atividade dos personagens (50 km, 4 dias, Inativo) — fixos em
  characters.js.
- Tempos no feed ("há 3 h") — fixos.
- Estatísticas numéricas do perfil (47 aulas, #12 ranking) — fixas.
- Botão "Registrar" na Home — placeholder (mostra toast).
- Barra de progresso de faixa — usa valores padrão.

Tudo isso vira real quando a tela "Registrar atividade" existir.

## Arquitetura de dados (hoje)

Sem backend. Tudo em localStorage:
- `dojoUser` / `dojoUserType` — sessão atual.
- `dojoProfile_<id>` — memória permanente de cada perfil (sobrevive a logout).
- `dojoNotifications_<id>` — notificações recebidas por perfil.
- `dojoNotifSeen_<id>` — timestamp do último visto (badge de não lidas).

Limite conhecido: localStorage é por navegador/aparelho. Multi-aparelho e login
real só com backend (Supabase), que é um passo futuro.

## Próximos passos

1. Registrar atividade — torna status, tempos e estatísticas reais.
2. Agente designer (contestador criativo) — cara premium.
3. Backend (Supabase) — login real e dados multi-aparelho; aí entram os agentes
   revisores (code-reviewer, security-auditor).

## Como continuar

Leia o CLAUDE.md para o modo de trabalho. Rode o app com `npm run dev`. Antes de
qualquer commit, `npm run build`. Commits pequenos. Não reconstrua o que já
funciona — especialmente o salvamento, que está correto.
