"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useEffect } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "";
    console.log("🔗 Convex URL:", url);
    if (!url) {
      console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
    }
    return new ConvexReactClient(url);
  }, []);

  useEffect(() => {
    console.log("✅ ConvexClientProvider mounted");
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
