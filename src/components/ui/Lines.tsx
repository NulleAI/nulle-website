import { Fragment } from "react";

type LinesProps = {
  lines: React.ReactNode[];
  className?: string;
};

/**
 * A heading set in authored lines. Each line sits in a mask so the
 * scroll motion layer can raise it into place. Without JavaScript, or
 * with reduced motion, the lines simply render where they belong.
 *
 * A space separates the lines in the text itself. The masks are blocks,
 * so it never shows, but search engines, AI crawlers and screen readers
 * read "From possibility to reality." instead of "possibilityto".
 */
export function Lines({ lines, className = "" }: LinesProps) {
  return (
    <span data-reveal-lines className={`block ${className}`}>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span className="mask">
            <span data-line>{line}</span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}
