/**
 * The site's small icon set: hand-drawn line icons on a 24px grid with
 * a 1.5px stroke, so they sit beside text without shouting. All are
 * decorative (aria-hidden); the text beside them carries the meaning.
 *
 * The Apple and Android marks are the platforms' own logos, used only to
 * say which platforms Nulle builds for.
 */

type IconProps = {
  className?: string;
};

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Svg({ className = "", children, filled = false }: IconProps & { children: React.ReactNode; filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={`shrink-0 ${className}`}
      {...(filled ? { fill: "currentColor" } : line)}
    >
      {children}
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.6 3.5h2.5l1.4 3.6-1.9 1.4a11.2 11.2 0 0 0 6.9 6.9l1.4-1.9 3.6 1.4v2.5a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.25" y="5.5" width="17.5" height="13" rx="2.25" />
      <path d="m3.75 7.25 8.25 6 8.25-6" />
    </Svg>
  );
}

export function LeadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="8.25" r="3.5" />
      <path d="M3.5 19.5c.8-3.3 3.3-5.25 6.5-5.25s5.7 1.95 6.5 5.25" />
      <path d="M18.75 7.5v5M16.25 10h5" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.25" />
      <path d="M3.5 9.75h17M8 3v4M16 3v4" />
      <path d="m9.25 14.75 1.9 1.9 3.6-3.6" />
    </Svg>
  );
}

export function QuestionIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M9.6 9.6a2.5 2.5 0 0 1 4.85.85c0 1.7-2.45 2.15-2.45 3.8" />
      <path d="M12 17.1v.15" />
    </Svg>
  );
}

/** Intelligence at work: one large spark and one small. */
export function SparkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 3.75 12.75 9l5.25 1.75-5.25 1.75L11 17.75 9.25 12.5 4 10.75 9.25 9Z" />
      <path d="m18.25 15.25.6 1.65 1.65.6-1.65.6-.6 1.65-.6-1.65-1.65-.6 1.65-.6Z" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.25 4.25L19 7" />
    </Svg>
  );
}

/** Steps joined into one flow. */
export function FlowIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="5.5" cy="6.5" r="2.25" />
      <circle cx="18.5" cy="6.5" r="2.25" />
      <circle cx="12" cy="17.5" r="2.25" />
      <path d="M7.75 6.5h8.5M17.2 8.45l-3.9 7.1M6.8 8.45l3.9 7.1" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="10.25" width="14.5" height="10" rx="2.25" />
      <path d="M8 10.25V7.5a4 4 0 0 1 8 0v2.75" />
      <path d="M12 14.25v2" />
    </Svg>
  );
}

export function DeviceIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.25" y="2.75" width="11.5" height="18.5" rx="2.5" />
      <path d="M10.5 18h3" />
    </Svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.75 3.25H7.5a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8Z" />
      <path d="M13.5 3.5V8h4.75M9 12.5h6M9 16h4" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Svg>
  );
}

/** Start a new conversation. */
export function ComposeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11.5 4.5H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V12.5" />
      <path d="M17.6 3.9a1.9 1.9 0 0 1 2.7 2.7l-7.05 7.05-3.35.85.85-3.35Z" />
    </Svg>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="3.25" width="6" height="11" rx="3" />
      <path d="M5.75 11a6.25 6.25 0 0 0 12.5 0M12 17.25v3.5" />
    </Svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19V5.5M6 11.5l6-6 6 6" />
    </Svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.15 6.85v.01" strokeWidth="2.25" />
    </Svg>
  );
}

export function AppleLogo(props: IconProps) {
  return (
    <Svg {...props} filled>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </Svg>
  );
}

export function AndroidLogo(props: IconProps) {
  return (
    <Svg {...props} filled>
      <path d="M17.523 15.341c-.551 0-.999-.448-.999-.999s.448-.999.999-.999.999.448.999.999-.448.999-.999.999m-11.046 0c-.551 0-.999-.448-.999-.999s.448-.999.999-.999.999.448.999.999-.448.999-.999.999m11.405-6.021 1.997-3.459a.416.416 0 0 0-.152-.568.416.416 0 0 0-.568.152l-2.022 3.503C15.59 8.244 13.853 7.851 12 7.851s-3.59.393-5.137 1.099L4.841 5.447a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.568l1.997 3.459C2.689 11.187.343 14.659 0 18.761h24c-.344-4.102-2.689-7.574-6.118-9.44" />
    </Svg>
  );
}
