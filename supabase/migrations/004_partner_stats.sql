begin;

-- This public RPC returns only aggregates for the named partner.
create or replace function public.partner_stats() returns jsonb
language sql stable security definer
set search_path = public, pg_temp
as $$
with calendar as (
  select (now() at time zone 'Asia/Seoul')::date as today
), households as (
  select id, (created_at at time zone 'Asia/Seoul')::date as joined
  from public.profiles where partner = '하늘상조'
), progress as (
  select h.id, a.user_id is not null as answered,
         count(t.id) as total, count(t.id) filter (where t.done) as finished
  from households h
  left join public.answers a on a.user_id = h.id
  left join public.user_tasks t on t.user_id = h.id
  group by h.id, a.user_id
), classified as (
  select *, case
    when not answered then 1
    when total > 0 and finished = total then 5
    when round(100.0 * finished / nullif(total, 0)) >= 67 then 4
    when round(100.0 * finished / nullif(total, 0)) >= 34 then 3
    else 2 end as stage
  from progress
), monthly as (
  select count(*) as families from households, calendar
  where joined >= date_trunc('month', today)::date and joined <= today
), daily as (
  select today - offset_days as day, count(h.id) as count
  from calendar cross join generate_series(0, 13) as offsets(offset_days)
  left join households h on h.joined = today - offset_days
  group by today - offset_days
), stages as (
  select s.n, s.label, count(c.id) as count
  from (values (1,'질문 전'), (2,'0~33%'), (3,'34~66%'), (4,'67~99%'), (5,'완료')) s(n,label)
  left join classified c on c.stage = s.n
  group by s.n, s.label
)
select jsonb_build_object(
  'partner', '하늘상조', 'month', to_char(today, 'YYYY-MM'),
  'families', families, 'billing', families * 30000,
  'avgProgress', (select coalesce(round(avg(100.0 * finished / nullif(total, 0))), 0) from progress),
  'completed', (select count(*) from progress where total > 0 and total = finished),
  'daily', (select jsonb_agg(jsonb_build_object('date', day, 'count', count) order by day) from daily),
  'stages', (select jsonb_agg(jsonb_build_object('stage', label, 'count', count) order by n) from stages)
) from calendar, monthly;
$$;

revoke all on function public.partner_stats() from public;
grant execute on function public.partner_stats() to anon, authenticated;
commit;
