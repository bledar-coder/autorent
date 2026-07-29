/**
 * Typed client for the AutoRent API (`/api/v1`), shared by web and mobile.
 * The API returns errors as `{ error: { code, message } }`; this client
 * surfaces them as a typed `ApiClientError`. Business rules live server-side —
 * this client only transports.
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

/** Vehicle as serialized by the API (dates/relations flattened to JSON). */
export interface ApiVehicle {
  id: string;
  slug: string;
  name: string;
  make: string;
  model: string;
  year: number;
  class: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyRateCents: number;
  weeklyRateCents: number;
  monthlyRateCents: number;
  depositCents: number;
  description: string | null;
  features: string[];
  photos: string[];
  status: string;
}

export interface ApiReview {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string };
}

export type ApiVehicleDetail = ApiVehicle & { reviews: ApiReview[] };

export interface VehicleQuery {
  class?: string;
  transmission?: string;
  seats?: number;
  maxPrice?: number;
  from?: string;
  to?: string;
}

export interface BookingCreatePayload {
  vehicleSlug: string;
  startAt: string;
  endAt: string;
  extraIds?: string[];
  promoCode?: string;
  customer: { name: string; email: string; phone: string };
}

export interface BookingCreatedResponse {
  reference: string;
  bookingId: string;
  clientSecret: string;
  totalCents: number;
}

function toQueryString(query: VehicleQuery = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
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

  return {
    request,
    listVehicles: (query?: VehicleQuery) =>
      request<{ vehicles: ApiVehicle[] }>(`/api/v1/vehicles${toQueryString(query)}`).then((r) => r.vehicles),
    getVehicle: (slug: string) =>
      request<{ vehicle: ApiVehicleDetail }>(`/api/v1/vehicles/${slug}`).then((r) => r.vehicle),
    createBooking: (payload: BookingCreatePayload) =>
      request<BookingCreatedResponse>(`/api/v1/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
