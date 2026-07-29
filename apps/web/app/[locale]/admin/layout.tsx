import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border p-4 md:flex">
        <Link href="/admin" className="mb-6 block px-3 text-lg font-bold tracking-tight">
          Auto<span className="text-primary">Rent</span>{" "}
          <span className="text-sm font-medium text-muted">Admin</span>
        </Link>
        <AdminNav />
        <Link href="/" className="mt-auto px-3 py-2 text-xs text-muted hover:text-foreground">
          &larr; Back to site
        </Link>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b border-border p-4 md:hidden">
          <AdminNav />
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
