/* -------------------------------------------------------------------------- */
/* 02 -  STORED FUNCTIONS & UTILITIES                                         */
/* -------------------------------------------------------------------------- */

-------------------------------------------------------------------------------
-- Helper: generate the next request id  (CR0001, CR0002, …)
-------------------------------------------------------------------------------
create or replace function public.generate_next_request_id()
returns text
language plpgsql
as $$
declare
  latest_id text;
  latest_num int;
  next_num  int;
begin
  select id
    into latest_id
    from public.component_requests
   where id ~ '^CR[0-9]+$'
order by id desc
   limit 1;

  if latest_id is null then
    next_num := 1;
  else
    latest_num := (regexp_replace(latest_id, '^CR', ''))::int;
    next_num  := latest_num + 1;
  end if;

  return 'CR' || lpad(next_num::text, 4, '0');
end;
$$;

-------------------------------------------------------------------------------
-- Helper: create user if not exists, return id
-------------------------------------------------------------------------------
create or replace function public.create_or_get_user (
  p_email  text,
  p_name   text default null,
  p_role   text default 'Requester'
)
returns uuid
language plpgsql
as $$
declare
  u_id uuid;
begin
  select id into u_id from public.users where email = p_email;

  if u_id is null then
    insert into public.users (email, name, role)
    values (p_email, p_name, p_role)
    returning id into u_id;
  end if;

  return u_id;
end;
$$;

-------------------------------------------------------------------------------
-- Helper: validate api key (hash comparison)
-------------------------------------------------------------------------------
create or replace function public.validate_api_key(p_key_hash text)
returns setof public.api_keys
language sql
as $$
  select * from public.api_keys
   where key_hash = p_key_hash
     and is_active = true
     and (expires_at is null or expires_at > now());
$$;

-------------------------------------------------------------------------------
-- Helper: quick stats for the dashboard
-------------------------------------------------------------------------------
create or replace function public.get_request_stats()
returns json
language plpgsql
as $$
declare
  total       int;
  pending     int;
  in_progress int;
  completed   int;
  denied      int;
begin
  select count(*) into total from public.component_requests;
  select count(*) into pending     from public.component_requests where status = 'Pending';
  select count(*) into in_progress from public.component_requests where status = 'In Progress';
  select count(*) into completed   from public.component_requests where status = 'Completed';
  select count(*) into denied      from public.component_requests where status = 'Denied';

  return json_build_object(
    'total', total,
    'pending', pending,
    'in_progress', in_progress,
    'completed', completed,
    'denied', denied
  );
end;
$$;

-------------------------------------------------------------------------------
-- Procedure: create new component request and return the row
-------------------------------------------------------------------------------
create or replace function public.create_component_request (
  p_request_name     text,
  p_justification    text,
  p_requester_name   text,
  p_requester_email  text,
  p_category         text,
  p_severity         text,
  p_project          text,
  p_figma_link       text,
  p_source           text default 'manual'
)
returns public.component_requests
language plpgsql
as $$
declare
  new_id text;
  req    public.component_requests;
  req_user uuid;
begin
  new_id   := public.generate_next_request_id();
  req_user := public.create_or_get_user(p_requester_email, p_requester_name, 'Requester');

  insert into public.component_requests (
    id, request_name, justification, requester_id,
    requester_name, requester_email, category, severity,
    project, figma_link, source
  ) values (
    new_id, p_request_name, p_justification, req_user,
    p_requester_name, p_requester_email, p_category, p_severity,
    p_project, p_figma_link, p_source
  )
  returning * into req;

  return req;
end;
$$;

-------------------------------------------------------------------------------
-- Procedure: update request status (with optional denial reason)
-------------------------------------------------------------------------------
create or replace function public.update_request_status (
  p_request_id text,
  p_status     text,
  p_denial_reason text default null
)
returns boolean
language plpgsql
as $$
begin
  update public.component_requests
     set status        = p_status,
         denial_reason = p_denial_reason,
         updated_at    = now()
   where id = p_request_id;

  return true;
end;
$$;
