"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function NotificationBell() {
  const { data: session } = authClient.useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session) {
      setCount(0);
      return;
    }
    fetch("/api/v1/notifications/unread-count")
      .then((r) => r.json())
      .then((d: { count?: number }) => setCount(d.count ?? 0))
      .catch(() => {});
  }, [session]);

  if (!session) return null;

  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative text-muted transition-colors hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
