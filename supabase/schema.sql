-- DojoApp — schema inicial do Supabase.
-- Rode isto UMA vez no SQL Editor do projeto. Idempotente: pode rodar de novo
-- sem quebrar (usa IF NOT EXISTS onde dá).

-- =====================================================================
-- TABELAS
-- =====================================================================

-- profiles — espelha auth.users com os dados do perfil social.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  bio text check (char_length(bio) <= 150),
  main_sport text,
  belt text,
  weight integer,
  height integer,
  frame text default 'black',       -- moldura escolhida (black/coral/white/gold/etc)
  emblem text,                       -- selo de esporte (grapple/lift/run/swim/null)
  photo_url text,                    -- url pública no storage
  role_label text,                   -- opcional (ex: "O Veterano")
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- activities — cada treino registrado.
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sport text,
  duration_min integer,
  comment text check (char_length(comment) <= 240),
  mood text check (mood in ('exausto','sofreu','em alta','leve','técnico') or mood is null),
  photo_url text,                    -- url pública no storage
  created_at timestamptz default now()
);
create index if not exists activities_user_created_idx on public.activities(user_id, created_at desc);

-- friendships — relação bidirecional. Guardamos sempre as duas direções
-- (A→B e B→A) pra simplificar queries. Status gerencia pedido/aceito/bloqueado.
create table if not exists public.friendships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'accepted' check (status in ('pending','accepted','blocked')),
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- reactions — reações enviadas (Fogo/Força/Cutucar). Usamos pra respeitar
-- o limite diário por amigo e pra mostrar contador compartilhado.
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete set null,
  type text not null check (type in ('Fogo','Força','Cutucar','Parabéns')),
  created_at timestamptz default now()
);
create index if not exists reactions_to_day_idx on public.reactions(to_user_id, created_at desc);
create index if not exists reactions_from_day_idx on public.reactions(from_user_id, created_at desc);

-- notifications — avisos recebidos. "read_at null" = não lida.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('reaction','milestone','incentive','reply')),
  item text,
  message text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

-- story_views — quem viu story de quem (pra o ring ficar "visto").
create table if not exists public.story_views (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (user_id, friend_id, activity_id)
);

-- =====================================================================
-- RLS (Row Level Security)
-- =====================================================================

alter table public.profiles       enable row level security;
alter table public.activities     enable row level security;
alter table public.friendships    enable row level security;
alter table public.reactions      enable row level security;
alter table public.notifications  enable row level security;
alter table public.story_views    enable row level security;

-- profiles: todo mundo autenticado pode ler qualquer perfil (feed social),
-- só o dono pode criar/editar o próprio.
drop policy if exists "profiles read any" on public.profiles;
create policy "profiles read any" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- activities: dono vê e edita o próprio; amigos aceitos podem ler.
drop policy if exists "activities read own and friends" on public.activities;
create policy "activities read own and friends" on public.activities
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.friendships
      where user_id = auth.uid() and friend_id = activities.user_id and status = 'accepted'
    )
  );

drop policy if exists "activities insert own" on public.activities;
create policy "activities insert own" on public.activities
  for insert with check (auth.uid() = user_id);

drop policy if exists "activities update own" on public.activities;
create policy "activities update own" on public.activities
  for update using (auth.uid() = user_id);

drop policy if exists "activities delete own" on public.activities;
create policy "activities delete own" on public.activities
  for delete using (auth.uid() = user_id);

-- friendships: user vê as próprias; qualquer um autenticado pode criar
-- (pedido de amizade), só os envolvidos podem atualizar/deletar.
drop policy if exists "friendships read own" on public.friendships;
create policy "friendships read own" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friendships insert own" on public.friendships;
create policy "friendships insert own" on public.friendships
  for insert with check (auth.uid() = user_id);

drop policy if exists "friendships update involved" on public.friendships;
create policy "friendships update involved" on public.friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friendships delete involved" on public.friendships;
create policy "friendships delete involved" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- reactions: user vê o que enviou e o que recebeu; só pode inserir o próprio.
drop policy if exists "reactions read involved" on public.reactions;
create policy "reactions read involved" on public.reactions
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists "reactions insert own" on public.reactions;
create policy "reactions insert own" on public.reactions
  for insert with check (auth.uid() = from_user_id);

-- notifications: só o dono vê e marca como lida; qualquer autenticado pode
-- criar notificação pra outro (ex: enviar reação).
drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications insert any" on public.notifications;
create policy "notifications insert any" on public.notifications
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (auth.uid() = user_id);

-- story_views: só o próprio dono gerencia.
drop policy if exists "story_views own" on public.story_views;
create policy "story_views own" on public.story_views
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- STORAGE BUCKETS
-- =====================================================================
-- Dois buckets públicos (urls diretas para o app). Tamanho máximo por arquivo
-- 2 MB — já comprimimos pra ~100 KB no cliente, essa margem é só segurança.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('training-photos', 'training-photos', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Políticas de storage: qualquer autenticado lê (feed social),
-- só o dono escreve/deleta (nome do arquivo começa com o id do user).
drop policy if exists "training photos read any" on storage.objects;
create policy "training photos read any" on storage.objects
  for select using (bucket_id = 'training-photos');

drop policy if exists "training photos insert own" on storage.objects;
create policy "training photos insert own" on storage.objects
  for insert with check (
    bucket_id = 'training-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "training photos delete own" on storage.objects;
create policy "training photos delete own" on storage.objects
  for delete using (
    bucket_id = 'training-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile photos read any" on storage.objects;
create policy "profile photos read any" on storage.objects
  for select using (bucket_id = 'profile-photos');

drop policy if exists "profile photos insert own" on storage.objects;
create policy "profile photos insert own" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile photos update own" on storage.objects;
create policy "profile photos update own" on storage.objects
  for update using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile photos delete own" on storage.objects;
create policy "profile photos delete own" on storage.objects
  for delete using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Atualiza profiles.updated_at automaticamente ao editar.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Opcional: cria profile automaticamente quando usuário se cadastra.
-- Nome e username pegos do raw_user_meta_data do signup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
