-- Daily quota bookkeeping for public.usage. Called only by the server through
-- the service-role client; never exposed to anon or authenticated users.
-- The period is always the current UTC day, computed here so every caller agrees on it.

-- Atomically reserves one generation for the current UTC day.
-- Returns the updated row, or no row when the limit is already reached.
create function public.consume_quota(p_user_id uuid, p_limit integer)
returns table (period date, request_count integer)
language sql
set search_path = ''
as $$
  insert into public.usage as u (user_id, period, request_count)
  values (p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, period) do update
    set request_count = u.request_count + 1
    where u.request_count < p_limit
  returning u.period, u.request_count;
$$;

-- Gives back a reserved generation that produced no output.
create function public.release_quota(p_user_id uuid, p_period date)
returns void
language sql
set search_path = ''
as $$
  update public.usage
  set request_count = greatest(request_count - 1, 0)
  where user_id = p_user_id and period = p_period;
$$;

create function public.add_usage_tokens(p_user_id uuid, p_period date, p_tokens integer)
returns void
language sql
set search_path = ''
as $$
  update public.usage
  set token_count = token_count + greatest(p_tokens, 0)
  where user_id = p_user_id and period = p_period;
$$;

revoke execute on function public.consume_quota(uuid, integer) from public, anon, authenticated;
revoke execute on function public.release_quota(uuid, date) from public, anon, authenticated;
revoke execute on function public.add_usage_tokens(uuid, date, integer) from public, anon, authenticated;

grant execute on function public.consume_quota(uuid, integer) to service_role;
grant execute on function public.release_quota(uuid, date) to service_role;
grant execute on function public.add_usage_tokens(uuid, date, integer) to service_role;
