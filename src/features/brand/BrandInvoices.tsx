"use client";

import {
  Card,
  PageIntro,
  ReportLine,
  SectionLabel,
} from "@/components/workspace/primitives";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

export function BrandInvoices() {
  const { state } = useBrandStore();

  return (
    <>
      <PageIntro title="Invoices" subtitle={`${state.brandName} · ${state.companyLine}`} />
      {state.invoices.map((invoice) => (
        <div key={invoice.id} className="mb-6">
          <SectionLabel>{invoice.label}</SectionLabel>
          <Card>
            <ReportLine
              label="Creator budget"
              value={formatRwf(invoice.creatorBudgetRwf)}
            />
            <ReportLine label="Platform fee (20%)" value={formatRwf(invoice.feeRwf)} />
            <ReportLine label="Invoice total" value={formatRwf(invoice.totalRwf)} strong />
            <ReportLine
              label="Status"
              value={invoice.status === "paid" ? "Paid ✓" : "Pending"}
              tone={invoice.status === "paid" ? "success" : "warning"}
            />
          </Card>
        </div>
      ))}
    </>
  );
}
