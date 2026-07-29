"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (res.error) {
      setError(t("error"));
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        className={inputClass}
        type="email"
        placeholder={t("email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className={inputClass}
        type="password"
        placeholder={t("password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {t("signIn")}
      </button>
      {googleEnabled ? (
        <button
          type="button"
          onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/account" })}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          {t("google")}
        </button>
      ) : null}
    </form>
  );
}
