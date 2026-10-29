-- DojoApp — Etapa 3 (PR 1): Activities no Supabase
-- =====================================================================
-- COMO RODAR (Felipe)
-- =====================================================================
-- 1. Entre no Supabase > SQL Editor do projeto DojoApp.
-- 2. Cole TODO o conteúdo deste arquivo em uma nova query.
-- 3. Clique Run. Deve passar sem erro (é idempotente — pode rodar de novo).
-- 4. Depois do OK, me avisa que eu toco o PR 2 (reescrita do activity.js).
--
-- O QUE ESTA MIGRAÇÃO FAZ
-- - Ajusta a tabela `activities` que já veio no schema.sql inicial.
-- - Adiciona `distance_km` (o form já coleta pra Corrida/Natação/Musculação).
-- - RESTRINGE a leitura: só o próprio user vê os próprios treinos.
--   A leitura por amigos fica pra Etapa 4 (feed social). O schema.sql
--   original já abria pra amigos — essa policy é removida aqui.
-- - Garante que o bucket `training-photos` (já criado no schema.sql) tem
--   as policies certas pra fotos de treino.
--
-- O QUE NÃO ENTRA (deliberado, Alex PM: schema mínimo viável)
-- - Campos opcionais do addActivity() que o FORM atual não envia:
--   local, positions, partner, rolls, submissions, caught, note.
--   O form só manda: sport, duration_min, distance_km, comment, mood, photo.
--   Esses outros entram quando a tela os reativar — colocar nullable agora
--   seria over-engineering num form que ainda tá se definindo.
-- =====================================================================

-- 1) Coluna que faltava no schema inicial.
alter table public.activities
  add column if not exists distance_km numeric;

-- 2) RLS já tá ligado pelo schema.sql, mas garantimos.
alter table public.activities enable row level security;

-- 3) Policies: dropar as que existem e recriar restritas ao próprio user.
--    (A policy de leitura antiga abria pra amigos; isso volta na Etapa 4.)
drop policy if exists "activities read own and friends" on public.activities;
drop policy if exists "activities read own"             on public.activities;
drop policy if exists "activities insert own"           on public.activities;
drop policy if exists "activities update own"           on public.activities;
drop policy if exists "activities delete own"           on public.activities;

create policy "activities read own" on public.activities
  for select using (auth.uid() = user_id);

create policy "activities insert own" on public.activities
  for insert with check (auth.uid() = user_id);

create policy "activities update own" on public.activities
  for update using (auth.uid() = user_id);

create policy "activities delete own" on public.activities
  for delete using (auth.uid() = user_id);

-- 4) Índice de consulta já criado no schema.sql, mas garantimos:
create index if not exists activities_user_created_idx
  on public.activities(user_id, created_at desc);

-- 5) Bucket de foto de treino: o schema.sql original já criou `training-photos`.
--    Reusamos esse (evita duplicar). As policies abaixo são idempotentes —
--    passam se o schema.sql já rodou, e também passam numa base limpa.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('training-photos', 'training-photos', true, 2097152,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Policies de storage: leitura pública (feed e perfil mostram a foto),
-- escrita/delete só pelo dono (nome do arquivo começa com <user_id>/).
drop policy if exists "training photos read any"    on storage.objects;
drop policy if exists "training photos insert own"  on storage.objects;
drop policy if exists "training photos update own"  on storage.objects;
drop policy if exists "training photos delete own"  on storage.objects;

create policy "training photos read any" on storage.objects
  for select using (bucket_id = 'training-photos');

create policy "training photos insert own" on storage.objects
  for insert with check (
    bucket_id = 'training-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "training photos update own" on storage.objects
  for update using (
    bucket_id = 'training-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "training photos delete own" on storage.objects
  for delete using (
    bucket_id = 'training-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
