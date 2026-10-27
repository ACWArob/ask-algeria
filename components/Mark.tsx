/** Brand mark: an open arched doorway with a question inside. Deliberately not a state emblem or flag. */
export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" className="fill-door" />
      <path d="M8 27V15a8 8 0 0 1 16 0v12" fill="none" className="stroke-door-ink" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13.4 14.2a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.3 1-1.3 1.9v.7" fill="none" stroke="#F2C46D" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="22.6" r="1.4" fill="#F2C46D" />
    </svg>
  );
}
