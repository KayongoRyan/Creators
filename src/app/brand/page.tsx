import {
  Card,
  Meta,
  Notice,
  PageIntro,
  PersonRow,
  SectionLabel,
  StatGrid,
  Tag,
} from "@/components/workspace/primitives";

export default function BrandHomePage() {
  return (
    <>
      <Notice>
        Campaign &quot;Reaction videos&quot; is live. 5 of 8 creators have
        submitted.
      </Notice>
      <PageIntro
        title="Campaign #2 — Reaction videos"
        subtitle="Running June 1–15, 2026  ·  Budget: RWF 600,000"
      />
      <StatGrid
        items={[
          { value: "8", label: "Creators assigned" },
          { value: "5", label: "Submitted" },
          { value: "3", label: "Approved" },
        ]}
      />
      <SectionLabel>Content submitted</SectionLabel>
      <Card>
        <PersonRow
          initials="MK"
          tone="teal"
          name="@mariekigali"
          handle="TikTok · 28K followers · 34,200 views"
          aside={<Tag tone="green">Approved</Tag>}
        />
        <PersonRow
          initials="JB"
          tone="blue"
          name="@jbntwali"
          handle="TikTok · 12K followers · 18,700 views"
          aside={<Tag tone="green">Approved</Tag>}
        />
        <PersonRow
          initials="AG"
          tone="amber"
          name="@aminacreates"
          handle="Instagram · 9K followers"
          aside={<Tag tone="amber">Under review</Tag>}
        />
      </Card>
      <SectionLabel>Campaign brief</SectionLabel>
      <Card>
        <Meta>
          <strong>Task:</strong> Record a 20–60 sec reaction video to Primus
          Beer&apos;s new &quot;Celebrate Rwanda&quot; can design. Show the can,
          speak naturally in Kinyarwanda or French. Include the hashtag
          #PrimusRwanda.
          <br />
          <br />
          <strong>Requirements:</strong> Must be posted publicly on TikTok or
          Instagram Reels. Send us the post URL within 48 hours of posting.
        </Meta>
      </Card>
    </>
  );
}
