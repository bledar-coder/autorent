/**
 * Typed client for the AutoRent API (`/api/v1`), shared by web and mobile.
 * The API returns errors as `{ error: { code, message } }`; this client
 * surfaces them as a typed `ApiClientError`. Endpoint methods are added as the
 * API grows in Phase 1.
 */

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  /** Extra headers (e.g. an auth token on mobile). */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
}

export function createApiClient({ baseUrl, headers }: ApiClientOptions) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const extra = headers ? await headers() : {};
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...extra, ...(init?.headers ?? {}) },
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const body = data as ApiErrorBody | null;
      throw new ApiClientError(
        body?.error?.code ?? "unknown_error",
        body?.error?.message ?? res.statusText,
        res.status,
      );
    }
    return data as T;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
