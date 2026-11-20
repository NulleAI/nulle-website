type ArrowProps = {
  direction?: "right" | "down" | "up-right";
  className?: string;
};

const paths: Record<NonNullable<ArrowProps["direction"]>, string> = {
  right: "M1 6h10M6.5 1.5 11 6l-4.5 4.5",
  down: "M6 1v10M1.5 6.5 6 11l4.5-4.5",
  "up-right": "M2 10 10 2M3.5 2H10v6.5",
};

/** A small, purely decorative arrow. Moves a few pixels on hover via CSS. */
export function Arrow({ direction = "right", className = "" }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={`arrow ${direction === "down" ? "arrow-down" : ""} shrink-0 ${className}`}
    >
      <path d={paths[direction]} stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
