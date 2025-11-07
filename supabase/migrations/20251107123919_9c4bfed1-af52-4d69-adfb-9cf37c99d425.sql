-- 1) Public minimal directory for safe profile exposure
create table if not exists public.public_profile_directory (
  user_id uuid primary key,
  first_name text,
  last_name text,
  username text,
  profile_image_url text,
  public_profile boolean default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS and allow public reads only
alter table public.public_profile_directory enable row level security;

-- Clean up any existing policies to avoid duplicates
drop policy if exists "Public can read directory" on public.public_profile_directory;

drop policy if exists "Admins can manage directory" on public.public_profile_directory;

-- Anyone (including anon) can SELECT safe data
create policy "Public can read directory"
  on public.public_profile_directory
  for select
  using (true);

-- Only admins can modify directly (we prefer trigger-driven sync)
create policy "Admins can manage directory"
  on public.public_profile_directory
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2) Sync function from profiles (SECURITY DEFINER to bypass RLS on profiles)
create or replace function public.sync_public_profile_directory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_profile_directory as d (
    user_id, first_name, last_name, username, profile_image_url, public_profile, updated_at, created_at
  ) values (
    new.user_id, new.first_name, new.last_name, new.username, new.profile_image_url, coalesce(new.public_profile, true), now(), coalesce(new.created_at, now())
  )
  on conflict (user_id)
  do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    username = excluded.username,
    profile_image_url = excluded.profile_image_url,
    public_profile = excluded.public_profile,
    updated_at = now();

  return new;
end;
$$;

-- 3) Triggers on profiles for insert/update
-- Drop old triggers if exist
drop trigger if exists trg_sync_public_profile_directory_ins on public.profiles;
drop trigger if exists trg_sync_public_profile_directory_upd on public.profiles;

create trigger trg_sync_public_profile_directory_ins
  after insert on public.profiles
  for each row execute function public.sync_public_profile_directory();

create trigger trg_sync_public_profile_directory_upd
  after update on public.profiles
  for each row execute function public.sync_public_profile_directory();

-- 4) Initial backfill
insert into public.public_profile_directory (user_id, first_name, last_name, username, profile_image_url, public_profile, updated_at, created_at)
select p.user_id, p.first_name, p.last_name, p.username, p.profile_image_url, coalesce(p.public_profile, true), now(), coalesce(p.created_at, now())
from public.profiles p
on conflict (user_id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  username = excluded.username,
  profile_image_url = excluded.profile_image_url,
  public_profile = excluded.public_profile,
  updated_at = now();
