"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

/** "My bookings" nav item — shown in the primary nav only when signed in. */
export function NavAccountLink() {
  const nav = useTranslations("nav");
  const { data: session } = authClient.useSession();
  if (!session) return null;

  return (
    <Link href="/account" className="text-sm text-muted transition-colors hover:text-foreground">
      {nav("account")}
    </Link>
  );
}
