const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole rental days between pick-up and return (minimum 1). */
export function rentalDays(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
}
