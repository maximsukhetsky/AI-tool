-- Initial schema: profiles, generations, usage, custom_prompts.
-- RLS is enabled on every table; users can only access their own rows.

-- Enums ----------------------------------------------------------------------

create type public.writing_mode as enum (
  'improve',
  'email',
  'linkedin',
  'technical',
  'translate',
  'tone'
);

create type public.tone as enum (
  'formal',
  'casual',
  'friendly',
  'confident',
  'empathetic'
);

-- Shared trigger functions ---------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles -------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan = 'free'),
  default_mode public.writing_mode,
  default_target_language text check (char_length(default_target_language) <= 64),
  default_tone public.tone,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create a profile row for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- generations ----------------------------------------------------------------

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode public.writing_mode not null,
  options jsonb not null default '{}'::jsonb,
  input text not null check (char_length(input) between 1 and 10000),
  output text not null,
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  created_at timestamptz not null default now()
);

create index generations_user_id_created_at_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

create policy "Users can view own generations"
  on public.generations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own generations"
  on public.generations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- usage ----------------------------------------------------------------------

-- One row per user per UTC day. Written only by the server (service role).
create table public.usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period date not null,
  request_count integer not null default 0 check (request_count >= 0),
  token_count integer not null default 0 check (token_count >= 0),
  primary key (user_id, period)
);

alter table public.usage enable row level security;

create policy "Users can view own usage"
  on public.usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- custom_prompts -------------------------------------------------------------

create table public.custom_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode public.writing_mode not null,
  name text not null check (char_length(name) between 1 and 80),
  instructions text not null check (char_length(instructions) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index custom_prompts_user_id_idx on public.custom_prompts (user_id);

create trigger custom_prompts_set_updated_at
  before update on public.custom_prompts
  for each row execute function public.set_updated_at();

-- Max 10 custom prompts per user.
create function public.enforce_custom_prompts_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.custom_prompts where user_id = new.user_id) >= 10 then
    raise exception 'custom_prompts_limit_reached'
      using errcode = 'check_violation',
            hint = 'A user can have at most 10 custom prompts.';
  end if;
  return new;
end;
$$;

create trigger custom_prompts_enforce_limit
  before insert on public.custom_prompts
  for each row execute function public.enforce_custom_prompts_limit();

alter table public.custom_prompts enable row level security;

create policy "Users can view own custom prompts"
  on public.custom_prompts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own custom prompts"
  on public.custom_prompts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own custom prompts"
  on public.custom_prompts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own custom prompts"
  on public.custom_prompts for delete
  to authenticated
  using ((select auth.uid()) = user_id);
