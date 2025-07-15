/* -------------------------------------------------------------------------- */
/* 01 - TABLES, INDEXES & BASIC RLS                                           */
/* -------------------------------------------------------------------------- */

-- Enable UUID helpers
create extension if not exists "uuid-ossp";

-------------------------------------------------------------------------------
-- USERS
-------------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default uuid_generate_v4(),
  email       text           not null unique,
  name        text,
  role        text           not null default 'Requester',          --  Admin | Creator | Requester
  created_at  timestamptz    not null default now(),
  updated_at  timestamptz    not null default now()
);

create index if not exists users_email_idx on public.users(email);

-------------------------------------------------------------------------------
-- COMPONENT REQUESTS
-------------------------------------------------------------------------------
create table if not exists public.component_requests (
  id                 text primary key,                               -- e.g. CR0001
  request_name       text        not null,
  justification      text        not null,
  requester_id       uuid references public.users(id),
  requester_name     text        not null,
  requester_email    text        not null,
  status             text        not null default 'Pending',         -- Pending | In Progress | Completed | Denied
  denial_reason      text,
  category           text        not null,                           -- Form | Navigation | Display | …
  severity           text        not null default 'Medium',          -- Low | Medium | High | Urgent
  project            text        not null default 'Manual',
  figma_link         text,
  figma_file_key     text,
  figma_file_name    text,
  figma_node_id      text,
  image_data         text,
  selection_data     jsonb,
  source             text        not null default 'manual',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists comp_req_status_idx    on public.component_requests(status);
create index if not exists comp_req_created_idx   on public.component_requests(created_at desc);

-------------------------------------------------------------------------------
-- API KEYS
-------------------------------------------------------------------------------
create table if not exists public.api_keys (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id),
  key_hash     text    not null unique,
  key_prefix   text    not null,                  -- first 8-10 chars, for lookup
  name         text,
  last_used_at timestamptz,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz,
  is_active    boolean     not null default true
);

create index if not exists api_keys_prefix_idx on public.api_keys(key_prefix);

-------------------------------------------------------------------------------
-- (Optional) Row Level Security                                               
-------------------------------------------------------------------------------
alter table public.users               enable row level security;
alter table public.component_requests  enable row level security;
alter table public.api_keys            enable row level security;

/*  A very permissive policy so things keep working while you refine RLS.      */
create policy if not exists admin_all on public.users
  for all using ( true );

create policy if not exists admin_all on public.component_requests
  for all using ( true );

create policy if not exists admin_all on public.api_keys
  for all using ( true );
