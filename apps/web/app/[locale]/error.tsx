"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold tracking-tight text-primary">Oops</p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        An unexpected error occurred. Please try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-surface"
        >
          Back home
        </a>
      </div>
    </main>
  );
}
