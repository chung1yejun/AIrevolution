begin;

create function public.save_onboarding_answers(p_answers jsonb, p_rule_tasks jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (statement_timestamp() at time zone 'Asia/Seoul')::date;
  v_death_date date;
  v_task_count integer;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = '로그인이 필요해요.';
  end if;

  if jsonb_typeof(p_answers) is distinct from 'object'
     or jsonb_typeof(p_rule_tasks) is distinct from 'array' then
    raise invalid_parameter_value using message = '답변과 규칙 할 일을 확인해 주세요.';
  end if;

  if coalesce(p_answers ->> 'deathDate', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise invalid_parameter_value using message = '별세일은 YYYY-MM-DD 형식이어야 해요.';
  end if;
  v_death_date := (p_answers ->> 'deathDate')::date;

  if v_death_date > v_today or v_death_date < (v_today - interval '1 year')::date then
    raise invalid_parameter_value using message = '별세일은 오늘부터 1년 전 사이여야 해요.';
  end if;

  if coalesce(p_answers ->> 'region', '') not in (
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ) then
    raise invalid_parameter_value using message = '지역을 확인해 주세요.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rule_tasks) as input(task)
    where jsonb_typeof(task) is distinct from 'object'
       or jsonb_typeof(task -> 'ruleKey') is distinct from 'string'
       or btrim(task ->> 'ruleKey') = ''
  ) then
    raise invalid_parameter_value using message = '모든 규칙 할 일에 규칙 키가 필요해요.';
  end if;

  -- Lock the user's answers row before syncing tasks so concurrent saves serialize.
  insert into public.answers (user_id, relation, death_date, region, heir_count, will, updated_at)
  values (
    v_user_id,
    p_answers ->> 'relation',
    v_death_date,
    p_answers ->> 'region',
    p_answers ->> 'heirCount',
    p_answers ->> 'will',
    statement_timestamp()
  )
  on conflict (user_id) do update set
    relation = excluded.relation,
    death_date = excluded.death_date,
    region = excluded.region,
    heir_count = excluded.heir_count,
    will = excluded.will,
    updated_at = excluded.updated_at;

  insert into public.user_tasks as saved (
    user_id, rule_key, title, institution_id, institution_name, due_date, needs_expert, source
  )
  select
    v_user_id, input."ruleKey", input.title, institution.id,
    input."institutionName", input."dueDate", input."needsExpert", 'rule'
  from jsonb_to_recordset(p_rule_tasks) as input(
    "ruleKey" text,
    title text,
    "institutionKey" text,
    "institutionName" text,
    "dueDate" date,
    "needsExpert" boolean
  )
  left join public.institutions as institution on institution.key = input."institutionKey"
  on conflict (user_id, rule_key) where rule_key is not null do update set
    title = excluded.title,
    institution_id = excluded.institution_id,
    institution_name = excluded.institution_name,
    due_date = excluded.due_date,
    needs_expert = excluded.needs_expert
  where saved.source = 'rule';

  get diagnostics v_task_count = row_count;
  if v_task_count <> jsonb_array_length(p_rule_tasks) then
    raise unique_violation using message = '다른 방식으로 추가한 할 일과 규칙 키가 겹쳐요.';
  end if;

  delete from public.user_tasks as saved
  where saved.user_id = v_user_id
    and saved.source = 'rule'
    and saved.rule_key is not null
    and not exists (
      select 1
      from jsonb_array_elements(p_rule_tasks) as input(task)
      where input.task ->> 'ruleKey' = saved.rule_key
    );

  return jsonb_build_object('ok', true, 'taskCount', v_task_count);
end;
$$;

revoke execute on function public.save_onboarding_answers(jsonb, jsonb)
from public, anon, authenticated, service_role;
grant execute on function public.save_onboarding_answers(jsonb, jsonb) to authenticated;

commit;
