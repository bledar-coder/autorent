"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { vehicleClasses, transmissions } from "@autorent/schemas";
import { formatVehicleClass, titleCase } from "@/lib/format";

const SEAT_OPTIONS = [2, 4, 5, 7];

export function FleetFilters() {
  const t = useTranslations("fleet");
  const common = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground";
  const val = (key: string) => sp.get(key) ?? "";

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="grid gap-1.5">
        <label className="text-sm text-muted" htmlFor="f-class">
          {t("class")}
        </label>
        <select
          id="f-class"
          className={selectClass}
          value={val("class")}
          onChange={(e) => setParam("class", e.target.value)}
        >
          <option value="">{t("any")}</option>
          {vehicleClasses.map((c) => (
            <option key={c} value={c}>
              {formatVehicleClass(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm text-muted" htmlFor="f-trans">
          {t("transmission")}
        </label>
        <select
          id="f-trans"
          className={selectClass}
          value={val("transmission")}
          onChange={(e) => setParam("transmission", e.target.value)}
        >
          <option value="">{t("any")}</option>
          {transmissions.map((tr) => (
            <option key={tr} value={tr}>
              {titleCase(tr)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm text-muted" htmlFor="f-seats">
          {t("seats")}
        </label>
        <select
          id="f-seats"
          className={selectClass}
          value={val("seats")}
          onChange={(e) => setParam("seats", e.target.value)}
        >
          <option value="">{t("any")}</option>
          {SEAT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}+
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm text-muted" htmlFor="f-price">
          {t("maxPrice")}
        </label>
        <input
          id="f-price"
          type="number"
          min={0}
          className={selectClass}
          value={val("maxPrice")}
          onChange={(e) => setParam("maxPrice", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1.5">
          <label className="text-sm text-muted" htmlFor="f-from">
            {t("pickup")}
          </label>
          <input
            id="f-from"
            type="date"
            className={selectClass}
            value={val("from")}
            onChange={(e) => setParam("from", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm text-muted" htmlFor="f-to">
            {t("return")}
          </label>
          <input
            id="f-to"
            type="date"
            className={selectClass}
            value={val("to")}
            onChange={(e) => setParam("to", e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
      >
        {common("clear")}
      </button>
    </aside>
  );
}
