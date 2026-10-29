import { PageHeader } from "@/components/shared/PageHeader";

const brands = [
  {
    title: "Primus Beer (Bralirwa)",
    status: "Active",
    lines: [
      "Contact: Eric M., Marketing Manager · eric@bralirwa.rw",
      "Campaigns run: 2 · Total spent: RWF 1.2M · MoMo: +250 788 123 456",
    ],
  },
  {
    title: "Iwacu Music",
    status: "Active",
    lines: [
      "Contact: Sandra N. · sandra@iwacumusic.rw",
      "Campaigns run: 1 · Total spent: RWF 400,000",
    ],
  },
  {
    title: "KCB Rwanda",
    status: "Pending payment",
    lines: [
      "Contact: Patrick U. · Invoice sent: RWF 960,000 · Awaiting transfer.",
    ],
  },
];

export default function AdminBrandsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Brand accounts"
        description="Clients who have run or are running campaigns"
      />
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {brands.map((brand) => (
          <li key={brand.title} className="py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-semibold text-gray-900">{brand.title}</h2>
              <p className="text-sm font-medium text-gray-500">{brand.status}</p>
            </div>
            <div className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
              {brand.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
