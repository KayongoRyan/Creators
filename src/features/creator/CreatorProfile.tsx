"use client";

import { useState } from "react";
import { Card, Meta, PageIntro } from "@/components/workspace/primitives";
import { Field, inputClassName } from "@/components/shared/formField";
import { useCreatorStore } from "@/features/creator/store";

export function CreatorProfile() {
  const { state, updateProfile } = useCreatorStore();
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageIntro title="My profile" subtitle="What brands see when you apply" />
      <Card>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          <Field id="displayName" label="Display name">
            <input
              id="displayName"
              className={inputClassName}
              value={state.profile.displayName}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
            />
          </Field>
          <Field id="tiktok" label="TikTok handle">
            <input
              id="tiktok"
              className={inputClassName}
              value={state.profile.tiktokHandle}
              onChange={(e) => updateProfile({ tiktokHandle: e.target.value })}
            />
          </Field>
          <Field id="instagram" label="Instagram handle">
            <input
              id="instagram"
              className={inputClassName}
              value={state.profile.instagramHandle}
              onChange={(e) =>
                updateProfile({ instagramHandle: e.target.value })
              }
            />
          </Field>
          <Field id="niche" label="Niche">
            <input
              id="niche"
              className={inputClassName}
              value={state.profile.niche}
              onChange={(e) => updateProfile({ niche: e.target.value })}
            />
          </Field>
          <Field id="momo" label="MoMo number">
            <input
              id="momo"
              className={inputClassName}
              value={state.profile.momo}
              onChange={(e) => updateProfile({ momo: e.target.value })}
            />
          </Field>
          <Meta>
            <strong>Status:</strong> {state.profile.label} ·{" "}
            {state.profile.campaignsCompleted} campaigns completed
          </Meta>
          <button
            type="submit"
            className="rounded-lg bg-[#141413] px-4 py-2 text-xs font-medium text-white"
          >
            {saved ? "Saved" : "Save profile"}
          </button>
        </form>
      </Card>
    </>
  );
}
