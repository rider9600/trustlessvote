-- Public schema for TrustlessVote (local dev)

create extension if not exists pgcrypto;

-- Ensure auth schema exists for GoTrue migrations
create schema if not exists auth authorization postgres;

-- Some environments (depending on image) may not create these roles; make them if missing.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;

-- Core app tables
create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'voter')),
  wallet_address text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  name text not null,
  description text,
  status text not null check (status in ('upcoming', 'ongoing', 'completed')),
  created_at timestamptz not null default now(),
  constraint elections_admin_id_fkey foreign key (admin_id) references public.profiles(id) on delete set null
);

create table if not exists public.election_phases (
  id uuid primary key default gen_random_uuid(),
  election_id uuid,
  phase text not null check (phase in ('registration', 'commit', 'reveal', 'results')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint election_phases_election_id_fkey foreign key (election_id) references public.elections(id) on delete cascade
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid,
  name text not null,
  party_name text,
  symbol text,
  logo_url text,
  photo_url text,
  biography text,
  created_at timestamptz not null default now(),
  constraint candidates_election_id_fkey foreign key (election_id) references public.elections(id) on delete cascade
);

create table if not exists public.candidate_manifestos (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid,
  vision_statement text,
  policy_points text,
  campaign_promises text,
  created_at timestamptz not null default now(),
  constraint candidate_manifestos_candidate_id_fkey foreign key (candidate_id) references public.candidates(id) on delete cascade
);

create table if not exists public.election_voters (
  id uuid primary key default gen_random_uuid(),
  election_id uuid,
  voter_id uuid,
  is_eligible boolean not null default true,
  has_committed boolean not null default false,
  has_revealed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint election_voters_election_id_fkey foreign key (election_id) references public.elections(id) on delete cascade,
  constraint election_voters_voter_id_fkey foreign key (voter_id) references public.profiles(id) on delete cascade,
  constraint election_voters_unique unique (election_id, voter_id)
);

create table if not exists public.election_blockchain_map (
  election_id uuid primary key,
  contract_address text not null,
  chain_name text,
  created_at timestamptz not null default now(),
  constraint election_blockchain_map_election_id_fkey foreign key (election_id) references public.elections(id) on delete cascade
);

create table if not exists public.admin_election_stats (
  admin_id uuid primary key,
  upcoming_count integer not null default 0,
  ongoing_count integer not null default 0,
  completed_count integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint admin_election_stats_admin_id_fkey foreign key (admin_id) references public.profiles(id) on delete cascade
);

-- Dev-friendly permissions: allow anon/authenticated/service_role full access to public schema.
-- (This is intentionally permissive for local dev.)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;

-- Disable RLS for local dev
alter table public.profiles disable row level security;
alter table public.elections disable row level security;
alter table public.election_phases disable row level security;
alter table public.candidates disable row level security;
alter table public.candidate_manifestos disable row level security;
alter table public.election_voters disable row level security;
alter table public.election_blockchain_map disable row level security;
alter table public.admin_election_stats disable row level security;
