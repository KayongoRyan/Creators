import { PageHeader } from "@/components/shared/PageHeader";
import { CreatorProfileCard, getCreators } from "@/features/creators";

export default async function AdminCreatorsPage() {
  const creators = await getCreators();

  return (
    <>
      <PageHeader title="Creators" />
      <div className="grid gap-4 sm:grid-cols-2">
        {creators.map((creator) => (
          <CreatorProfileCard
            key={creator.id}
            displayName={creator.displayName}
            niche={creator.niche}
          />
        ))}
      </div>
    </>
  );
}
