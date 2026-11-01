"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  InspiredChoice,
  InspiredChoiceGroup,
  InspiredField,
  InspiredFormCard,
  InspiredFormSplit,
  InspiredSubmit,
  underlineInputClassName,
  underlineInputErrorClassName,
  underlineSelectClassName,
} from "@/components/shared/inspiredForm";
import { useAdminStore } from "@/features/admin/store";
import type { CreateCampaignInput } from "@/types";
import {
  centsToRwf,
  formatCampaignStatus,
  formatRwf,
} from "@/lib/format/money";

type FormErrors = Partial<Record<keyof CreateCampaignInput, string>>;

const campaignTypes = [
  "UGC reaction",
  "Clipping (CPM)",
  "Product review",
  "Brand story",
  "Event coverage",
] as const;

const budgetPresets = [
  { label: "Under 500K", value: 400_000 },
  { label: "500K – 1M", value: 750_000 },
  { label: "1M – 3M", value: 2_000_000 },
  { label: "3M – 5M", value: 4_000_000 },
  { label: "5M+", value: 6_000_000 },
] as const;

function validate(input: CreateCampaignInput): FormErrors {
  const errors: FormErrors = {};
  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.brandName.trim()) errors.brandName = "Brand is required.";
  if (!input.campaignType.trim()) errors.campaignType = "Campaign type is required.";
  if (!input.budgetRwf || input.budgetRwf <= 0) {
    errors.budgetRwf = "Budget must be greater than zero.";
  }
  if (!input.deadline) {
    errors.deadline = "Deadline is required.";
  } else {
    const deadline = new Date(`${input.deadline}T23:59:59`);
    if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
      errors.deadline = "Deadline must be in the future.";
    }
  }
  return errors;
}

export function AdminCampaigns() {
  const { state, createCampaign } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCampaignInput>({
    title: "",
    brandName: "",
    campaignType: "",
    budgetRwf: 0,
    deadline: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    createCampaign(form);
    setForm({
      title: "",
      brandName: "",
      campaignType: "",
      budgetRwf: 0,
      deadline: "",
    });
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Campaigns" description="All active and past campaigns" />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {state.campaigns.length} campaign
          {state.campaigns.length === 1 ? "" : "s"} in the demo roster.
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black"
        >
          {showForm ? "Close form" : "Create campaign"}
        </button>
      </div>

      {showForm ? (
        <InspiredFormCard className="mb-10">
          <InspiredFormSplit
            aside={
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Admin
                </p>
                <h2 className="mt-3 text-balance text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
                  Launch the next campaign.
                </h2>
                <p className="mt-4 max-w-md text-base leading-6 text-gray-600">
                  Set the brief, budget, and deadline — creators and brands see it in their
                  portals once payment is confirmed.
                </p>
              </>
            }
            panel={
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <InspiredField id="title" label="Campaign title" required error={errors.title}>
                    <input
                      id="title"
                      className={errors.title ? underlineInputErrorClassName : underlineInputClassName}
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </InspiredField>
                  <InspiredField id="brandName" label="Brand name" required error={errors.brandName}>
                    <input
                      id="brandName"
                      className={
                        errors.brandName ? underlineInputErrorClassName : underlineInputClassName
                      }
                      value={form.brandName}
                      onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))}
                    />
                  </InspiredField>
                </div>

                <InspiredField
                  id="campaignType"
                  label="Campaign type"
                  required
                  error={errors.campaignType}
                >
                  <select
                    id="campaignType"
                    className={
                      errors.campaignType ? underlineInputErrorClassName : underlineSelectClassName
                    }
                    value={form.campaignType}
                    onChange={(e) => setForm((f) => ({ ...f, campaignType: e.target.value }))}
                  >
                    <option value="">Select type</option>
                    {campaignTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </InspiredField>

                <InspiredChoiceGroup legend="Budget (RWF)" required error={errors.budgetRwf}>
                  {budgetPresets.map((preset) => (
                    <InspiredChoice
                      key={preset.label}
                      selected={form.budgetRwf === preset.value}
                      onSelect={() => setForm((f) => ({ ...f, budgetRwf: preset.value }))}
                    >
                      {preset.label}
                    </InspiredChoice>
                  ))}
                </InspiredChoiceGroup>

                <InspiredField id="deadline" label="Deadline" required error={errors.deadline}>
                  <input
                    id="deadline"
                    type="date"
                    className={errors.deadline ? underlineInputErrorClassName : underlineInputClassName}
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  />
                </InspiredField>

                <InspiredSubmit>Save campaign</InspiredSubmit>
              </form>
            }
          />
        </InspiredFormCard>
      ) : null}

      {state.campaigns.length === 0 ? (
        <EmptyState message="No campaigns yet." />
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {state.campaigns.map((campaign) => {
            const budget = centsToRwf(campaign.budgetCents);
            const fee = Math.round(budget * ((campaign.feePercent ?? 20) / 100));
            return (
              <li key={campaign.id} className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                    {campaign.title}
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    {formatCampaignStatus(campaign.status)}
                  </p>
                </div>
                <div className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
                  {campaign.campaignType ? (
                    <p>
                      Type: {campaign.campaignType} · Budget: {formatRwf(budget)} · Fee (
                      {campaign.feePercent ?? 20}%): {formatRwf(fee)}
                    </p>
                  ) : null}
                  <p>
                    Creators assigned: {campaign.assignedCreators ?? 0} · Submissions:{" "}
                    {campaign.submissionsReceived ?? 0} received,{" "}
                    {campaign.submissionsApproved ?? 0} approved
                  </p>
                  {campaign.deadline ? <p>Deadline: {campaign.deadline}</p> : null}
                  {campaign.status === "draft" ? (
                    <p className="text-gray-500">
                      Awaiting brand payment confirmation before going live.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
