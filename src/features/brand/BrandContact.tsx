"use client";

import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell";

export function BrandContact() {
  return (
    <WorkspacePageShell eyebrow="Support" title="Contact us" subtitle="Your Ubunifu producer">
      <div className="space-y-4 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-5 text-sm leading-7 text-neutral-700 sm:px-5">
        <p>
          <span className="font-medium text-neutral-900">Producer:</span> Aline K.
        </p>
        <p>
          <span className="font-medium text-neutral-900">WhatsApp:</span> +250 788 000 111
        </p>
        <p>
          <span className="font-medium text-neutral-900">Email:</span> hello@ubunifu.dev
        </p>
        <p className="border-t border-black/8 pt-4 text-neutral-600">
          Message us when a brief changes, a creator misses a post, or you need the invoice resent.
        </p>
      </div>
    </WorkspacePageShell>
  );
}
