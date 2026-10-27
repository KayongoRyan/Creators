"use client";

import { marketingType } from "@/lib/marketing";

export function CreatorApplicationForm() {
  return (
    <form
      className="mt-8 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label className={marketingType.formLabel}>
        Full name
        <input name="fullName" required className={marketingType.formInput} />
      </label>
      <label className={marketingType.formLabel}>
        Primary niche
        <input name="niche" required className={marketingType.formInput} />
      </label>
      <label className={marketingType.formLabel}>
        Portfolio URL
        <input
          name="portfolio"
          type="url"
          className={marketingType.formInput}
        />
      </label>
      <button type="submit" className={`${marketingType.ctaPrimary} w-fit`}>
        Submit application
      </button>
    </form>
  );
}
