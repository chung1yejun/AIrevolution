import { Suspense } from "react";
import { Loading } from "@/components/ui";
import { InstitutionScreen } from "./InstitutionScreen";

async function InstitutionRoute({ params }: PageProps<"/institutions/[id]">) {
  const { id } = await params;
  return <InstitutionScreen key={id} id={id} />;
}

export default function Page(props: PageProps<"/institutions/[id]">) {
  return (
    <Suspense fallback={<main className="py-6"><Loading /></main>}>
      <InstitutionRoute {...props} />
    </Suspense>
  );
}
