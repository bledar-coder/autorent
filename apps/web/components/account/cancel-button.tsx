"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function CancelButton({ bookingId }: { bookingId: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!window.confirm(t("cancelConfirm"))) return;
    setLoading(true);
    await fetch(`/api/v1/bookings/${bookingId}/cancel`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={loading}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      {t("cancel")}
    </button>
  );
}
