# DojoApp — Manual do Projeto

Este arquivo é lido automaticamente por qualquer agente que abrir o projeto.
Ele descreve o que é o DojoApp, o estado real do código e as regras de trabalho.

## O que é o DojoApp

Aplicativo para academias de artes marciais que conecta três tipos de usuário:
aluno, professor e academia. Modalidades prioritárias: Brazilian Jiu-Jitsu (BJJ)
e Wrestling Olímpico.

O diferencial operacional é o fluxo de presença: o aluno confirma presença antes
da aula, faz check-in presencial (QR Code ou geolocalização), e o professor
finaliza a presença num checklist após a aula. A presença contabilizada alimenta
o histórico e a progressão do aluno.

O diferencial de experiência é a gamificação com dados internos (estilo Duolingo
+ Gym Rats): metas pessoais no centro, com camada social entre colegas. Pontos,
sequência de treinos, barra de progressão e ranking nascem do uso do próprio app,
não de API externa.

Idioma do produto (o que o usuário final vê): português brasileiro.

## Estado real do código (inspecionado em 2026-10-12)

ATENÇÃO: o código atual foi gerado por vibe coding (Hostinger Horizons). É um
frontend visual sem lógica real. Não presuma que algo funciona só porque a tela
existe.

Stack confirmada:
- React 18 + Vite 4 (build e dev server)
- Tailwind CSS 3 (estilo)
- react-router-dom 6 (navegação)
- Radix UI + framer-motion + lucide-react (componentes e ícones)

O que NÃO existe ainda:
- Backend (nenhum)
- Banco de dados (nenhum)
- Autenticação real (o login aceita qualquer email/senha e inventa o usuário)
- Persistência real (só localStorage, perdido ao trocar de aparelho)

O que é falso hoje:
- Login: cria um usuário fake a partir do texto antes do @ do email
- Estatísticas do perfil: números fixos chumbados no código
- Botão "Salvar Alterações" do perfil: não salva nada, só mostra um toast

O que serve de base:
- Nove telas organizadas em src/pages/
- Componentes reutilizáveis: ShieldProfile (moldura escudo), ProgressBar
- AuthContext em src/contexts/ (hoje só localStorage)

## Foco atual

Perfil do usuário (aluno). Academia e professor vêm depois.
Não ampliar escopo sem combinar antes.

## Regras de trabalho

- Código em inglês (variáveis, funções, commits). Comunicação com o usuário em
  português. Interface do app em português.
- Commits pequenos e frequentes: uma mudança lógica, um commit.
- Sem testes automatizados neste estágio. Foco em fazer funcionar.
- O usuário é o idealizador do produto, não programador experiente. Explique
  termos técnicos de forma direta e didática, com poucas palavras.
- Mudanças incrementais e verificáveis. Não reconstruir tudo porque uma tela
  precisa mudar.
