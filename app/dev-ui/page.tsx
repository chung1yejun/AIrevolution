import { Button, Card, Checkbox, Input, ProgressBar, Select, Tag } from "@/components/ui";

export default function DevUiPage() {
  return (
    <main className="mobile-frame space-y-8 py-8">
      <h1 className="text-[22px] font-bold">공통 UI 부품</h1>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">버튼</h2>
        <Button>계속해요</Button>
        <Button variant="secondary">나중에 해요</Button>
        <Button variant="ghost">자세히 봐요</Button>
        <Button disabled>비활성 버튼</Button>
        <Button loading>저장하는 중이에요</Button>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">카드와 태그</h2>
        <Card>준비할 서류를 확인해요.</Card>
        <div className="flex flex-wrap gap-2">
          <Tag variant="sample" />
          <Tag variant="ai" />
          <Tag variant="review" />
          <Tag variant="urgent" />
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">체크박스와 진행률</h2>
        <Checkbox label="서류를 준비했어요" defaultChecked />
        <Checkbox label="요청서를 제출했어요" />
        <ProgressBar value={(3 / 9) * 100} label="3/9 완료" />
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-bold">입력칸과 선택 목록</h2>
        <Input label="기관 이름" placeholder="기관 이름을 입력해 주세요" />
        <Input label="지점 이름" error="지점 이름을 입력해 주세요." />
        <Select label="기관 종류" defaultValue="">
          <option value="" disabled>기관 종류를 골라 주세요</option>
          <option value="bank">은행</option>
          <option value="insurance">보험</option>
        </Select>
      </section>
    </main>
  );
}
