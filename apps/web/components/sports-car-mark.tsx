/** A low, wedge-profile sports-car silhouette used as the AutoRent logo mark. */
export function SportsCarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 5 66 22" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 18C4 16.6 4.7 15.7 5.9 15.3L10 13.9C15 12 20 10.5 27 9.7C29.5 9.4 32 9.3 34 9.6C36 9.9 37.4 10.6 38.3 11.8L42.5 15L55 16.4C59 16.9 61.5 17.5 62.6 18.3C63 18.7 62.8 19 62.2 19L4 18.5Z" />
      <circle cx="13.5" cy="18.5" r="4.3" />
      <circle cx="50.5" cy="18.5" r="4.3" />
      <circle cx="13.5" cy="18.5" r="1.7" className="fill-primary" />
      <circle cx="50.5" cy="18.5" r="1.7" className="fill-primary" />
    </svg>
  );
}
