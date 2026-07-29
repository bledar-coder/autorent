"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthMenu() {
  const auth = useTranslations("auth");
  const nav = useTranslations("nav");
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span className="h-8 w-16" />;

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {auth("signIn")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="text-sm text-muted transition-colors hover:text-foreground">
        {nav("account")}
      </Link>
      <button
        type="button"
        onClick={() => authClient.signOut().then(() => window.location.reload())}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        {auth("signOut")}
      </button>
    </div>
  );
}
