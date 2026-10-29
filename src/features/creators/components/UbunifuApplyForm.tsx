"use client";

import { useState } from "react";

const niches = [
  "Lifestyle",
  "Fashion",
  "Food",
  "Music / Entertainment",
  "Comedy",
  "Tech",
  "Business",
  "Sports",
];

export function UbunifuApplyForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-[13px] text-[#3d3d3a]">
        Application received. We review every application manually. You will
        hear back within 48 hours by WhatsApp or email.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
        Full name
        <input
          required
          placeholder="Your name"
          className="rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-2 text-[13px] text-[#141413] outline-none"
        />
      </label>
      <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
        Phone (MTN MoMo number)
        <input
          required
          type="tel"
          placeholder="+250 7XX XXX XXX"
          className="rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-2 text-[13px] text-[#141413] outline-none"
        />
      </label>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#73726c]">
        Your social handles
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
          TikTok username
          <input
            placeholder="@yourhandle"
            className="rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-2 text-[13px] text-[#141413] outline-none"
          />
        </label>
        <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
          Instagram username
          <input
            placeholder="@yourhandle"
            className="rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-2 text-[13px] text-[#141413] outline-none"
          />
        </label>
      </div>
      <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
        Content niche (what do you post about?)
        <select className="rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-2 text-[13px] text-[#141413] outline-none">
          {niches.map((niche) => (
            <option key={niche}>{niche}</option>
          ))}
        </select>
      </label>
      <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
        Share a screenshot of your TikTok/IG dashboard showing follower count
        and recent views
        <span className="rounded-lg border border-dashed border-[rgba(31,30,29,0.3)] px-5 py-5 text-center text-xs text-[#3d3d3a]">
          Upload screenshot
          <input type="file" accept="image/*" className="mt-2 block w-full text-xs" />
        </span>
      </label>
      <label className="mb-3 flex flex-col gap-1 text-xs text-[#3d3d3a]">
        Why do you want to join? (optional)
        <textarea
          placeholder="Tell us a bit about yourself and what you create…"
          className="h-16 resize-none rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-2 text-[13px] text-[#141413] outline-none"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[#141413] px-3 py-2.5 text-xs text-white"
      >
        Submit application →
      </button>
      <p className="mt-2.5 text-center text-[11px] text-[#73726c]">
        We review every application manually. You will hear back within 48
        hours by WhatsApp or email.
      </p>
    </form>
  );
}
