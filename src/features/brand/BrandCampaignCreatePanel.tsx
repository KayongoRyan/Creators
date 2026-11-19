"use client";

import { useState } from "react";
import {
  workspaceFieldClass,
  workspaceFieldErrorClass,
  workspacePrimaryButton,
  workspaceSectionLabel,
} from "@/components/workspace/workspacePageUi";
import type { BrandCreateCampaignInput } from "@/types";
import { cn } from "@/lib/utils/cn";

const campaignTypes = [
  "UGC reaction",
  "Clipping (CPM)",
  "Product review",
  "Brand story",
  "Event UGC",
  "Photo UGC",
] as const;

type FormErrors = Partial<Record<keyof BrandCreateCampaignInput, string>>;

function validate(input: BrandCreateCampaignInput): FormErrors {
  const errors: FormErrors = {};
  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.campaignType.trim()) errors.campaignType = "Pick a format.";
  if (!input.budgetRwf || input.budgetRwf <= 0) {
    errors.budgetRwf = "Budget must be greater than zero.";
  }
  if (!input.deadline) errors.deadline = "Set a target date.";
  return errors;
}

export function BrandCampaignCreatePanel({
  onSubmit,
  onCancel,
  pending = false,
}: {
  onSubmit: (input: BrandCreateCampaignInput) => void | Promise<void>;
  onCancel: () => void;
  pending?: boolean;
}) {
  const [form, setForm] = useState<BrandCreateCampaignInput>({
    title: "",
    campaignType: campaignTypes[0],
    budgetRwf: 500_000,
    deadline: "",
    brief: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-6 text-left shadow-sm sm:p-8"
    >
      <p className={workspaceSectionLabel}>New brief</p>
      <h2 className="mt-2 text-lg font-semibold text-neutral-900">Create a campaign</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Saves as a draft and adds a pending invoice — creators see it after you confirm payment.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="brand-cmp-title" className="text-sm font-medium text-neutral-800">
            Campaign title
          </label>
          <input
            id="brand-cmp-title"
            className={cn("mt-1", errors.title ? workspaceFieldErrorClass : workspaceFieldClass)}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Summer launch reaction videos"
          />
          {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title}</p> : null}
        </div>

        <div>
          <label htmlFor="brand-cmp-type" className="text-sm font-medium text-neutral-800">
            Format
          </label>
          <select
            id="brand-cmp-type"
            className={cn("mt-1", workspaceFieldClass)}
            value={form.campaignType}
            onChange={(e) => setForm((f) => ({ ...f, campaignType: e.target.value }))}
          >
            {campaignTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brand-cmp-budget" className="text-sm font-medium text-neutral-800">
              Creator budget (RWF)
            </label>
            <input
              id="brand-cmp-budget"
              type="number"
              min={1}
              className={cn("mt-1", errors.budgetRwf ? workspaceFieldErrorClass : workspaceFieldClass)}
              value={form.budgetRwf || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetRwf: Number(e.target.value) || 0 }))
              }
            />
            {errors.budgetRwf ? (
              <p className="mt-1 text-xs text-red-600">{errors.budgetRwf}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="brand-cmp-deadline" className="text-sm font-medium text-neutral-800">
              Target date
            </label>
            <input
              id="brand-cmp-deadline"
              type="date"
              className={cn("mt-1", errors.deadline ? workspaceFieldErrorClass : workspaceFieldClass)}
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
            {errors.deadline ? (
              <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="brand-cmp-brief" className="text-sm font-medium text-neutral-800">
            Brief (optional)
          </label>
          <textarea
            id="brand-cmp-brief"
            rows={3}
            className={cn("mt-1 resize-y", workspaceFieldClass)}
            value={form.brief}
            onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
            placeholder="What should creators deliver?"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="submit"
          disabled={pending}
          className={cn(workspacePrimaryButton, "min-h-11 w-full sm:w-auto disabled:opacity-60")}
        >
          {pending ? "Creating…" : "Create campaign"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="min-h-11 w-full rounded-full border border-black/15 px-5 text-sm font-medium text-neutral-900 sm:w-auto disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function BrandCampaignEmptyCta({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 px-6 py-14 text-center">
      <p className="max-w-sm text-sm text-neutral-600">
        No campaigns in the demo roster yet. Start a new brief to invite creators.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className={cn(workspacePrimaryButton, "mt-6 min-h-11 px-8")}
      >
        Create new campaign
      </button>
    </div>
  );
}