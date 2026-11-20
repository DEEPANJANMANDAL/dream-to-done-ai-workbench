export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-lg bg-gradient-scan shadow-glow ${className}`}>
      <svg viewBox="0 0 24 24" className="size-[62%] text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6l-8-3Z" />
        <path d="M7.5 12.5h2.2l1.4-3 2 6 1.4-3h2" />
      </svg>
    </span>
  );
}
