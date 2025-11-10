-- Ensure reactions table and policies
create table if not exists public.profile_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null,
  user_id uuid not null,
  reaction_type text not null check (reaction_type in ('like','love','fire')),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_profile_comment_reactions_unique
  on public.profile_comment_reactions(comment_id, user_id, reaction_type);

alter table public.profile_comment_reactions enable row level security;

do $$ begin
  create policy "Reactions viewable by everyone"
  on public.profile_comment_reactions for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users add own reactions"
  on public.profile_comment_reactions for insert
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users remove own reactions or admin"
  on public.profile_comment_reactions for delete
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
exception when duplicate_object then null; end $$;

-- Ensure wishlist table for wishlist hook
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlist enable row level security;

do $$ begin
  create policy "Wishlist public readable"
  on public.wishlist for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Wishlist user manage own"
  on public.wishlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Allow admins to manage all profile comments (moderation)
alter table if exists public.profile_comments enable row level security;

do $$ begin
  create policy "Admins manage all comments"
  on public.profile_comments for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
exception when duplicate_object then null; end $$;