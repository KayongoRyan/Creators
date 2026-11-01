"use client";

import { useState } from "react";
import {
  InspiredChoice,
  InspiredChoiceGroup,
  InspiredField,
  InspiredSubmit,
  underlineInputClassName,
} from "@/components/shared/inspiredForm";
import { creatorNicheGroups } from "../data/creatorNiches";

export function CreatorApplicationForm() {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [showNicheError, setShowNicheError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <form
      className="flex flex-col gap-6 sm:gap-7"
      onSubmit={(e) => {
        e.preventDefault();
        setShowNicheError(selectedNiches.length === 0);
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

      <InspiredField id="portfolio" label="Portfolio URL">
        <input id="portfolio" name="portfolio" type="url" className={underlineInputClassName} />
      </InspiredField>

      <InspiredSubmit>Submit application</InspiredSubmit>
    </form>
  );
}
