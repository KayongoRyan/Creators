"use client";

import { Button } from "@/components/ui/Button";

export function CreatorApplicationForm() {
  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Full name
        <input
          name="fullName"
          required
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Primary niche
        <input
          name="niche"
          required
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Portfolio URL
        <input
          name="portfolio"
          type="url"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <Button type="submit">Submit application</Button>
    </form>
  );
}
