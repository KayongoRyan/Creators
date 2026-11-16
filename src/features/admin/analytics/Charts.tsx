"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformDailyMetric } from "@/types";
import type { AnalyticsSummary } from "./selectors";

const axisStyle = { fontSize: 11, fill: "#737373" };
const gridStroke = "#e5e5e5";
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.12)",
  fontSize: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

function shortDay(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function compactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}

function compactRwf(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function TrafficTrendChart({ data }: { data: PlatformDailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111111" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#111111" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={compactNumber}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => shortDay(String(value))}
          formatter={(value: unknown, name: unknown) => [
            Number(value).toLocaleString("en-US"),
            String(name) === "visitors" ? "Visitors" : "Page views",
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => (value === "visitors" ? "Visitors" : "Page views")}
        />
        <Area isAnimationActive={false}
          type="monotone"
          dataKey="visitors"
          stroke="#111111"
          strokeWidth={2}
          fill="url(#visitorsFill)"
        />
        <Line isAnimationActive={false}
          type="monotone"
          dataKey="pageViews"
          stroke="#a3a3a3"
          strokeWidth={1.6}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function SignupTrendChart({ data }: { data: PlatformDailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChartLite data={data} />
    </ResponsiveContainer>
  );
}

function AreaChartLite({ data }: { data: PlatformDailyMetric[] }) {
  return (
    <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      <CartesianGrid stroke={gridStroke} vertical={false} />
      <XAxis
        dataKey="date"
        tickFormatter={shortDay}
        tick={axisStyle}
        tickLine={false}
        axisLine={false}
        minTickGap={28}
      />
      <YAxis
        tickFormatter={compactNumber}
        tick={axisStyle}
        tickLine={false}
        axisLine={false}
        width={42}
      />
      <Tooltip
        contentStyle={tooltipStyle}
        labelFormatter={(value) => shortDay(String(value))}
        formatter={(value: unknown, name: unknown) => [
          Number(value).toLocaleString("en-US"),
          String(name) === "signups" ? "Sign-ups" : "Active users",
        ]}
      />
      <Legend
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        formatter={(value) => (value === "signups" ? "Sign-ups" : "Active users")}
      />
      <Area isAnimationActive={false}
        type="monotone"
        dataKey="signups"
        stroke="#059669"
        strokeWidth={2}
        fill="#059669"
        fillOpacity={0.12}
      />
      <Line isAnimationActive={false}
        type="monotone"
        dataKey="activeUsers"
        stroke="#737373"
        strokeWidth={1.6}
        dot={false}
      />
    </ComposedChart>
  );
}

export function ActivityTrendChart({ data }: { data: PlatformDailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={compactNumber}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={42}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => shortDay(String(value))}
          formatter={(value: unknown, name: unknown) => [
            Number(value).toLocaleString("en-US"),
            name === "campaignApplications"
              ? "Campaign applications"
              : name === "submissions"
                ? "Submissions"
                : "Campaigns created",
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) =>
            value === "campaignApplications"
              ? "Campaign applications"
              : value === "submissions"
                ? "Submissions"
                : "Campaigns created"
          }
        />
        <Line isAnimationActive={false}
          type="monotone"
          dataKey="campaignsCreated"
          stroke="#111111"
          strokeWidth={2}
          dot={false}
        />
        <Line isAnimationActive={false}
          type="monotone"
          dataKey="campaignApplications"
          stroke="#059669"
          strokeWidth={2}
          dot={false}
        />
        <Line isAnimationActive={false}
          type="monotone"
          dataKey="submissions"
          stroke="#a3a3a3"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueTrendChart({ data }: { data: PlatformDailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={compactRwf}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => shortDay(String(value))}
          formatter={(value: unknown, name: unknown) => [
            `RWF ${Number(value).toLocaleString("en-US")}`,
            name === "collectionsRwf" ? "Collections" : "Creator payouts",
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) =>
            value === "collectionsRwf" ? "Collections" : "Creator payouts"
          }
        />
        <Bar isAnimationActive={false} dataKey="collectionsRwf" fill="#111111" radius={[3, 3, 0, 0]} />
        <Bar isAnimationActive={false} dataKey="payoutsRwf" fill="#d4d4d4" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ summary }: { summary: AnalyticsSummary }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={summary.funnel}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke={gridStroke} horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={compactNumber}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="stage"
          width={132}
          tick={{ fontSize: 11, fill: "#404040" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: unknown, _name: unknown, item: unknown) => {
            const conversion = (item as { payload?: { conversion?: number | null } })
              ?.payload?.conversion;
            return [
              `${Number(value).toLocaleString("en-US")}${
                conversion == null ? "" : ` · ${conversion}% of previous step`
              }`,
              "Count",
            ];
          }}
        />
        <Bar isAnimationActive={false} dataKey="value" fill="#111111" radius={[0, 4, 4, 0]} barSize={18}>
          {summary.funnel.map((stage, index) => (
            <Cell
              key={stage.stage}
              fill={
                ["#111111", "#262626", "#404040", "#525252", "#737373", "#a3a3a3"][
                  index % 6
                ]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SourceChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid stroke={gridStroke} horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={compactNumber}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={78}
          tick={{ fontSize: 11, fill: "#404040" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: unknown) => [
            Number(value).toLocaleString("en-US"),
            "Visitors",
          ]}
        />
        <Bar isAnimationActive={false} dataKey="value" fill="#111111" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const deviceColors = ["#111111", "#737373", "#d4d4d4"];

export function DeviceChart({
  data,
}: {
  data: Array<{ label: string; share: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie isAnimationActive={false}
          data={data}
          dataKey="share"
          nameKey="label"
          innerRadius={54}
          outerRadius={82}
          paddingAngle={2}
          stroke="#ffffff"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={deviceColors[index % deviceColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: unknown, name: unknown) => [
            `${Number(value)}%`,
            String(name),
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
