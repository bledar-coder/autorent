import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { createPromo, togglePromo } from "./actions";

export const dynamic = "force-dynamic";

const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Promo codes</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Value</th>
              <th className="px-4 py-2 font-medium">Valid</th>
              <th className="px-4 py-2 font-medium">Used</th>
              <th className="px-4 py-2 font-medium">Active</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  No promo codes yet.
                </td>
              </tr>
            ) : (
              promos.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{p.code}</td>
                  <td className="px-4 py-2">
                    {p.kind === "percentage" ? `${p.amount}%` : formatPrice(p.amount, "en")}
                  </td>
                  <td className="px-4 py-2 text-muted">
                    {formatDate(p.validFrom, "en")} &rarr; {formatDate(p.validUntil, "en")}
                  </td>
                  <td className="px-4 py-2 text-muted">
                    {p.usedCount}
                    {p.usageLimit !== null ? ` / ${p.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-2">
                    <span className={p.active ? "text-success" : "text-muted"}>{p.active ? "yes" : "no"}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <form action={togglePromo}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="active" value={p.active ? "false" : "true"} />
                      <button type="submit" className="text-xs text-muted hover:text-foreground">
                        {p.active ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold">New promo code</h2>
        <form action={createPromo} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Code</span>
            <input name="code" required className={`${field} uppercase`} placeholder="SUMMER25" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Type</span>
            <select name="kind" className={field} defaultValue="percentage">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (€)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Amount (% or €)</span>
            <input name="amount" type="number" step="0.01" required className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Usage limit (optional)</span>
            <input name="usageLimit" type="number" className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Valid from</span>
            <input name="validFrom" type="date" required className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Valid until</span>
            <input name="validUntil" type="date" required className={field} />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
            >
              Create promo
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
