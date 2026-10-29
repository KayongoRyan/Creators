import { cn } from "@/lib/utils/cn";

const tagTones = {
  green: "bg-[#e9f1dc] text-[#265b19]",
  amber: "bg-[#f6eedf] text-[#5a4815]",
  blue: "bg-[#d6e4f6] text-[#3266ad]",
  gray: "bg-[#f5f4ed] text-[#3d3d3a]",
  red: "bg-[#f7ecec] text-[#7f2c28]",
} as const;

const avatarTones = {
  teal: "bg-[#e9f1dc] text-[#265b19]",
  blue: "bg-[#d6e4f6] text-[#3266ad]",
  amber: "bg-[#f6eedf] text-[#5a4815]",
  purple: "bg-[#eeedfe] text-[#3c3489]",
} as const;

export function Tag({
  tone,
  children,
}: {
  tone: keyof typeof tagTones;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-[3px] text-[11px] font-medium",
        tagTones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  initials,
  tone,
}: {
  initials: string;
  tone: keyof typeof avatarTones;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
        avatarTones[tone],
      )}
    >
      {initials}
    </span>
  );
}

export function PageIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-4">
      <h1 className="text-base font-medium text-[#141413]">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-xs text-[#3d3d3a]">{subtitle}</p>
      ) : null}
    </header>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#73726c]">
      {children}
    </p>
  );
}

export function StatGrid({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-[#f5f4ed] p-3">
          <p className="text-xl font-medium text-[#141413]">{item.value}</p>
          <p className="mt-0.5 text-[11px] text-[#3d3d3a]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-2 rounded-lg border border-[rgba(31,30,29,0.15)] bg-white p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  tag,
}: {
  title: string;
  tag?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-medium text-[#141413]">{title}</h2>
      {tag}
    </div>
  );
}

export function Meta({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-[#3d3d3a] [&_strong]:font-medium [&_strong]:text-[#141413]">
      {children}
    </p>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-start gap-2 rounded-lg border border-[rgba(31,30,29,0.15)] bg-[#e9f1dc] px-3.5 py-2.5 text-xs text-[#265b19]">
      <span aria-hidden="true">✓</span>
      <span>{children}</span>
    </p>
  );
}

export function ReportLine({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(31,30,29,0.15)] py-1.5 text-xs last:border-b-0">
      <span className={strong ? "font-medium text-[#141413]" : undefined}>
        {label}
      </span>
      <span
        className={cn(
          strong && "font-medium text-[#141413]",
          tone === "success" && "font-medium text-[#265b19]",
          tone === "warning" && "font-medium text-[#5a4815]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PersonRow({
  initials,
  tone,
  name,
  handle,
  aside,
}: {
  initials: string;
  tone: keyof typeof avatarTones;
  name: string;
  handle: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[rgba(31,30,29,0.15)] py-2 last:border-b-0">
      <Avatar initials={initials} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#141413]">{name}</p>
        <p className="text-[11px] text-[#3d3d3a]">{handle}</p>
      </div>
      {aside}
    </div>
  );
}
