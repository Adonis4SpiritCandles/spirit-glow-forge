-- Ensure realtime and robust toggles for reactions and follows, and auto-purge notifications

-- 1) Realtime configuration
alter table if exists public.profile_comment_reactions replica identity full;
alter table if exists public.profile_follows replica identity full;

-- Add to realtime publication (ignore if already present)
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.profile_comment_reactions';
  exception when duplicate_object then null; end;
  begin
    execute 'alter publication supabase_realtime add table public.profile_follows';
  exception when duplicate_object then null; end;
end$$;

-- 2) Toggle reaction function (security definer, validates auth)
create or replace function public.toggle_comment_reaction(
  p_comment_id uuid,
  p_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing_id uuid;
  v_action text;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  -- Normalize type to known values
  if p_type not in ('like','love','fire') then
    raise exception 'invalid_reaction_type';
  end if;

  select id into v_existing_id
  from public.profile_comment_reactions
  where comment_id = p_comment_id
    and user_id = v_user
    and reaction_type = p_type
  limit 1;

  if v_existing_id is not null then
    delete from public.profile_comment_reactions where id = v_existing_id;
    v_action := 'removed';
  else
    insert into public.profile_comment_reactions (comment_id, user_id, reaction_type)
    values (p_comment_id, v_user, p_type)
    on conflict (comment_id, user_id, reaction_type) do nothing;
    v_action := 'added';
  end if;

  return jsonb_build_object('action', v_action);
end;
$$;

revoke all on function public.toggle_comment_reaction(uuid, text) from public;
grant execute on function public.toggle_comment_reaction(uuid, text) to authenticated;

-- 3) Toggle follow function with notification on follow
create or replace function public.toggle_follow(
  target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing_id uuid;
  v_action text;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  if target_user_id is null or target_user_id = v_user then
    raise exception 'invalid_target';
  end if;

  select id into v_existing_id
  from public.profile_follows
  where follower_id = v_user and following_id = target_user_id
  limit 1;

  if v_existing_id is not null then
    delete from public.profile_follows where id = v_existing_id;
    v_action := 'unfollowed';
  else
    insert into public.profile_follows (follower_id, following_id)
    values (v_user, target_user_id)
    on conflict (follower_id, following_id) do nothing;
    v_action := 'followed';

    -- Create a social notification for the target user (ignore errors)
    begin
      insert into public.profile_notifications (user_id, actor_id, type, profile_user_id, read)
      values (target_user_id, v_user, 'follow', target_user_id, false);
    exception when others then null; end;
  end if;

  return jsonb_build_object('action', v_action);
end;
$$;

revoke all on function public.toggle_follow(uuid) from public;
grant execute on function public.toggle_follow(uuid) to authenticated;

-- 4) Auto purge notifications older than 30 days (on insert)
create or replace function public.purge_old_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Base notifications
  delete from public.notifications where created_at < now() - interval '30 days';
  -- Social notifications
  delete from public.profile_notifications where created_at < now() - interval '30 days';
  return null;
end;
$$;

-- Drop and recreate triggers to avoid duplicates
create or replace function public.ensure_purge_trigger(_table regclass)
returns void
language plpgsql as $$
begin
  execute format('drop trigger if exists trg_purge_%s on %s', _table::text, _table::text);
  execute format('create trigger trg_purge_%s after insert on %s for each statement execute function public.purge_old_notifications()', _table::text, _table::text);
end;$$;

select public.ensure_purge_trigger('public.notifications');
select public.ensure_purge_trigger('public.profile_notifications');

-- 5) Safety: ensure unique constraints exist (idempotent)
do $$
begin
  begin
    execute 'create unique index if not exists idx_pcr_unique on public.profile_comment_reactions (comment_id, user_id, reaction_type)';
  exception when others then null; end;
  begin
    execute 'create unique index if not exists idx_pf_unique on public.profile_follows (follower_id, following_id)';
  exception when others then null; end;
end$$;