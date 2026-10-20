"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { url?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setLoading(false);
  }

  return (
    <Button onClick={upgrade} disabled={loading}>
      {loading ? "Redirecionando..." : "Assinar Pro"}
    </Button>
  );
}
