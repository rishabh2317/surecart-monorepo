// app/search/page.tsx
import React, { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
