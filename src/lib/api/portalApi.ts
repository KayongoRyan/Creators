import { siteConfig } from "@/config/site";
import type { AdminState, BrandState, CreatorProfile, CreatorState } from "@/types";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";
import type { CreateCampaignInput } from "@/types";

export function isLiveApiMode() {
  return !siteConfig.useMockData;
}

export async function fetchAdminState(): Promise<AdminState> {
  return apiClient<AdminState>(apiEndpoints.admin.state);
}

export async function fetchBrandState(): Promise<BrandState> {
  return apiClient<BrandState>(apiEndpoints.brand.state);
}

export async function fetchCreatorState(): Promise<CreatorState> {
  return apiClient<CreatorState>(apiEndpoints.creator.state);
}

export async function apiCreateCampaign(input: CreateCampaignInput): Promise<void> {
  await apiClient(apiEndpoints.admin.campaigns, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiVerifyCreator(applicationId: string): Promise<void> {
  await apiClient(apiEndpoints.admin.creatorsVerify(applicationId), {
    method: "POST",
  });
}

export async function apiRejectCreator(applicationId: string): Promise<void> {
  await apiClient(apiEndpoints.admin.creatorsReject(applicationId), {
    method: "POST",
  });
}

export async function apiApproveSubmission(submissionId: string): Promise<void> {
  await apiClient(apiEndpoints.admin.submissionApprove(submissionId), {
    method: "POST",
  });
}

export async function apiRejectSubmission(submissionId: string): Promise<void> {
  await apiClient(apiEndpoints.admin.submissionReject(submissionId), {
    method: "POST",
  });
}

export async function apiRequestRevision(
  submissionId: string,
  note: string,
): Promise<void> {
  await apiClient(apiEndpoints.admin.submissionRevision(submissionId), {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export async function apiMarkPayoutPaid(payoutId: string): Promise<void> {
  await apiClient(apiEndpoints.admin.payoutMarkPaid(payoutId), {
    method: "POST",
  });
}

export async function apiMarkAllPayoutsPaid(): Promise<void> {
  await apiClient(apiEndpoints.admin.payoutsMarkAllPaid, { method: "POST" });
}

export async function apiApplyToCampaign(
  campaignId: string,
  pitch?: string,
): Promise<void> {
  await apiClient(apiEndpoints.creator.applications, {
    method: "POST",
    body: JSON.stringify({ campaignId, pitch }),
  });
}

export async function apiSubmitAssignment(
  assignmentId: string,
  postUrl: string,
): Promise<void> {
  await apiClient(apiEndpoints.creator.assignmentSubmit(assignmentId), {
    method: "POST",
    body: JSON.stringify({ postUrl }),
  });
}

export async function apiUpdateCreatorProfile(
  profile: Partial<CreatorProfile>,
): Promise<void> {
  await apiClient(apiEndpoints.creator.profile, {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}
