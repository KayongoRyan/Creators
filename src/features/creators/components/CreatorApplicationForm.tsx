"use client";

import { useState } from "react";
import { marketingType } from "@/lib/marketing";

const nicheGroups = [
  {
    label: "Beauty & personal care",
    niches: [
      { label: "Beauty & makeup", examples: "Makeup looks, tutorials, product reviews" },
      { label: "Skincare", examples: "Routines, ingredients, product testing" },
      { label: "Haircare", examples: "Styling, treatments, hair products" },
    ],
  },
  {
    label: "Fashion & style",
    niches: [
      { label: "Fashion & outfits", examples: "Outfit ideas, styling, seasonal looks" },
      { label: "Streetwear & trends", examples: "Street style, new releases, trend edits" },
      { label: "Sustainable fashion", examples: "Secondhand finds, mindful shopping" },
    ],
  },
  {
    label: "Food & drink",
    niches: [
      { label: "Recipes & cooking", examples: "Everyday meals, recipes, cooking tips" },
      { label: "Baking", examples: "Breads, desserts, decorating" },
      { label: "Restaurants & reviews", examples: "Restaurant visits, cafes, food finds" },
    ],
  },
  {
    label: "Health & wellness",
    niches: [
      { label: "Fitness & movement", examples: "Workouts, training, active living" },
      { label: "Wellness & mindfulness", examples: "Self-care, meditation, daily routines" },
      { label: "Nutrition", examples: "Food education, balanced eating, meal prep" },
    ],
  },
  {
    label: "Home & DIY",
    niches: [
      { label: "Interior design & decor", examples: "Room makeovers, decorating, home finds" },
      { label: "DIY & crafts", examples: "Handmade projects, repairs, creative how-tos" },
      { label: "Gardening", examples: "Plant care, growing food, outdoor spaces" },
    ],
  },
  {
    label: "Travel & outdoors",
    niches: [
      { label: "Travel guides", examples: "City guides, itineraries, places to stay" },
      { label: "Outdoor adventure", examples: "Hiking, camping, outdoor gear" },
      { label: "Local experiences", examples: "Things to do, local culture, hidden spots" },
    ],
  },
  {
    label: "Technology & gaming",
    niches: [
      { label: "Tech & gadgets", examples: "Device reviews, setup tours, comparisons" },
      { label: "Apps & software", examples: "App tips, tools, product walkthroughs" },
      { label: "Gaming", examples: "Gameplay, reviews, streaming, game culture" },
    ],
  },
  {
    label: "Family & pets",
    niches: [
      { label: "Parenting & family", examples: "Family life, activities, parenting tips" },
      { label: "Pets & animal care", examples: "Training, pet routines, product reviews" },
    ],
  },
  {
    label: "Education, business & finance",
    niches: [
      { label: "Learning & tutorials", examples: "Explainers, lessons, practical how-tos" },
      { label: "Career & productivity", examples: "Work life, organization, career advice" },
      { label: "Business & finance", examples: "Building a business, budgeting, money basics" },
    ],
  },
  {
    label: "Arts & entertainment",
    niches: [
      { label: "Music", examples: "Performances, music discovery, instruments" },
      { label: "Books & pop culture", examples: "Reviews, recommendations, fandoms" },
      { label: "Comedy & performance", examples: "Sketches, acting, live performance" },
    ],
  },
] as const;

export function CreatorApplicationForm() {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [showNicheError, setShowNicheError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleNicheGroups = nicheGroups
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
      className="mt-8 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setShowNicheError(selectedNiches.length === 0);
      }}
    >
      <label className={marketingType.formLabel}>
        Full name
        <input name="fullName" required className={marketingType.formInput} />
      </label>
      <fieldset
        aria-describedby="niche-help niche-selection-count"
        aria-required="true"
        className="flex flex-col gap-4"
      >
        <legend className="text-sm font-medium text-gray-900">
          Choose your niches
        </legend>
        <label className={marketingType.formLabel}>
          Search niches
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Try food, travel, skincare..."
            className={marketingType.formInput}
          />
        </label>
        <p id="niche-help" className="-mt-3 text-sm leading-5 text-gray-600">
          Select every topic you create content about. The examples can help you
          find the best fit.
        </p>
        <p
          id="niche-selection-count"
          aria-live="polite"
          className="text-sm font-medium text-gray-700"
        >
          {selectedNiches.length} selected
        </p>
        {selectedNiches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedNiches.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() =>
                  setSelectedNiches((current) =>
                    current.filter((value) => value !== niche),
                  )
                }
                className="rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                aria-label={`Remove ${niche} from selected niches`}
              >
                {niche} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
        {showNicheError && selectedNiches.length === 0 && (
          <p role="alert" className="-mt-3 text-sm text-red-700">
            Choose at least one niche to continue.
          </p>
        )}
        <div className="flex flex-col gap-5">
          {visibleNicheGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="mb-2 text-sm font-semibold text-gray-800">
                {group.label}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.niches.map((niche) => {
                  const isSelected = selectedNiches.includes(niche.label);

                  return (
                    <label
                      key={niche.label}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-black/10 bg-white hover:border-black/25"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name="niches"
                        value={niche.label}
                        checked={isSelected}
                        onChange={(event) => {
                          setSelectedNiches((current) =>
                            event.target.checked
                              ? [...current, niche.label]
                              : current.filter((value) => value !== niche.label),
                          );
                          setShowNicheError(false);
                        }}
                        className="mt-1 size-4 shrink-0 accent-emerald-600"
                      />
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {niche.label}
                        </span>
                        <span className="text-xs leading-5 text-gray-600">
                          {niche.examples}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
          {visibleNicheGroups.length === 0 && (
            <p className="rounded-lg border border-dashed border-black/20 px-4 py-6 text-sm text-gray-600">
              No niches match that search. Try another word or browse all topics.
            </p>
          )}
        </div>
      </fieldset>
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
