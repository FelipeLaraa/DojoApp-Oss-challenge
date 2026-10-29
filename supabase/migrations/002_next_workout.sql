-- DojoApp — Etapa 3 (PR 4, bugfix): próximo treino em profiles
-- =====================================================================
-- COMO RODAR (Felipe)
-- =====================================================================
-- 1. Supabase > SQL Editor do projeto DojoApp.
-- 2. Cola tudo. Clica Run. É idempotente — pode re-rodar sem medo.
--
-- POR QUE
-- - O chip âmbar "próximo treino" grava via AuthContext.updateUser({...}).
--   Esse update bate em public.profiles — e a coluna nextWorkout nunca
--   existiu. Resultado: UPDATE falha silenciosamente e nada persiste.
-- - jsonb (não colunas separadas) porque é 1 struct por user, lido só
--   pelo próprio dono, sem query por campo. Reduz churn de schema.
-- =====================================================================

alter table public.profiles
  add column if not exists next_workout jsonb;
