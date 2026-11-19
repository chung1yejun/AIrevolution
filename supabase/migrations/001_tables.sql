begin;

create table public.institutions (
  id uuid primary key,
  key text unique not null,
  name text not null,
  type text check (type in ('bank', 'insurance', 'telecom', 'car', 'public')),
  how_to_apply text not null,
  needs_expert boolean default false,
  form_key text check (form_key in ('bank', 'insurance', 'telecom')),
  selectable boolean default true,
  is_sample boolean default true
);

create table public.documents (
  id uuid primary key,
  key text unique,
  name text,
  issuer text
);

create table public.institution_documents (
  institution_id uuid references public.institutions (id),
  document_id uuid references public.documents (id),
  copies integer not null default 1,
  primary key (institution_id, document_id)
);

create table public.agents (
  id uuid primary key,
  name text,
  region text,
  cases integer,
  fee text,
  is_sample boolean default true
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  partner text not null default '하늘상조',
  created_at timestamptz not null default now()
);

create table public.answers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  relation text not null check (relation in ('spouse', 'child', 'parent', 'sibling', 'other', 'unknown')),
  death_date date not null,
  region text not null,
  heir_count text not null check (heir_count in ('1', '2', '3', '4+', 'unknown')),
  will text not null check (will in ('yes', 'no', 'unknown')),
  updated_at timestamptz not null default now()
);

create table public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  institution_id uuid references public.institutions (id),
  institution_name text not null,
  due_date date,
  done boolean not null default false,
  done_at timestamptz,
  source text not null check (source in ('rule', 'ai', 'manual')),
  rule_key text,
  needs_expert boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index user_tasks_user_id_rule_key_uidx
  on public.user_tasks (user_id, rule_key)
  where rule_key is not null;

create unique index user_tasks_user_id_institution_id_uidx
  on public.user_tasks (user_id, institution_id)
  where institution_id is not null and rule_key is null;

create table public.analyses (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  items jsonb not null,
  used_fallback boolean not null,
  created_at timestamptz default now()
);

create table public.doc_checks (
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id),
  checked_at timestamptz default now(),
  primary key (user_id, document_id)
);

create table public.delegations (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_id uuid references public.agents (id),
  task_ids uuid[] not null,
  status text not null default '신청됨',
  created_at timestamptz default now()
);

create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date,
  count integer not null default 0,
  primary key (user_id, day)
);

-- Keep API access closed until the policies in 002_rls.sql are applied.
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

commit;
