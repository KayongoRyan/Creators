import { PageHeader } from "@/components/shared/PageHeader";
import { BrandSummary, getBrands } from "@/features/brands";

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <PageHeader title="Brands" />
      <div className="grid gap-4 sm:grid-cols-2">
        {brands.map((brand) => (
          <BrandSummary
            key={brand.id}
            name={brand.name}
            activeCampaigns={brand.activeCampaigns}
          />
        ))}
      </div>
    </>
  );
}
