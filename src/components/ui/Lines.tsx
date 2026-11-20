type LinesProps = {
  lines: React.ReactNode[];
  className?: string;
};

/**
 * A heading set in authored lines. Each line sits in a mask so the
 * scroll motion layer can raise it into place. Without JavaScript, or
 * with reduced motion, the lines simply render where they belong.
 */
export function Lines({ lines, className = "" }: LinesProps) {
  return (
    <span data-reveal-lines className={`block ${className}`}>
      {lines.map((line, index) => (
        <span key={index} className="mask">
          <span data-line>{line}</span>
        </span>
      ))}
    </span>
  );
}
