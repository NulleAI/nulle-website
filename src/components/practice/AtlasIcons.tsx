/* ------------------------------------------------------------------
   Atlas's icon set: flat line icons on a 24px grid with a 1.5px stroke
   and round ends, drawn for this app. They take the current colour, so
   they read in ink, teal, or white on a photograph.
   ------------------------------------------------------------------ */

type IconProps = { className?: string };

function Icon({ className = "", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

/** The concierge at work. */
export function SparkleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7Z" />
      <path d="M18.5 15.5l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6Z" />
    </Icon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5.5M6.5 11 12 5.5l5.5 5.5" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5.5M11 6l-6 6 6 6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.25 4.25L19 7" />
    </Icon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 3.75h11v16.5L12 16.25l-5.5 4Z" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.75" y="5" width="16.5" height="15.25" rx="2" />
      <path d="M3.75 9.75h16.5M8 3v4M16 3v4" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 14.25A7.75 7.75 0 1 1 9.75 4.5a6.25 6.25 0 0 0 9.75 9.75Z" />
    </Icon>
  );
}

export function GuestsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="7.75" r="3.25" />
      <path d="M3 19.5c.6-3.2 3-5.25 6-5.25s5.4 2.05 6 5.25M15.75 4.75a3.25 3.25 0 0 1 0 6M17.5 14.6c1.8.7 3 2.4 3.5 4.9" />
    </Icon>
  );
}

export function BedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5.5v14M3 15.25h18M21 19.5v-6.75a3 3 0 0 0-3-3h-7.5v5.5" />
      <circle cx="6.75" cy="11.75" r="1.75" />
    </Icon>
  );
}

export function DiningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 3v18M4.5 3v4.75a2.5 2.5 0 0 0 5 0V3M17.5 21V3c-2 1.1-3.25 3.4-3.25 6.25V13.5h3.25" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </Icon>
  );
}

export function TeaIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 9.5h12v3.75a6 6 0 0 1-12 0Z" />
      <path d="M16.5 10.75h1.25a2.25 2.25 0 0 1 0 4.5H16.1M8 3.5c-.75.85-.75 1.65 0 2.5M12.5 3.5c-.75.85-.75 1.65 0 2.5" />
    </Icon>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 19.25C5 11.5 9.75 6 19.25 4.75 19.25 14 14 19.25 5 19.25Z" />
      <path d="M5 19.25 13 11.25" />
    </Icon>
  );
}

export function TrainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="3.25" width="14" height="14.5" rx="3" />
      <path d="M5 11h14M8.5 21l1.75-3.25M15.5 21l-1.75-3.25" />
      <path d="M8.75 14.25h.01M15.25 14.25h.01" strokeWidth="2" />
    </Icon>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="m15.25 8.75-2 4.5-4.5 2 2-4.5Z" />
    </Icon>
  );
}

export function SuitcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.75" y="7.25" width="16.5" height="12.5" rx="2" />
      <path d="M9 7.25V5.5A1.75 1.75 0 0 1 10.75 3.75h2.5A1.75 1.75 0 0 1 15 5.5v1.75M3.75 12.75h16.5" />
    </Icon>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.25" r="3.75" />
      <path d="M5 20.25c.8-3.5 3.6-5.6 7-5.6s6.2 2.1 7 5.6" />
    </Icon>
  );
}
