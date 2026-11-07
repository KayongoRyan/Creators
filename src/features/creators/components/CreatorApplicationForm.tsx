"use client";

import { useState } from "react";
import {
  InspiredChoice,
  InspiredChoiceGroup,
  InspiredField,
  InspiredSubmit,
  underlineInputClassName,
} from "@/components/shared/inspiredForm";
import { siteConfig } from "@/config/site";
import { apiEndpoints, joinApiUrl } from "@/lib/api";
import { creatorNicheGroups } from "../data/creatorNiches";

export function CreatorApplicationForm() {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [showNicheError, setShowNicheError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleNicheGroups = creatorNicheGroups
    .map((group) => ({
      ...group,
      niches: group.niches.filter((niche) =>
        `${group.label} ${niche.label} ${niche.examples}`
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    }))
    .filter((group) => group.niches.length > 0);

  if (submitted) {
    return (
      <p className="text-sm text-gray-700">
        Application received. We review every application manually. You will hear back within
        48 hours.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-6 sm:gap-7"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        if (selectedNiches.length === 0) {
          setShowNicheError(true);
          return;
        }
        if (siteConfig.useMockData) {
          setSubmitted(true);
          return;
        }
        const data = new FormData(event.currentTarget);
        const tiktok = String(data.get("tiktokHandle") ?? "").trim();
        const instagram = String(data.get("instagramHandle") ?? "").trim();
        const momo = String(data.get("momo") ?? "").trim();
        const screenshot = data.get("screenshot");
        if (!momo) {
          setError("Add the MoMo number payouts should go to.");
          return;
        }
        if (!tiktok && !instagram) {
          setError("Add a TikTok or Instagram handle.");
          return;
        }
        if (!(screenshot instanceof File) || screenshot.size === 0) {
          setError("Attach a screenshot of your profile or a recent post.");
          return;
        }
        data.set("niche", selectedNiches.join(", "));
        data.set("whyJoin", String(data.get("portfolio") ?? ""));
        setPending(true);
        try {
          const response = await fetch(joinApiUrl(apiEndpoints.public.creatorApplications), {
            method: "POST",
            body: data,
          });
          if (!response.ok) {
            setError("Could not submit that application. Check the form and try again.");
            return;
          }
          setSubmitted(true);
        } catch {
          setError("Could not reach the API.");
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <InspiredField id="fullName" label="Full name" required>
          <input id="fullName" name="fullName" required className={underlineInputClassName} />
        </InspiredField>
        <InspiredField id="email" label="Email" required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={underlineInputClassName}
          />
        </InspiredField>
      </div>

      <InspiredField
        id="nicheSearch"
        label="Search niches"
        hint="Select every topic you create content about."
      >
        <input
          id="nicheSearch"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Try food, travel, skincare..."
          className={underlineInputClassName}
        />
      </InspiredField>

      <InspiredChoiceGroup
        legend="Your niches"
        required
        error={showNicheError && selectedNiches.length === 0 ? "Choose at least one niche." : undefined}
      >
        {selectedNiches.map((niche) => (
          <InspiredChoice
            key={niche}
            selected
            onSelect={() =>
              setSelectedNiches((current) => current.filter((value) => value !== niche))
            }
          >
            {niche} ×
          </InspiredChoice>
        ))}
        {selectedNiches.length === 0 ? (
          <span className="text-sm text-gray-500">Pick topics below</span>
        ) : null}
      </InspiredChoiceGroup>

      <p aria-live="polite" className="-mt-2 text-sm font-medium text-gray-700">
        {selectedNiches.length} selected
      </p>

      <div className="max-h-[min(22rem,50vh)] space-y-5 overflow-y-auto pr-1">
        {visibleNicheGroups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {group.label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.niches.map((niche) => {
                const isSelected = selectedNiches.includes(niche.label);
                return (
                  <InspiredChoice
                    key={niche.label}
                    selected={isSelected}
                    onSelect={() => {
                      setSelectedNiches((current) =>
                        isSelected
                          ? current.filter((value) => value !== niche.label)
                          : [...current, niche.label],
                      );
                      setShowNicheError(false);
                    }}
                  >
                    {niche.label}
                  </InspiredChoice>
                );
              })}
            </div>
          </section>
        ))}
        {visibleNicheGroups.length === 0 ? (
          <p className="text-sm text-gray-600">
            No niches match that search. Try another word or browse all topics.
          </p>
        ) : null}
      </div>

      {selectedNiches.map((niche) => (
        <input key={niche} type="hidden" name="niches" value={niche} />
      ))}

      <div className="grid gap-6 sm:grid-cols-2">
        <InspiredField id="momo" label="MTN MoMo number" required>
          <input
            id="momo"
            name="momo"
            type="tel"
            autoComplete="tel"
            placeholder="0780000000"
            required
            className={underlineInputClassName}
          />
        </InspiredField>
        <InspiredField id="tiktokHandle" label="TikTok handle">
          <input
            id="tiktokHandle"
            name="tiktokHandle"
            placeholder="@handle"
            className={underlineInputClassName}
          />
        </InspiredField>
        <InspiredField id="instagramHandle" label="Instagram handle">
          <input
            id="instagramHandle"
            name="instagramHandle"
            placeholder="@handle"
            className={underlineInputClassName}
          />
        </InspiredField>
        <InspiredField id="tiktokFollowers" label="TikTok followers">
          <input
            id="tiktokFollowers"
            name="tiktokFollowers"
            type="number"
            min={0}
            defaultValue={0}
            className={underlineInputClassName}
          />
        </InspiredField>
        <InspiredField id="instagramFollowers" label="Instagram followers">
          <input
            id="instagramFollowers"
            name="instagramFollowers"
            type="number"
            min={0}
            defaultValue={0}
            className={underlineInputClassName}
          />
        </InspiredField>
      </div>

      <InspiredField id="screenshot" label="Profile screenshot" required hint="A recent post or your profile page.">
        <input
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/*"
          required
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </InspiredField>

      <InspiredField id="portfolio" label="Portfolio URL">
        <input id="portfolio" name="portfolio" type="url" className={underlineInputClassName} />
      </InspiredField>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      <InspiredSubmit disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </InspiredSubmit>
    </form>
  );
}
