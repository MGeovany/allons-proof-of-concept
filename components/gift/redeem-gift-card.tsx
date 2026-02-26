"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemGiftToken } from "@/lib/tickets-actions";

export function RedeemGiftCard({ token, eventId }: { token: string; eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleRedeem() {
    if (loading) return;
    setLoading(true);
    setError(null);
    const result = await redeemGiftToken(token);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    router.push(eventId ? `/home/event/${eventId}/codigo` : "/home/tickets");
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Redimido. Redirigiendo…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="button"
        onClick={handleRedeem}
        disabled={loading}
        className="w-full rounded-2xl bg-orange-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Redimiendo…" : "Redimir entrada"}
      </button>
    </div>
  );
}

