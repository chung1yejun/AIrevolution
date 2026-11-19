begin;

alter table public.institutions enable row level security;
alter table public.documents enable row level security;
alter table public.institution_documents enable row level security;
alter table public.agents enable row level security;
alter table public.profiles enable row level security;
alter table public.answers enable row level security;
alter table public.user_tasks enable row level security;
alter table public.analyses enable row level security;
alter table public.doc_checks enable row level security;
alter table public.delegations enable row level security;
alter table public.ai_usage enable row level security;

-- Set API privileges explicitly, independent of the project's default grants.
revoke all privileges on table
  public.institutions,
  public.documents,
  public.institution_documents,
  public.agents,
  public.profiles,
  public.answers,
  public.user_tasks,
  public.analyses,
  public.doc_checks,
  public.delegations,
  public.ai_usage
from public, anon, authenticated;

grant select on table
  public.institutions,
  public.documents,
  public.institution_documents,
  public.agents
to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.answers,
  public.user_tasks,
  public.analyses,
  public.doc_checks,
  public.delegations,
  public.ai_usage
to authenticated;

create policy institutions_authenticated_read
on public.institutions for select to authenticated
using (true);

create policy documents_authenticated_read
on public.documents for select to authenticated
using (true);

create policy institution_documents_authenticated_read
on public.institution_documents for select to authenticated
using (true);

create policy agents_authenticated_read
on public.agents for select to authenticated
using (true);

create policy profiles_own_rows
on public.profiles for all to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy answers_own_rows
on public.answers for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy user_tasks_own_rows
on public.user_tasks for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy analyses_own_rows
on public.analyses for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy doc_checks_own_rows
on public.doc_checks for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy delegations_own_rows
on public.delegations for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy ai_usage_own_rows
on public.ai_usage for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

commit;
