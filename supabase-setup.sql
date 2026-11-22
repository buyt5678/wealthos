-- WEALTHOS v2.0 hardening: create a profile automatically for each new auth user.
-- Run in Supabase SQL Editor after the initial tables and RLS policies exist.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Restrict profile updates so users cannot change their own email field here.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own display name"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.savings_goals to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
