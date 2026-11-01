"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  Meta,
  Notice,
  SectionLabel,
  StatGrid,
  Tag,
} from "@/components/workspace/primitives";
import { WorkspaceHub } from "@/components/workspace/hub/WorkspaceHub";
import { readDemoSession } from "@/features/auth/demoSession";
import { routes } from "@/config/routes";
import { selectCreatorDashboard, useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";

export function CreatorDashboard() {
  const { state } = useCreatorStore();
  const metrics = selectCreatorDashboard(state);
  const approvedAssignment = state.assignments.find((a) => a.status === "approved");
  const [guest, setGuest] = useState(true);

  useEffect(() => {
    setGuest(!readDemoSession());
  }, []);

  return (
    <>
      <WorkspaceHub variant="creator" guest={guest} />

      {!guest ? (
        <div className="mt-16 space-y-6 border-t border-black/10 pt-10">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Your workspace</h2>
          {approvedAssignment ? (
            <Notice>
              Your Primus Beer submission was approved! {formatRwf(approvedAssignment.payoutRwf)}{" "}
              will be sent to your MoMo by Friday.
            </Notice>
          ) : null}
          <StatGrid
            items={[
              { value: formatRwf(metrics.approvedRwf), label: "Approved" },
              { value: formatRwf(metrics.pendingRwf), label: "Pending" },
              { value: String(state.profile.campaignsCompleted), label: "Campaigns done" },
            ]}
          />
          <SectionLabel>Needs action</SectionLabel>
          <Card>
            {metrics.actionNeeded === 0 ? (
              <Meta>All assigned tasks are submitted. Browse open campaigns for more work.</Meta>
            ) : (
              state.assignments
                .filter((a) => a.status === "not_submitted" || a.status === "revision")
                .map((task) => (
                  <Link
                    key={task.id}
                    href={routes.creator.tasks}
                    className="block border-b border-[rgba(31,30,29,0.15)] py-2 last:border-0"
                  >
                    <CardHeader
                      title={task.title}
                      tag={
                        <Tag tone={task.status === "revision" ? "blue" : "amber"}>
                          {task.status === "revision" ? "Revision" : "Action needed"}
                        </Tag>
                      }
                    />
                    <Meta>
                      Deadline {task.deadline} · Payout {formatRwf(task.payoutRwf)}
                    </Meta>
                  </Link>
                ))
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
