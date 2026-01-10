-- Local API users table for auth (separate from Supabase)
create table if not exists public.users (
  user_id uuid primary key,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin','voter')),
  created_at timestamptz not null default now(),
  constraint users_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade
);
