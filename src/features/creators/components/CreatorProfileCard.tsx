type CreatorProfileCardProps = {
  displayName: string;
  niche?: string;
};

export function CreatorProfileCard({
  displayName,
  niche,
}: CreatorProfileCardProps) {
  return (
    <article className="rounded-lg border border-neutral-200 p-4">
      <h3 className="font-medium">{displayName}</h3>
      {niche ? <p className="mt-1 text-sm text-neutral-600">{niche}</p> : null}
    </article>
  );
}
