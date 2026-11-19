begin;

insert into public.institutions (
  id, key, name, type, form_key, needs_expert, selectable, how_to_apply, is_sample
)
values
  (gen_random_uuid(), 'haneul_bank', '하늘은행', 'bank', 'bank', false, true,
    '가까운 지점 방문 또는 상속인 금융거래 조회 후 방문. 상속인 신분증, 아래 서류 지참', true),
  (gen_random_uuid(), 'dundun_life', '든든생명', 'insurance', 'insurance', false, true,
    '고객센터 전화 접수 후 서류 우편·방문 제출. 사망보험금 청구는 수익자가 신청', true),
  (gen_random_uuid(), 'baro_telecom', '바로텔레콤', 'telecom', 'telecom', false, true,
    '대리점 방문 또는 고객센터. 해지 또는 상속인 명의변경 선택', true),
  (gen_random_uuid(), 'hanbit_bank', '한빛은행', 'bank', null, false, true, '지점 방문', true),
  (gen_random_uuid(), 'purun_fire', '푸른화재', 'insurance', null, false, true, '고객센터 전화 접수', true),
  (gen_random_uuid(), 'nuri_mobile', '누리모바일', 'telecom', null, false, true, '대리점 방문', true),
  (gen_random_uuid(), 'car_registry', '차량등록사업소', 'car', null, true, false,
    '시·군·구청 차량등록사업소 방문. 상속 이전등록', true),
  (gen_random_uuid(), 'community_center', '주민센터', 'public', null, false, false,
    '고인 주소지 주민센터 방문 또는 정부24', true),
  (gen_random_uuid(), 'family_court', '가정법원', 'public', null, true, false,
    '관할 가정법원에 신청. 전문가 상담 권장', true),
  (gen_random_uuid(), 'tax_office', '세무서', 'public', null, true, false, '홈택스 또는 관할 세무서', true),
  (gen_random_uuid(), 'nhis_nps', '국민건강보험공단·국민연금공단', 'public', null, false, false,
    '사망신고 시 대부분 자동 처리. 고객센터로 확인', true)
on conflict (key) do update set
  name = excluded.name,
  type = excluded.type,
  form_key = excluded.form_key,
  needs_expert = excluded.needs_expert,
  selectable = excluded.selectable,
  how_to_apply = excluded.how_to_apply,
  is_sample = excluded.is_sample;

insert into public.documents (id, key, name, issuer)
values
  (gen_random_uuid(), 'death_cert', '사망진단서(또는 시체검안서)', '병원'),
  (gen_random_uuid(), 'family_rel', '가족관계증명서(고인 기준)', '주민센터·정부24'),
  (gen_random_uuid(), 'basic_cert', '기본증명서(고인 기준, 상세)', '주민센터·정부24'),
  (gen_random_uuid(), 'applicant_id', '신청인 신분증', '본인'),
  (gen_random_uuid(), 'inherit_agree', '상속인 동의서 또는 상속재산분할협의서', '상속인 작성'),
  (gen_random_uuid(), 'seal_cert', '상속인 인감증명서', '주민센터')
on conflict (key) do update set
  name = excluded.name,
  issuer = excluded.issuer;

commit;
