"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <p className="mt-2 text-xs text-success">{t("reviewThanks")}</p>;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-primary hover:underline"
      >
        {t("reviewCta")}
      </button>
    );
  }

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/v1/bookings/${bookingId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border bg-surface-elevated p-3 text-left">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n}`}>
            <Star className={`h-5 w-5 ${n <= rating ? "fill-warning text-warning" : "text-muted"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("reviewComment")}
        maxLength={1000}
        rows={3}
        className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
      >
        {t("reviewSubmit")}
      </button>
    </div>
  );
}
