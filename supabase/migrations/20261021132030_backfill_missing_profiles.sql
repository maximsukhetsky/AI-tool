-- Users created before the on_auth_user_created trigger existed have no profile row,
-- so saving preferences updated nothing. Create the missing rows (idempotent).
insert into public.profiles (id)
select u.id
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
