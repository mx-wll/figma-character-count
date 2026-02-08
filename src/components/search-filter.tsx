"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const currentPricing = searchParams.get("pricing") ?? "";

  const applyFilters = useCallback(
    (q: string, pricing: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (pricing) params.set("pricing", pricing);
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : "/");
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(query, currentPricing);
  };

  const handlePricingChange = (value: string) => {
    const pricing = value === "all" ? "" : value;
    applyFilters(query, pricing);
  };

  const handleClear = () => {
    setQuery("");
    applyFilters("", currentPricing);
  };

  const hasQuery = query.length > 0;

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Artikel suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-8"
        />
        {hasQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            <X />
            <span className="sr-only">Suche leeren</span>
          </Button>
        )}
      </div>

      <Select
        value={currentPricing || "all"}
        onValueChange={handlePricingChange}
      >
        <SelectTrigger className="w-[140px] shrink-0">
          <SelectValue placeholder="Alle Preise" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Preise</SelectItem>
          <SelectItem value="free">Zu verschenken</SelectItem>
          <SelectItem value="lending">Zum Leihen</SelectItem>
          <SelectItem value="other">Sonstiges</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
