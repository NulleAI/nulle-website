type SectionLabelProps = {
  index: string;
  children: React.ReactNode;
  className?: string;
};

/** The small mono marker that opens every section: "02 — Philosophy". */
export function SectionLabel({ index, children, className = "" }: SectionLabelProps) {
  return (
    <p className={`label flex items-center gap-3 ${className}`} data-reveal>
      <span>{index}</span>
      <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
      <span>{children}</span>
    </p>
  );
}
