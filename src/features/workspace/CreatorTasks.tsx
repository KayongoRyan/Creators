"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  Meta,
  Notice,
  PageIntro,
  SectionLabel,
  StatGrid,
  Tag,
} from "@/components/workspace/primitives";

export function CreatorTasks() {
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Notice>
        Your Primus Beer submission was approved! RWF 45,000 will be sent to
        your MoMo by Friday.
      </Notice>
      <PageIntro title="My tasks" subtitle="Campaigns you are assigned to" />
      <Card>
        <CardHeader
          title="Primus Beer — Reaction videos"
          tag={<Tag tone="green">Submitted ✓</Tag>}
        />
        <Meta>
          <strong>What to do:</strong> 20–60 sec reaction to the new can
          design. Use #PrimusRwanda.
          <br />
          <strong>Your payout:</strong> RWF 45,000 · <strong>Deadline:</strong>{" "}
          June 3
        </Meta>
        <hr className="my-3 border-[rgba(31,30,29,0.15)]" />
        <Meta>
          <strong>Submitted URL:</strong>{" "}
          <span className="text-[#3266ad]">tiktok.com/@mariekigali/video/123</span>
        </Meta>
      </Card>
      <Card>
        <CardHeader
          title="Iwacu Music — Clip this interview"
          tag={<Tag tone={submitted ? "green" : "amber"}>{submitted ? "Submitted ✓" : "Action needed"}</Tag>}
        />
        <Meta>
          <strong>What to do:</strong> Edit a 45–90 sec clip from the 20-min
          interview below. Best moment, good hook. Post on TikTok or Reels.
          <br />
          <strong>Source file:</strong>{" "}
          <span className="text-[#3266ad]">drive.google.com/… (link)</span>
          <br />
          <strong>Payout:</strong> RWF 28,000 · <strong>Deadline:</strong> June 8
        </Meta>
        {submitted ? (
          <p className="mt-3 text-xs text-[#3d3d3a]">
            <strong className="font-medium text-[#141413]">Submitted URL:</strong>{" "}
            <span className="text-[#3266ad]">{url}</span>
          </p>
        ) : (
          <form
            className="mt-2.5 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!url.trim()) return;
              setSubmitted(true);
            }}
          >
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste your TikTok/IG post URL here…"
              className="min-w-0 flex-1 rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-1.5 text-xs outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#141413] px-3 py-1.5 text-xs text-white"
            >
              Submit
            </button>
          </form>
        )}
      </Card>
      <SectionLabel>Earnings this month</SectionLabel>
      <StatGrid
        items={[
          { value: "RWF 45K", label: "Approved" },
          { value: "RWF 28K", label: "Pending" },
          { value: "2", label: "Campaigns done" },
        ]}
      />
    </>
  );
}
