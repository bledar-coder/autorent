"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function ContactForm({ email }: { email: string }) {
  const t = useTranslations("pages.contact");
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Website inquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}${from ? ` <${from}>` : ""}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{t("formTitle")}</h2>
      <div className="mt-4 space-y-3">
        <input className={field} placeholder={t("formName")} value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          className={field}
          type="email"
          placeholder={t("formEmail")}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        />
        <textarea
          className={field}
          rows={4}
          placeholder={t("formMessage")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Send className="h-4 w-4" />
        {t("formSend")}
      </button>
      <p className="mt-2 text-xs text-muted">{t("formNote")}</p>
    </form>
  );
}
