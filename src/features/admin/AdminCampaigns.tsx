"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Field, inputClassName, inputErrorClassName } from "@/components/shared/formField";
import { useAdminStore } from "@/features/admin/store";
import type { CreateCampaignInput } from "@/types";
import {
  centsToRwf,
  formatCampaignStatus,
  formatRwf,
} from "@/lib/format/money";

type FormErrors = Partial<Record<keyof CreateCampaignInput, string>>;

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
      <PageHeader
        title="Campaigns"
        description="All active and past campaigns"
      />
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
        <form
          onSubmit={onSubmit}
          className="mb-10 rounded-lg border border-black/10 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900">New campaign</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="title" label="Title" error={errors.title}>
              <input
                id="title"
                className={errors.title ? inputErrorClassName : inputClassName}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <Field id="brandName" label="Brand" error={errors.brandName}>
              <input
                id="brandName"
                className={errors.brandName ? inputErrorClassName : inputClassName}
                value={form.brandName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brandName: e.target.value }))
                }
              />
            </Field>
            <Field id="campaignType" label="Type" error={errors.campaignType}>
              <input
                id="campaignType"
                className={
                  errors.campaignType ? inputErrorClassName : inputClassName
                }
                placeholder="UGC reaction, Clipping (CPM), …"
                value={form.campaignType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, campaignType: e.target.value }))
                }
              />
            </Field>
            <Field id="budgetRwf" label="Budget (RWF)" error={errors.budgetRwf}>
              <input
                id="budgetRwf"
                type="number"
                min={1}
                className={errors.budgetRwf ? inputErrorClassName : inputClassName}
                value={form.budgetRwf || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    budgetRwf: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field id="deadline" label="Deadline" error={errors.deadline}>
              <input
                id="deadline"
                type="date"
                className={errors.deadline ? inputErrorClassName : inputClassName}
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </Field>
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black"
          >
            Save campaign
          </button>
        </form>
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
                      Type: {campaign.campaignType} · Budget: {formatRwf(budget)}{" "}
                      · Fee ({campaign.feePercent ?? 20}%): {formatRwf(fee)}
                    </p>
                  ) : null}
                  <p>
                    Creators assigned: {campaign.assignedCreators ?? 0} ·
                    Submissions: {campaign.submissionsReceived ?? 0} received,{" "}
                    {campaign.submissionsApproved ?? 0} approved
                  </p>
                  {campaign.deadline ? (
                    <p>Deadline: {campaign.deadline}</p>
                  ) : null}
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
