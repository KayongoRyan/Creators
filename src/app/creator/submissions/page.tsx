import { PageHeader } from "@/components/shared/PageHeader";
import { SubmissionList, getSubmissions } from "@/features/submissions";

export default async function CreatorSubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <>
      <PageHeader title="Submissions" />
      <SubmissionList submissions={submissions} />
    </>
  );
}
