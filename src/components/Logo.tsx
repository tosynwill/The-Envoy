export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="#E6B86A" strokeWidth="1.5" />
      <circle
        cx="24"
        cy="24"
        r="21"
        stroke="#E6B86A"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeDasharray="2 4"
        transform="rotate(15 24 24)"
      />
      <path
        d="M24 10.5c3.2 4.9 7.5 7.8 7.5 13.4a7.5 7.5 0 0 1-15 0c0-2.2 1-4.1 2.4-5.8.4 1.7 1.3 2.8 2.4 3.3-.6-3.9.5-7.6 2.7-10.9Z"
        fill="#E6B86A"
      />
      <path d="M15 36.5h18" stroke="#E6B86A" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
