/** Simple 24px line icons for service cards. Generic shapes only, no state symbols. */
const PATHS: Record<string, React.ReactNode> = {
  passport: (<><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 16h6" /></>),
  idcard: (<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="11" r="2" /><path d="M6 15.5c.6-1.2 1.5-1.8 2.5-1.8s1.9.6 2.5 1.8M14 10h4M14 13h3" /></>),
  certificate: (<><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 11h7M9 14h7M9 17h4" /></>),
  family: (<><circle cx="8" cy="7" r="2.5" /><circle cx="16" cy="7" r="2.5" /><path d="M3.5 19c.5-3.5 2.2-5.5 4.5-5.5s4 2 4.5 5.5M11.5 19c.5-3.5 2.2-5.5 4.5-5.5s4 2 4.5 5.5" /></>),
  scale: (<><path d="M12 4v16M7 20h10M5 7h14" /><path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z" /></>),
  seal: (<><circle cx="12" cy="10" r="6" /><path d="M9 15l-1.5 6 4.5-2.5 4.5 2.5L15 15" /><path d="M9.8 10l1.6 1.6 3-3" /></>),
  receipt: (<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 11h6M9 14h3" /></>),
  shield: (<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M12 9v6M9 12h6" /></>),
  cap: (<><path d="M2.5 9.5L12 5l9.5 4.5L12 14z" /><path d="M6.5 11.5V16c1.5 1.3 3.4 2 5.5 2s4-.7 5.5-2v-4.5M21.5 9.5V15" /></>),
  house: (<><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10M10 20v-5h4v5" /></>),
};

export function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name] ?? PATHS.certificate}
    </svg>
  );
}

export function ExternalIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`${className} rtl:-scale-x-100`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h4v4M13 3L7 9M11 9.5V13H3V5h3.5" />
    </svg>
  );
}

export function SendIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`${className} rtl:-scale-x-100`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h11M10.5 5.5L15 10l-4.5 4.5" />
    </svg>
  );
}
