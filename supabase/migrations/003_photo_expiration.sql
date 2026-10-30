-- DojoApp — Expiração de foto de treino (60 dias)
-- =====================================================================
-- COMO RODAR (Felipe)
-- 1. Supabase > SQL Editor > nova query.
-- 2. Cole todo este arquivo. Run. É idempotente.
-- 3. (Opcional, mas recomendado) Agendar `delete_expired_photos()` no
--    Dashboard > Database > Cron Jobs com schedule diário "0 3 * * *"
--    (3am UTC). Se o projeto tiver `pg_cron` habilitado, o bloco no final
--    deste arquivo já cria o agendamento sozinho. Caso contrário, deixa
--    o cron por fora e roda a função manualmente quando quiser:
--      select public.delete_expired_photos();
-- =====================================================================
-- O QUE FAZ
-- - Adiciona `photo_expires_at` em activities.
-- - Função `delete_expired_photos()`: pra cada activity com foto vencida,
--   remove o objeto do bucket `training-photos` e zera photo_url +
--   photo_expires_at. Metadados do treino ficam intactos (sport, duration,
--   mood, comment).
-- - Trigger auto-preenche `photo_expires_at = now() + 60 days` em todo
--   insert/update que tenha `photo_url not null` sem data definida.
-- =====================================================================

-- 1) Coluna
alter table public.activities
  add column if not exists photo_expires_at timestamptz;

-- Backfill: fotos existentes ganham 60 dias a partir de agora
update public.activities
   set photo_expires_at = now() + interval '60 days'
 where photo_url is not null
   and photo_expires_at is null;

create index if not exists activities_photo_expires_idx
  on public.activities(photo_expires_at)
  where photo_url is not null;

-- 2) Trigger pra manter o campo em dia
create or replace function public.set_photo_expiration()
returns trigger
language plpgsql
as $fn_set_expiration$
begin
  if new.photo_url is not null and new.photo_expires_at is null then
    new.photo_expires_at := now() + interval '60 days';
  elsif new.photo_url is null then
    new.photo_expires_at := null;
  end if;
  return new;
end;
$fn_set_expiration$;

drop trigger if exists activities_set_photo_expiration on public.activities;
create trigger activities_set_photo_expiration
  before insert or update of photo_url on public.activities
  for each row execute function public.set_photo_expiration();

-- 3) Função de limpeza (chama storage.delete_object pra cada foto expirada)
create or replace function public.delete_expired_photos()
returns integer
language plpgsql
security definer
as $fn_delete_expired$
declare
  rec record;
  deleted_count integer := 0;
  storage_path text;
  bucket_name constant text := 'training-photos';
begin
  for rec in
    select id, photo_url
      from public.activities
     where photo_url is not null
       and photo_expires_at is not null
       and photo_expires_at < now()
  loop
    -- Extrai o path dentro do bucket a partir da URL pública:
    -- https://<proj>.supabase.co/storage/v1/object/public/training-photos/<user_id>/<file>
    storage_path := regexp_replace(
      rec.photo_url,
      '^.*/storage/v1/object/public/' || bucket_name || '/',
      ''
    );

    if storage_path is not null and storage_path <> rec.photo_url then
      begin
        delete from storage.objects
         where bucket_id = bucket_name
           and name = storage_path;
      exception when others then
        -- Objeto já pode ter sido removido; segue zerando os metadados.
        null;
      end;
    end if;

    update public.activities
       set photo_url = null,
           photo_expires_at = null
     where id = rec.id;

    deleted_count := deleted_count + 1;
  end loop;

  return deleted_count;
end;
$fn_delete_expired$;

-- 4) Agendar via pg_cron se disponível (NO-OP silencioso se não estiver)
do $do_schedule_cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'dojo_delete_expired_photos') then
      perform cron.unschedule('dojo_delete_expired_photos');
    end if;
    perform cron.schedule(
      'dojo_delete_expired_photos',
      '0 3 * * *',
      $cron_cmd$ select public.delete_expired_photos(); $cron_cmd$
    );
  end if;
end;
$do_schedule_cron$;
