import { createClient } from "@/lib/supabase/server";
import { ItemCard } from "@/components/item-card";
import { RefreshButton } from "@/components/refresh-button";
import { SearchFilter } from "@/components/search-filter";
import type { ItemWithSeller } from "@/lib/types/database";
import type { PricingType } from "@/lib/types/database";

const VALID_PRICING_TYPES: PricingType[] = ["free", "lending", "other"];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pricing?: string }>;
}) {
  const { q, pricing } = await searchParams;
  const supabase = await createClient();

  const searchQuery = q?.trim() ?? "";
  const pricingFilter =
    pricing && VALID_PRICING_TYPES.includes(pricing as PricingType)
      ? (pricing as PricingType)
      : "";

  let query = supabase
    .from("items")
    .select(
      `
      *,
      seller:profiles!seller_id (
        id,
        name,
        avatar_url
      )
    `
    )
    .eq("status", "available");

  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }

  if (pricingFilter) {
    query = query.eq("pricing_type", pricingFilter);
  }

  const { data: items } = await query.order("created_at", { ascending: false });

  const feed = (items ?? []) as unknown as ItemWithSeller[];
  const isFiltering = searchQuery || pricingFilter;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kinderkreisel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Secondhand Kinderartikel in deiner Nachbarschaft.
          </p>
        </div>
        <RefreshButton />
      </div>

      <SearchFilter />

      {feed.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">
            {isFiltering
              ? "Keine Artikel gefunden. Versuch es mit einem anderen Suchbegriff."
              : "Noch keine Artikel vorhanden."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {feed.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
