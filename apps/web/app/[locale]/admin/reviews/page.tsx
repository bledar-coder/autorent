import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { moderateReview } from "./actions";

export const dynamic = "force-dynamic";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-warning" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span className="text-muted">{"☆".repeat(5 - n)}</span>
    </span>
  );
}

function ReviewCard({
  review,
  showActions,
}: {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: Date;
    vehicle: { name: string };
    user: { name: string };
  };
  showActions: boolean;
}) {
  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Stars n={review.rating} />
          <p className="mt-1 text-sm font-medium">
            {review.user.name} · <span className="text-muted">{review.vehicle.name}</span>
          </p>
          {review.comment ? <p className="mt-1 text-sm text-muted">{review.comment}</p> : null}
          <p className="mt-1 text-xs text-muted">{formatDate(review.createdAt, "en")}</p>
        </div>
        {showActions ? (
          <div className="flex shrink-0 gap-2">
            <form action={moderateReview}>
              <input type="hidden" name="id" value={review.id} />
              <input type="hidden" name="status" value="approved" />
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                Approve
              </button>
            </form>
            <form action={moderateReview}>
              <input type="hidden" name="id" value={review.id} />
              <input type="hidden" name="status" value="rejected" />
              <button className="rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive">
                Reject
              </button>
            </form>
          </div>
        ) : (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${
              review.status === "approved" ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
            }`}
          >
            {review.status}
          </span>
        )}
      </div>
    </li>
  );
}

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { vehicle: { select: { name: true } }, user: { select: { name: true } } },
  });
  const pending = reviews.filter((r) => r.status === "pending");
  const moderated = reviews.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Pending {pending.length > 0 ? <span className="text-muted">({pending.length})</span> : null}
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-muted">Nothing to moderate.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <ReviewCard key={r.id} review={r} showActions />
            ))}
          </ul>
        )}
      </section>

      {moderated.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Moderated</h2>
          <ul className="space-y-3">
            {moderated.map((r) => (
              <ReviewCard key={r.id} review={r} showActions={false} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
