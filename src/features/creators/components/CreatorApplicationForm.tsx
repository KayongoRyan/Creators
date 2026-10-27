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
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-[#00EC97]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Primary niche
        <input
          name="niche"
          required
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-[#00EC97]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Portfolio URL
        <input
          name="portfolio"
          type="url"
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-[#00EC97]"
        />
      </label>
      <Button type="submit" className="rounded-xl bg-[#171717] hover:bg-black">
        Submit application
      </Button>
    </form>
  );
}
