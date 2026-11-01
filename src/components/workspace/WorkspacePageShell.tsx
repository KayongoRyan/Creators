"use client";

import type { ReactNode } from "react";

export function WorkspacePageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="-mx-5 sm:-mx-8">
      <div className="mx-5 overflow-hidden rounded-[1.75rem] border border-black/10 bg-white sm:mx-8">
        <div className="border-b border-black/8 bg-neutral-950 px-6 py-8 text-white sm:px-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-white/65">{subtitle}</p> : null}
        </div>
        <div className="space-y-6 p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
